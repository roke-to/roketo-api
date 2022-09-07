import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddAllowNotificationsColumn1655116756970 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
