import {MigrationInterface, QueryRunner} from "typeorm";

export class CompanyNameIdentityCardRepresentativeNameRutColumnsToUserTable1666204383409 implements MigrationInterface {
    name = 'CompanyNameIdentityCardRepresentativeNameRutColumnsToUserTable1666204383409'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "companyName" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "identityCard" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "representativeName" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "rut" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "rut"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "representativeName"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "identityCard"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "companyName"`);
    }

}
