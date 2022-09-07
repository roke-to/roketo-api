import { Response } from 'express';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(req: any): Promise<import("./notification.entity").Notification[]>;
    markAllRead(req: any): Promise<import("typeorm").UpdateResult>;
    unsubscribe(accountId: string, jwt: string, res: Response): Promise<void>;
}
