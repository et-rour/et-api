import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from "typeorm";

import { Location } from "./Location";
import { User } from "./User";

@Entity()
export class Review extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", nullable: true })
  title: string;

  @Column({ length: 480 })
  comment: string;

  @Column({ type: "text", nullable: true })
  review: number;

  @ManyToOne(() => User, (user) => user.createdReviews)
  creator: User;

  @ManyToOne(() => User, (user) => user.receivedReviews)
  receiver: User;

  @Column({ type: "boolean", default: false })
  isVerified: boolean;

  @Column({ type: "boolean", default: false })
  isActive: boolean;

  @Column("timestamp with time zone", {
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
  })
  created: Date;
}
