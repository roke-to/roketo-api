import { AuthService } from './auth.service';
import { AccessTokenDto } from './access-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(req: any): Promise<AccessTokenDto>;
}
