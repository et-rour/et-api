import {MigrationInterface, QueryRunner} from "typeorm";

export class Location1660161741810 implements MigrationInterface {
    name = 'Location1660161741810'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location" ADD "unused" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location" DROP COLUMN "unused"`);
    }

}
