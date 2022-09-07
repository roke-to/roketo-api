import { JwtService } from '@nestjs/jwt';
import type { LoginDto } from './login.dto';
import { UsersService } from '../users/users.service';
import { AccessTokenDto } from './access-token.dto';
import { NearService } from '../near/near.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly nearService;
    constructor(usersService: UsersService, jwtService: JwtService, nearService: NearService);
    validateUser({ accountId, timestamp, signature, }: LoginDto): Promise<any>;
    login(user: any): Promise<AccessTokenDto>;
}
