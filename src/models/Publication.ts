import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Images } from "./Images";

import { User } from "./User";

@Entity()
export class Publication extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", nullable: true })
  title: string;

  @Column({ length: 480 })
  description: string;

  @Column({ length: 480, nullable: true })
  image: string;

  @OneToMany(() => Images, (images) => images.publication)
  imagesPublication: Images[];

  @Column({ nullable: true })
  webSite: string;

  @Column({ nullable: true })
  instagram: string;

  @ManyToOne(() => User, (user) => user.publications)
  user: User;

  @Column({ type: "boolean", default: false })
  isVerified: boolean;

  @Column("timestamp with time zone", {
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
  })
  created: Date;
}
