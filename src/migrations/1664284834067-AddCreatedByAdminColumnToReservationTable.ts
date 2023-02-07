import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCreatedByAdminColumnToReservationTable1664284834067 implements MigrationInterface {
    name = 'AddCreatedByAdminColumnToReservationTable1664284834067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location" ADD "createdByAdmin" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location" DROP COLUMN "createdByAdmin"`);
    }

}
