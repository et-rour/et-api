import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCalendlyLinkToLocationTable1666018774191 implements MigrationInterface {
    name = 'AddCalendlyLinkToLocationTable1666018774191'

    
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location" ADD "calendlyLink" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location" DROP COLUMN "calendlyLink"`);
    }

}
