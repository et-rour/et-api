import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Images } from "./Images";
import { Location } from "./Location";
import { Reservation } from "./Reservation";

@Entity()
export class Room extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", nullable: true })
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "text", nullable: true })
  image: string;

  @OneToMany(() => Images, (images) => images.room)
  imagesRoom: Images[];

  @Column({ type: "text", nullable: true })
  squareMeter: number;

  @Column({ type: "text", nullable: true })
  stripeProductId: string;

  @Column({ type: "text", nullable: true })
  stripePriceId: string;

  @Column({ nullable: true, default: 0 })
  value: number;

  @Column("timestamp with time zone", {
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
  })
  created: Date;

  @ManyToOne(() => Location, (location) => location.roomsDetails)
  location: Location;

  @OneToMany(() => Reservation, (reservation) => reservation.room)
  reservations: Reservation[];

  @Column({ type: "timestamptz", nullable: true })
  startLease: Date;

  @Column({ type: "timestamptz", nullable: true })
  endLease: Date;
  
  @Column({ default: false })
  isDaily: boolean;
  
  @Column({ default: 0 })
  dailyValue: number;

  @Column({ default: false })
  isDeleted: boolean;
}
