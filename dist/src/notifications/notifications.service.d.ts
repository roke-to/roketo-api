import { Connection, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ContractService } from '../contract/contract.service';
import { ArchiveService } from 'src/archive/archive.service';
import { User } from '../users/user.entity';
import { Notification } from './notification.entity';
export declare class NotificationsService {
    private readonly notificationsRepository;
    private readonly connection;
    private readonly usersService;
    private readonly contractService;
    private readonly archiveService;
    private readonly jwtService;
    constructor(notificationsRepository: Repository<Notification>, connection: Connection, usersService: UsersService, contractService: ContractService, archiveService: ArchiveService, jwtService: JwtService);
    private readonly logger;
    isBusy: boolean;
    findDueNotification(accountId: string, streamId: string): Promise<Notification>;
    private generateIfNotBusy;
    private processAllUsersStreams;
    private array2Map;
    private getNotification;
    private generateNotifications;
    private processUserStreams;
    findAll(accountId: string): Promise<Notification[]>;
    markAllRead(accountId: string): Promise<import("typeorm").UpdateResult>;
    unsubscribe(accountId: string, jwt: string): Promise<import("typeorm").UpdateResult>;
    getNotificationSubjectAndText(accountId: string, notification: Notification): {
        subject: string;
        notificationText: string;
    };
    sendNotificationEmail({ name, accountId, email }: User, notification: Notification): Promise<void>;
}
