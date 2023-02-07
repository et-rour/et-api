import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
  } from "typeorm";
  
@Entity()
export class Currency extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "text", nullable: true })
    name: string;

    @Column({ type: "text", nullable: true })
    country: string;

    @Column({ type: "text", nullable: true })
    symbol: string;

    @Column({ type: "text", nullable: true })
    value: number;

    @Column({ type: "text", nullable: true })
    apiCode: string;

    @Column({ type: "timestamptz", nullable: true })
    lastCall: Date;
}
  