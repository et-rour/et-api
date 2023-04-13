import {MigrationInterface, QueryRunner} from "typeorm";

export class AddOrderColumnToLocationTable1681170374148 implements MigrationInterface {
    name = 'AddOrderColumnToLocationTable1681170374148'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location" ADD "order" SERIAL NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location" DROP COLUMN "order"`);
    }

}
