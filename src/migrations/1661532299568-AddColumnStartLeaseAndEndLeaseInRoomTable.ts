import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumnStartLeaseAndEndLeaseInRoomTable1661532299568 implements MigrationInterface {
    name = 'AddColumnStartLeaseAndEndLeaseInRoomTable1661532299568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" ADD "startLease" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "room" ADD "endLease" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" DROP COLUMN "endLease"`);
        await queryRunner.query(`ALTER TABLE "room" DROP COLUMN "startLease"`);
    }

}
