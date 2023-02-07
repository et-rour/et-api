import {MigrationInterface, QueryRunner} from "typeorm";

export class ColumnIsActiveColumnInRoomTable1660760348666 implements MigrationInterface {
    name = 'ColumnIsActiveColumnInRoomTable1660760348666'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" ADD "isActive" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" DROP COLUMN "isActive"`);
    }

}
