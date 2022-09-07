"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const class_transformer_1 = require("class-transformer");
const bignumber_js_1 = require("bignumber.js");
const jwt_1 = require("@nestjs/jwt");
const SendGrid = require("@sendgrid/mail");
const users_service_1 = require("../users/users.service");
const contract_service_1 = require("../contract/contract.service");
const archive_service_1 = require("../archive/archive.service");
const user_entity_1 = require("../users/user.entity");
const contract_types_1 = require("../common/contract.types");
const notification_entity_1 = require("./notification.entity");
const config_1 = require("../common/config");
const UNSUBSCRIBE_COMMAND = 'unsubscribe';
const EACH_5_SECONDS = '*/5 * * * * *';
let NotificationsService = class NotificationsService {
    constructor(notificationsRepository, connection, usersService, contractService, archiveService, jwtService) {
        this.notificationsRepository = notificationsRepository;
        this.connection = connection;
        this.usersService = usersService;
        this.contractService = contractService;
        this.archiveService = archiveService;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger('Cron');
        this.isBusy = false;
    }
    findDueNotification(accountId, streamId) {
        return this.notificationsRepository.findOne({
            where: {
                accountId,
                streamId,
                type: notification_entity_1.NotificationType.StreamIsDue,
            },
        });
    }
    async generateIfNotBusy() {
        if (this.isBusy) {
            this.logger.log('Busy processing streams, skipped.');
            return;
        }
        const start = Date.now();
        try {
            this.isBusy = true;
            this.logger.log('Starting processing streams...');
            await this.processAllUsersStreams();
            this.logger.log(`Finished processing streams in ${Date.now() - start}ms.`);
        }
        catch (error) {
            this.logger.error(`Failed processing streams after ${Date.now() - start}ms.`, error.message, error.stack);
        }
        finally {
            this.isBusy = false;
        }
    }
    async processAllUsersStreams() {
        const users = await this.usersService.findAll();
        await Promise.all(users.map(async (user) => {
            const currentStreams = await this.contractService.getStreams(user.accountId);
            await this.processUserStreams(user, currentStreams);
        }));
    }
    array2Map(array, key) {
        return array.reduce((map, item) => {
            map[item[key]] = item;
            return map;
        }, {});
    }
    async getNotification(accountId, previousStream, currentStream) {
        var _a;
        const commonData = {
            accountId,
            streamId: currentStream === null || currentStream === void 0 ? void 0 : currentStream.id,
            createdAt: new Date(),
            payload: { stream: currentStream },
        };
        const previousStatus = previousStream === null || previousStream === void 0 ? void 0 : previousStream.status;
        const currentStatus = currentStream === null || currentStream === void 0 ? void 0 : currentStream.status;
        if (currentStatus === previousStatus &&
            new bignumber_js_1.default(currentStream.balance).isGreaterThan(previousStream.balance)) {
            return Object.assign(Object.assign({}, commonData), { payload: {
                    stream: currentStream,
                    fundsAdded: new bignumber_js_1.default(currentStream.balance)
                        .minus(previousStream.balance)
                        .toFixed(),
                }, type: notification_entity_1.NotificationType.StreamFundsAdded });
        }
        if ((!previousStatus || previousStatus === contract_types_1.StringStreamStatus.Initialized) &&
            currentStatus &&
            currentStatus !== contract_types_1.StringStreamStatus.Initialized) {
            return Object.assign(Object.assign({}, commonData), { type: notification_entity_1.NotificationType.StreamStarted });
        }
        else if (currentStatus === contract_types_1.StringStreamStatus.Paused &&
            previousStatus !== currentStatus) {
            return Object.assign(Object.assign({}, commonData), { type: notification_entity_1.NotificationType.StreamPaused });
        }
        else if (currentStatus === contract_types_1.StringStreamStatus.Active &&
            previousStatus === contract_types_1.StringStreamStatus.Paused) {
            return Object.assign(Object.assign({}, commonData), { type: notification_entity_1.NotificationType.StreamContinued });
        }
        else if (currentStatus === contract_types_1.StringStreamStatus.Active &&
            previousStatus === contract_types_1.StringStreamStatus.Active) {
            if (previousStream.wasDue) {
                currentStream.wasDue = true;
            }
            if (previousStream.hasPassedCliff) {
                currentStream.hasPassedCliff = true;
            }
            if (currentStream.receiver_id === accountId) {
                const secondsPassed = (Date.now() - Number(currentStream.last_action) / 1e6) / 1000;
                const streamIsDue = new bignumber_js_1.default(currentStream.tokens_per_sec)
                    .multipliedBy(secondsPassed)
                    .minus(currentStream.balance)
                    .isPositive();
                if (streamIsDue) {
                    const wasDue = (_a = previousStream.wasDue) !== null && _a !== void 0 ? _a : (await this.findDueNotification(accountId, currentStream.id));
                    if (!wasDue) {
                        currentStream.wasDue = true;
                        return Object.assign(Object.assign({}, commonData), { type: notification_entity_1.NotificationType.StreamIsDue });
                    }
                }
            }
            if (currentStream.cliff &&
                !previousStream.hasPassedCliff &&
                Date.now() > currentStream.cliff / 1000000) {
                currentStream.hasPassedCliff = true;
                return Object.assign(Object.assign({}, commonData), { type: notification_entity_1.NotificationType.StreamCliffPassed });
            }
        }
        else if (previousStatus && !currentStream) {
            const currentFinishedStream = await this.contractService.getStream(previousStream.id);
            if (previousStatus !== contract_types_1.StringStreamStatus.Initialized ||
                currentFinishedStream.tokens_total_withdrawn !== '0') {
                this.archiveService.create(Object.assign({}, commonData));
                return Object.assign(Object.assign({}, commonData), { streamId: currentFinishedStream.id, payload: { stream: currentFinishedStream }, type: notification_entity_1.NotificationType.StreamFinished });
            }
        }
    }
    async generateNotifications(user, currentStreams) {
        const previousStreamsMap = this.array2Map(user.streams, 'id');
        const currentStreamsMap = this.array2Map(currentStreams, 'id');
        const ids = Array.from(new Set([
            ...Object.keys(previousStreamsMap),
            ...Object.keys(currentStreamsMap),
        ]));
        const newMaybeNotificationDtos = await Promise.all(ids.map((id) => {
            const previousStream = previousStreamsMap[id];
            const currentStream = currentStreamsMap[id];
            return this.getNotification(user.accountId, previousStream, currentStream);
        }));
        return newMaybeNotificationDtos
            .filter(Boolean)
            .map((dto) => (0, class_transformer_1.plainToInstance)(notification_entity_1.Notification, dto));
    }
    async processUserStreams(user, currentStreams) {
        const shouldUpdateUser = Boolean(currentStreams) || !user.streams;
        const newNotifications = user.streams && currentStreams
            ? await this.generateNotifications(user, currentStreams)
            : [];
        const shouldCreateNotifications = newNotifications.length > 0;
        if (!shouldUpdateUser && !shouldCreateNotifications) {
            return;
        }
        try {
            if (user.isEmailVerified && user.allowNotifications) {
                await Promise.all(newNotifications.map((notification) => this.sendNotificationEmail(user, notification)));
            }
        }
        catch (error) {
            console.error(`Error sending notification emails`, error);
        }
        let queryRunner;
        try {
            queryRunner = this.connection.createQueryRunner();
            await queryRunner.startTransaction();
            await Promise.all([
                shouldUpdateUser &&
                    queryRunner.manager.update(user_entity_1.User, { accountId: user.accountId }, { streams: currentStreams !== null && currentStreams !== void 0 ? currentStreams : [] }),
                shouldCreateNotifications &&
                    queryRunner.manager.save(notification_entity_1.Notification, newNotifications),
            ]);
            await queryRunner.commitTransaction();
        }
        catch (e) {
            this.logger.error(e);
            this.logger.error(`Error while processing streams of ${user.accountId}`);
            this.logger.error('Previous streams', user.streams);
            this.logger.error('Current streams ', currentStreams);
            await (queryRunner === null || queryRunner === void 0 ? void 0 : queryRunner.rollbackTransaction());
        }
        finally {
            await (queryRunner === null || queryRunner === void 0 ? void 0 : queryRunner.release());
        }
    }
    async findAll(accountId) {
        return this.notificationsRepository.find({
            where: { accountId },
            order: { createdAt: 'DESC' },
            take: 100,
        });
    }
    markAllRead(accountId) {
        return this.notificationsRepository.update({ accountId }, { isRead: true });
    }
    async unsubscribe(accountId, jwt) {
        const payload = this.jwtService.decode(jwt);
        if (!payload ||
            typeof payload !== 'object' ||
            payload.command !== UNSUBSCRIBE_COMMAND ||
            payload.accountId !== accountId) {
            throw new common_1.BadRequestException();
        }
        const user = await this.usersService.findOne(accountId);
        if (!user) {
            throw new common_1.BadRequestException();
        }
        return this.usersService.update(accountId, {
            allowNotifications: false,
        });
    }
    getNotificationSubjectAndText(accountId, notification) {
        const { owner_id: senderId, receiver_id: receiverId, id: streamId, } = notification.payload.stream;
        const isIncoming = accountId === receiverId;
        switch (notification.type) {
            case notification_entity_1.NotificationType.StreamStarted:
                return {
                    subject: isIncoming
                        ? 'New incoming stream created'
                        : 'New outgoing stream created',
                    notificationText: isIncoming
                        ? `${senderId} created a stream with ID ${streamId} to you. Please be ready to receive the stream.`
                        : `You’ve successfully created a stream to ${receiverId} with ID ${streamId}.`,
                };
            case notification_entity_1.NotificationType.StreamPaused:
                return {
                    subject: isIncoming
                        ? 'Incoming stream was paused'
                        : 'Outgoing stream was paused',
                    notificationText: isIncoming
                        ? `The incoming stream from ${senderId} with ID ${streamId} was paused.`
                        : `The outgoing stream to ${receiverId} with ID ${streamId} was paused.`,
                };
            case notification_entity_1.NotificationType.StreamFinished:
                return {
                    subject: isIncoming
                        ? 'Incoming stream was completed'
                        : 'Outgoing stream was completed',
                    notificationText: isIncoming
                        ? `The incoming stream from ${senderId} with ID ${streamId} was completed.`
                        : `The outgoing stream to ${receiverId} with ID ${streamId} was completed.`,
                };
            case notification_entity_1.NotificationType.StreamContinued:
                return {
                    subject: isIncoming
                        ? 'Incoming stream was continued'
                        : 'Outgoing stream was continued',
                    notificationText: isIncoming
                        ? `The incoming stream from ${senderId} with ID ${streamId} was continued.`
                        : `The outgoing stream to ${receiverId} with ID ${streamId} was continued.`,
                };
            case notification_entity_1.NotificationType.StreamFundsAdded:
                return {
                    subject: isIncoming
                        ? 'Funds were added to incoming stream'
                        : 'Funds were added to outgoing stream',
                    notificationText: isIncoming
                        ? `Funds were added to the incoming stream from ${senderId} with ID ${streamId}. The stream will last appropriate time according to the amount of added funds.`
                        : `Funds were added to the outgoing stream to ${receiverId} with ID ${streamId}. The stream will last appropriate time according to the amount of added funds.`,
                };
            case notification_entity_1.NotificationType.StreamCliffPassed:
                return {
                    subject: isIncoming
                        ? 'Incoming stream has passed cliff period'
                        : 'Outgoing stream has passed cliff period',
                    notificationText: isIncoming
                        ? `The incoming stream from ${senderId} with ID ${streamId} has passed cliff period.`
                        : `The outgoing stream to ${receiverId} with ID ${streamId} has passed cliff period.`,
                };
            case notification_entity_1.NotificationType.StreamIsDue:
                return {
                    subject: isIncoming
                        ? 'Incoming stream is ready to be fully withdrawn'
                        : 'Outgoing stream is ready to be fully withdrawn',
                    notificationText: isIncoming
                        ? `The incoming stream from ${senderId} with ID ${streamId} is ready to be fully withdrawn.`
                        : `The outgoing stream to ${receiverId} with ID ${streamId} is ready to be fully withdrawn.`,
                };
        }
    }
    async sendNotificationEmail({ name, accountId, email }, notification) {
        const { subject, notificationText } = this.getNotificationSubjectAndText(accountId, notification);
        const unsubscribePayload = this.jwtService.sign({
            accountId,
            email,
            command: UNSUBSCRIBE_COMMAND,
        });
        const networkText = process.env.NEAR_NETWORK_ID !== 'mainnet' ? ' [' + process.env.NEAR_NETWORK_ID + ']' : '';
        await SendGrid.send({
            from: { name: 'Roketo notifier', email: 'noreply@roke.to' },
            to: { name: name || accountId, email },
            templateId: 'd-22fa8e12064c42c2a1da7d204b5857e5',
            dynamicTemplateData: {
                subject: `${subject}${networkText} @ Roketo`,
                logoLink: config_1.DAPP_HOST,
                accountId,
                notificationText,
                streamLink: `${config_1.DAPP_HOST}/#/streams/${notification.payload.stream.id}`,
                unsubscribeLink: `${config_1.API_HOST}/notifications/${accountId}/unsubscribe/${unsubscribePayload}`,
            },
        });
    }
};
__decorate([
    (0, schedule_1.Cron)(EACH_5_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "generateIfNotBusy", null);
NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Connection,
        users_service_1.UsersService,
        contract_service_1.ContractService,
        archive_service_1.ArchiveService,
        jwt_1.JwtService])
], NotificationsService);
exports.NotificationsService = NotificationsService;
//# sourceMappingURL=notifications.service.js.map