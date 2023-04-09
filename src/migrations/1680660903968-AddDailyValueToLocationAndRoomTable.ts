import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDailyValueToLocationAndRoomTable1680660903968 implements MigrationInterface {
    name = 'AddDailyValueToLocationAndRoomTable1680660903968'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" ADD "dailyValue" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "location" ADD "dailyValue" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location" DROP COLUMN "dailyValue"`);
        await queryRunner.query(`ALTER TABLE "room" DROP COLUMN "dailyValue"`);
    }

}
