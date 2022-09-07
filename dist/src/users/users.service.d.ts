import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';
import { UpdateUserDto } from './update-user.dto';
export declare class UsersService {
    private readonly usersRepository;
    private readonly jwtService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService);
    findOne(accountId: string): Promise<User>;
    createIfNew(accountId: any): Promise<void>;
    update(accountId: string, updateUserDto: UpdateUserDto): Promise<import("typeorm").UpdateResult>;
    findAll(): Promise<User[]>;
    getAvatarUrl(accountId: string): Promise<string>;
    verifyEmail(accountId: string, jwt: string): Promise<import("typeorm").UpdateResult>;
    sendVerificationEmail({ accountId, name, email }: User): Promise<void>;
    resendVerificationEmail(accountId: string): Promise<void>;
    private readonly logger;
    isBusy: boolean;
    sendInitialVerificationEmailsIfNotBusy(): Promise<void>;
    sendInitialVerificationEmails(): Promise<void>;
}
