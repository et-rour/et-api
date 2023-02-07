import {MigrationInterface, QueryRunner} from "typeorm";

export class Location1665008208483 implements MigrationInterface {
    name = 'Location1665008208483'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "isTrash" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ADD "isDeleted" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "location" ADD "isTrash" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "location" ADD "isDeleted" boolean DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location" DROP COLUMN "isDeleted"`);
        await queryRunner.query(`ALTER TABLE "location" DROP COLUMN "isTrash"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isDeleted"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isTrash"`);
    }

}
