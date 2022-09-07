import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateSchema1652383174463 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
