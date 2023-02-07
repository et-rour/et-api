import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePersonalTable1662481929848 implements MigrationInterface {
  name = "CreatePersonalTable1662481929848";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "personal" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "isVisible" boolean NOT NULL DEFAULT true, "isEmailVisible" boolean NOT NULL DEFAULT true, "image" character varying, "position" character varying NOT NULL, "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7a849a61cdfe8eee39892d7b1b1" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(
      `INSERT INTO personal (name,email,position) VALUES ('Valentin Soto', 'espacio.temporal.dev@gmail.com','Fundador')`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "personal"`);
  }
}
