export declare enum NotificationType {
    StreamStarted = "StreamStarted",
    StreamPaused = "StreamPaused",
    StreamFinished = "StreamFinished",
    StreamIsDue = "StreamIsDue",
    StreamContinued = "StreamContinued",
    StreamCliffPassed = "StreamCliffPassed",
    StreamFundsAdded = "StreamFundsAdded"
}
export declare class Notification {
    id: string;
    accountId: string;
    streamId: string;
    createdAt: Date;
    isRead: boolean;
    type: NotificationType;
    payload: Record<string, any>;
}
