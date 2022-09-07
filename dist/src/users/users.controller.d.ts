import type { Response } from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findOne(accountId: string, req: any): Promise<import("./user.entity").User>;
    update(accountId: string, req: any, body: UpdateUserDto): Promise<void>;
    getAvatarUrl(accountId: string, res: Response): Promise<void>;
    verifyEmail(accountId: string, jwt: string, res: Response): Promise<void>;
    resendVerificationEmail(accountId: string, req: any): Promise<void>;
}
