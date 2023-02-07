import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateTestimonialsTable1670793274535 implements MigrationInterface {
    name = 'CreateTestimonialsTable1670793274535'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "testimonial" ("id" SERIAL NOT NULL, "video_url" character varying NOT NULL, "name" character varying NOT NULL, "position" character varying NOT NULL, "location" character varying NOT NULL, "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e1aee1c726db2d336480c69f7cb" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "testimonial"`);
    }

}
