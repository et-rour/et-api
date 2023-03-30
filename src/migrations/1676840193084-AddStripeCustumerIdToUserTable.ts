import {MigrationInterface, QueryRunner} from "typeorm";

export class AddStripeCustumerIdToUserTable1676840193084 implements MigrationInterface {
    name = 'AddStripeCustumerIdToUserTable1676840193084'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "stripeCustomerId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "stripeCustomerId"`);
    }

}
