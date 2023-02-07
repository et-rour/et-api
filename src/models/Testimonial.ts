import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from "typeorm";

@Entity()
export class Testimonial extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  video_url: string;

  @Column()
  name: string;

  @Column()
  position: string;

  @Column()
  location: string;

  @Column("timestamp with time zone", {
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
  })
  updated: Date;
}
