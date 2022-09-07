import { Strategy } from 'passport-custom';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
declare const NearStrategy_base: new (...args: any[]) => Strategy;
export declare class NearStrategy extends NearStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(req: Request): Promise<any>;
}
export {};
