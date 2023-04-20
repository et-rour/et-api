import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIsDailyValueToReservationTable1679253814152 implements MigrationInterface {
    name = 'AddIsDailyValueToReservationTable1679253814152'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation" ADD "isDaily" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation" DROP COLUMN "isDaily"`);
    }

}
