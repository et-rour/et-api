import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGeneralTable1659449492296 implements MigrationInterface {
  name = "CreateGeneralTable1659449492296";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "general" ("id" SERIAL NOT NULL, "image" character varying NOT NULL, "text" character varying NOT NULL, "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_477a7607b6625d746c5350ec11b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `INSERT INTO general (image,text) VALUES ('https://firebasestorage.googleapis.com/v0/b/espacio-temporal-9a372.appspot.com/o/COVER%2Fhome?alt=media', 'BUSCAMOS PROPIEDADES EN DESUSO Y LAS TRANSFORMAMOS EN ESPACIOS DE TRABAJO')`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "general"`);
  }
}
