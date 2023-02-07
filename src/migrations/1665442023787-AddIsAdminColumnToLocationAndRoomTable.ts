import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIsAdminColumnToLocationAndRoomTable1665442023787 implements MigrationInterface {
    name = 'AddIsAdminColumnToLocationAndRoomTable1665442023787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" ADD "isDaily" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "location" ADD "isDaily" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location" DROP COLUMN "isDaily"`);
        await queryRunner.query(`ALTER TABLE "room" DROP COLUMN "isDaily"`);
    }

}
