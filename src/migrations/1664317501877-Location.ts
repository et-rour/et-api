import {MigrationInterface, QueryRunner} from "typeorm";

export class Location1664317501877 implements MigrationInterface {
    name = 'Location1664317501877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location" ADD "landUse" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location" DROP COLUMN "landUse"`);
    }

}
