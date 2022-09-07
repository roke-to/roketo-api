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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const jwt_1 = require("@nestjs/jwt");
const SendGrid = require("@sendgrid/mail");
const user_entity_1 = require("./user.entity");
const config_1 = require("../common/config");
const VERIFY_EMAIL_COMMAND = 'verifyEmail';
const EACH_5_SECONDS = '*/5 * * * * *';
let UsersService = class UsersService {
    constructor(usersRepository, jwtService) {
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger('Cron');
        this.isBusy = false;
        SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
    }
    async findOne(accountId) {
        const user = await this.usersRepository.findOne(accountId);
        return user || this.usersRepository.create({ accountId });
    }
    async createIfNew(accountId) {
        const exists = (await this.usersRepository.count({ where: { accountId } })) > 0;
        if (!exists) {
            const user = this.usersRepository.create({ accountId });
            await this.usersRepository.save(user);
        }
    }
    async update(accountId, updateUserDto) {
        const user = await this.usersRepository.findOne(accountId);
        const EMAIL_CHANGED_DTO = {
            isEmailVerified: false,
            verificationEmailSentAt: null,
        };
        const hasEmailChanged = 'email' in updateUserDto && user.email !== updateUserDto.email;
        return this.usersRepository.update(accountId, Object.assign(Object.assign({}, updateUserDto), (hasEmailChanged && EMAIL_CHANGED_DTO)));
    }
    findAll() {
        return this.usersRepository.find();
    }
    async getAvatarUrl(accountId) {
        const { email } = await this.findOne(accountId);
        const identifier = email || (0, crypto_1.createHash)('sha256').update(accountId).digest('hex');
        const identifierHash = (0, crypto_1.createHash)('md5')
            .update(identifier.toLowerCase().trim())
            .digest('hex');
        return `https://gravatar.com/avatar/${identifierHash}?default=identicon&size=64`;
    }
    async verifyEmail(accountId, jwt) {
        const payload = this.jwtService.decode(jwt);
        if (!payload ||
            typeof payload !== 'object' ||
            payload.command !== VERIFY_EMAIL_COMMAND ||
            payload.accountId !== accountId) {
            throw new common_1.BadRequestException();
        }
        const user = await this.usersRepository.findOne(accountId);
        if (!user) {
            throw new common_1.BadRequestException();
        }
        if (user.email !== payload.email) {
            throw new common_1.BadRequestException('The email from the link mismatched with the current email of the user');
        }
        if (payload.exp * 1000 < Date.now()) {
            throw new common_1.BadRequestException('Verification link expired, please try resending verification email');
        }
        return this.usersRepository.update(accountId, {
            isEmailVerified: true,
        });
    }
    async sendVerificationEmail({ accountId, name, email }) {
        const verificationPayload = this.jwtService.sign({
            accountId,
            email,
            command: VERIFY_EMAIL_COMMAND,
        });
        await SendGrid.send({
            from: { name: 'Roketo email verifier', email: 'noreply@roke.to' },
            to: { name: name || accountId, email },
            templateId: 'd-f0a6fb55e9ce4387a791a859284aa3c1',
            dynamicTemplateData: {
                network: process.env.NEAR_NETWORK_ID,
                logoLink: config_1.DAPP_HOST,
                accountId,
                verificationLink: `${config_1.API_HOST}/users/${accountId}/verifyEmail/${verificationPayload}`,
            },
        });
        await this.usersRepository.update(accountId, {
            verificationEmailSentAt: new Date(),
        });
    }
    async resendVerificationEmail(accountId) {
        const user = await this.usersRepository.findOne(accountId);
        if (user.email && !user.isEmailVerified) {
            return this.sendVerificationEmail(user);
        }
    }
    async sendInitialVerificationEmailsIfNotBusy() {
        if (this.isBusy) {
            this.logger.log('Busy sending verification emails, skipped.');
            return;
        }
        const start = Date.now();
        try {
            this.isBusy = true;
            this.logger.log('Starting sending verification emails...');
            await this.sendInitialVerificationEmails();
            this.logger.log(`Finished sending verification emails in ${Date.now() - start}ms.`);
        }
        catch (error) {
            this.logger.error(`Failed sending verification emails after ${Date.now() - start}ms.`, error.message, error.stack);
        }
        finally {
            this.isBusy = false;
        }
    }
    async sendInitialVerificationEmails() {
        const users = await this.usersRepository.find({
            where: {
                email: (0, typeorm_2.Like)('%@%'),
                isEmailVerified: false,
                verificationEmailSentAt: null,
            },
        });
        await Promise.all(users.map((user) => this.sendVerificationEmail(user)));
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map