import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddUserEmailVerification1655100189100 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
