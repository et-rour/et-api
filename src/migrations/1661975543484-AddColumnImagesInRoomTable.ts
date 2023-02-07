import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumnImagesInRoomTable1661975543484 implements MigrationInterface {
    name = 'AddColumnImagesInRoomTable1661975543484'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "images" ADD "roomId" integer`);
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "FK_47a8a123e8914e648aab16ee94a" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_47a8a123e8914e648aab16ee94a"`);
        await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "roomId"`);
    }

}
