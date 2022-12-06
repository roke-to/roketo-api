import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeArchivedStreamsColumns1666594954727 implements MigrationInterface {
    name = 'ChangeArchivedStreamsColumns1666594954727'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "archived_stream" ADD "receiverId" character varying NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_5d13d9814056a22964e664988c" ON "archived_stream" ("receiverId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_5d13d9814056a22964e664988c"`);
        await queryRunner.query(`ALTER TABLE "archived_stream" DROP COLUMN "receiverId"`);
    }

}
