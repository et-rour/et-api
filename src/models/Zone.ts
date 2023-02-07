import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
  } from "typeorm";
  
  @Entity()
  export class Zone extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "boolean", nullable: true })
    isActive: boolean;

    @Column({ type: "text", nullable: true })
    country: string;

    @Column({ type: "text", nullable: true })
    state: string;

    @Column({ type: "text", nullable: true })
    city: string;

    @Column({ type: "text", nullable: true })
    zone: string;

    @Column({ type: "text", nullable: true })
    centerCoordinates: string;

    @Column({ type: "text", nullable: true })
    rate: number;

    @Column({ type: "text", nullable: true })
    averageValue: number;
  }
  