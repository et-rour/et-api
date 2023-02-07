import {MigrationInterface, QueryRunner} from "typeorm";

export class ColumnImagesPublicationTable1660151496146 implements MigrationInterface {
    name = 'ColumnImagesPublicationTable1660151496146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "images" ADD "table" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "table"`);
    }

}
