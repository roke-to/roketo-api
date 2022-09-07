import type { RoketoStream } from '../common/contract.types';
export declare class User {
    accountId: string;
    name: string;
    email: string;
    isEmailVerified: boolean;
    verificationEmailSentAt: Date;
    allowNotifications: boolean;
    streams: RoketoStream[];
    toJSON(): Record<string, any>;
}
