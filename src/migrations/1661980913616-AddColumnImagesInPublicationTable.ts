import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumnImagesInPublicationTable1661980913616 implements MigrationInterface {
    name = 'AddColumnImagesInPublicationTable1661980913616'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "images" ADD "publicationId" integer`);
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "FK_26991045c627465cf9748b3119f" FOREIGN KEY ("publicationId") REFERENCES "publication"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_26991045c627465cf9748b3119f"`);
        await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "publicationId"`);
    }

}
