import {MigrationInterface, QueryRunner} from "typeorm";

export class ArchiveAndNotificationsPayloadTypesChange1664863615156 implements MigrationInterface {
    name = 'ArchiveAndNotificationsPayloadTypesChange1664863615156'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "archived_stream" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "archived_stream" DROP CONSTRAINT "PK_f19ab30c6d08dcabdbc77347d86"`);
        await queryRunner.query(`ALTER TABLE "archived_stream" ADD CONSTRAINT "PK_d0bb30a5ab2ea0d16d912e83e6e" PRIMARY KEY ("streamId", "id")`);
        await queryRunner.query(`ALTER TABLE "archived_stream" DROP CONSTRAINT "PK_d0bb30a5ab2ea0d16d912e83e6e"`);
        await queryRunner.query(`ALTER TABLE "archived_stream" ADD CONSTRAINT "PK_02d08e244a51db2a41546158fd7" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "archived_stream" DROP CONSTRAINT "PK_02d08e244a51db2a41546158fd7"`);
        await queryRunner.query(`ALTER TABLE "archived_stream" ADD CONSTRAINT "PK_d0bb30a5ab2ea0d16d912e83e6e" PRIMARY KEY ("streamId", "id")`);
        await queryRunner.query(`ALTER TABLE "archived_stream" DROP CONSTRAINT "PK_d0bb30a5ab2ea0d16d912e83e6e"`);
        await queryRunner.query(`ALTER TABLE "archived_stream" ADD CONSTRAINT "PK_f19ab30c6d08dcabdbc77347d86" PRIMARY KEY ("streamId")`);
        await queryRunner.query(`ALTER TABLE "archived_stream" DROP COLUMN "id"`);
    }

}
