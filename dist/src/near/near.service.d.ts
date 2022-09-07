export declare class NearService {
    getAccount(accountId: string): Promise<import("near-api-js").Account>;
    findUserPublicKeys(accountId: string): Promise<string[]>;
}
