import {MigrationInterface, QueryRunner} from "typeorm";

export class Location1658874723572 implements MigrationInterface {
    name = 'Location1658874723572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "currency" ("id" SERIAL NOT NULL, "name" text, "country" text, "symbol" text, "value" text, "apiCode" text, "lastCall" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_3cda65c731a6264f0e444cc9b91" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "zone" ("id" SERIAL NOT NULL, "isActive" boolean, "country" text, "state" text, "city" text, "zone" text, "centerCoordinates" text, "rate" text, "averageValue" text, CONSTRAINT "PK_bd3989e5a3c3fb5ed546dfaf832" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "room" ("id" SERIAL NOT NULL, "name" text, "description" text, "image" text, "squareMeter" text, "stripeProductId" text, "stripePriceId" text, "value" integer DEFAULT '0', "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "locationId" integer, CONSTRAINT "PK_c6d46db005d623e691b2fbcba23" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reservation" ("id" SERIAL NOT NULL, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "start" TIMESTAMP WITH TIME ZONE NOT NULL, "end" TIMESTAMP WITH TIME ZONE NOT NULL, "price" text NOT NULL, "status" text NOT NULL, "clientId" integer, "ownerId" integer, "locationId" integer, "roomId" integer, CONSTRAINT "PK_48b1f9922368359ab88e8bfa525" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "review" ("id" SERIAL NOT NULL, "title" text, "comment" character varying(480) NOT NULL, "review" text, "isVerified" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT false, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "creatorId" integer, "receiverId" integer, CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "publication" ("id" SERIAL NOT NULL, "title" text, "description" character varying(480) NOT NULL, "image" character varying(480), "webSite" character varying, "instagram" character varying, "isVerified" boolean NOT NULL DEFAULT false, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_8aea8363d5213896a78d8365fab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "uuid" character varying(100) NOT NULL, "isVerified" boolean, "isActive" boolean, "isOwner" boolean, "isClient" boolean, "isAdmin" boolean NOT NULL DEFAULT false, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "email" character varying(100) NOT NULL, "phone" character varying(18), "whatsapp" character varying(18), "country" character varying(100) NOT NULL, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "didReview" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "image3d" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "image" character varying NOT NULL, "longitude" character varying NOT NULL, "latitude" character varying NOT NULL, "locationId" integer, CONSTRAINT "PK_73ad9d337cb04c042d67e293532" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "location" ("id" SERIAL NOT NULL, "isVerified" boolean, "isActive" boolean, "name" text, "address" text, "propertyType" text, "long" text, "lat" text, "rooms" text, "bathrooms" text, "painting" text, "garage" text, "floor" text, "value" text, "squareMeters" text, "stripeProductId" text, "stripePriceId" text, "suggestedValue" jsonb DEFAULT '{"min":0,"max":0}', "expectedValue" text, "image" text, "email" text, "phone" text, "description" text, "startLease" TIMESTAMP WITH TIME ZONE, "endLease" TIMESTAMP WITH TIME ZONE, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "zoneId" integer, "ownerId" integer, "adminsId" integer, CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "images" ("id" SERIAL NOT NULL, "image" character varying NOT NULL, "isVisible" boolean NOT NULL DEFAULT true, "locationId" integer, CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "room" ADD CONSTRAINT "FK_7443454f937091459ed1d0b0990" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_cc7c746858c238288e45eedb9ac" FOREIGN KEY ("clientId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_c991b37bd45d50032e212d0bebf" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_72cabd0e0b55c783e42c88e2ffa" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_ee6959f2cbe32d030b5e58b45d7" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_9a25a94c510e29633c263673888" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_891b3728bc0f3c0970c9fb11a1a" FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "publication" ADD CONSTRAINT "FK_ca72b09f205afc223b9866471fe" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "image3d" ADD CONSTRAINT "FK_0c74d0b03bcb2c7b043772722fe" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "location" ADD CONSTRAINT "FK_55f37f10ce9a65705888ba1b4b9" FOREIGN KEY ("zoneId") REFERENCES "zone"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "location" ADD CONSTRAINT "FK_c4bb729e05086154519f3721868" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "location" ADD CONSTRAINT "FK_1d04293182b00f4024c08faa340" FOREIGN KEY ("adminsId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "FK_bd8936c30680114e5f9993b453e" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_bd8936c30680114e5f9993b453e"`);
        await queryRunner.query(`ALTER TABLE "location" DROP CONSTRAINT "FK_1d04293182b00f4024c08faa340"`);
        await queryRunner.query(`ALTER TABLE "location" DROP CONSTRAINT "FK_c4bb729e05086154519f3721868"`);
        await queryRunner.query(`ALTER TABLE "location" DROP CONSTRAINT "FK_55f37f10ce9a65705888ba1b4b9"`);
        await queryRunner.query(`ALTER TABLE "image3d" DROP CONSTRAINT "FK_0c74d0b03bcb2c7b043772722fe"`);
        await queryRunner.query(`ALTER TABLE "publication" DROP CONSTRAINT "FK_ca72b09f205afc223b9866471fe"`);
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_891b3728bc0f3c0970c9fb11a1a"`);
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_9a25a94c510e29633c263673888"`);
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_ee6959f2cbe32d030b5e58b45d7"`);
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_72cabd0e0b55c783e42c88e2ffa"`);
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_c991b37bd45d50032e212d0bebf"`);
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_cc7c746858c238288e45eedb9ac"`);
        await queryRunner.query(`ALTER TABLE "room" DROP CONSTRAINT "FK_7443454f937091459ed1d0b0990"`);
        await queryRunner.query(`DROP TABLE "images"`);
        await queryRunner.query(`DROP TABLE "location"`);
        await queryRunner.query(`DROP TABLE "image3d"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "publication"`);
        await queryRunner.query(`DROP TABLE "review"`);
        await queryRunner.query(`DROP TABLE "reservation"`);
        await queryRunner.query(`DROP TABLE "room"`);
        await queryRunner.query(`DROP TABLE "zone"`);
        await queryRunner.query(`DROP TABLE "currency"`);
    }

}
