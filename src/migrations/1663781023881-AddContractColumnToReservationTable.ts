import {MigrationInterface, QueryRunner} from "typeorm";

export class AddContractColumnToReservationTable1663781023881 implements MigrationInterface {
    name = 'AddContractColumnToReservationTable1663781023881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation" ADD "contractUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation" DROP COLUMN "contractUrl"`);
    }

}
