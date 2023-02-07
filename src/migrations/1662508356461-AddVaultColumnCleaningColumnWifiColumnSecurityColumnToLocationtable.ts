import {MigrationInterface, QueryRunner} from "typeorm";

export class AddVaultColumnCleaningColumnWifiColumnSecurityColumnToLocationtable1662508356461 implements MigrationInterface {
    name = 'AddVaultColumnCleaningColumnWifiColumnSecurityColumnToLocationtable1662508356461'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location" ADD "vault" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "location" ADD "cleaning" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "location" ADD "wifi" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "location" ADD "security" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location" DROP COLUMN "security"`);
        await queryRunner.query(`ALTER TABLE "location" DROP COLUMN "wifi"`);
        await queryRunner.query(`ALTER TABLE "location" DROP COLUMN "cleaning"`);
        await queryRunner.query(`ALTER TABLE "location" DROP COLUMN "vault"`);
    }

}
