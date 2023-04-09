import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from "typeorm";

import { Zone } from "./Zone";
import { User } from "./User";
import { Room } from "./Room";
import { Image3d } from "./Image3d";
import { Images } from "./Images";
import { Reservation } from "./Reservation";

@Entity()
export class Location extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "boolean", nullable: true })
  isVerified: boolean;

  @Column({ type: "boolean", nullable: true })
  isActive: boolean;

  @Column({ type: "boolean", nullable: true, default: false })
  isTrash: boolean;

  @Column({ type: "boolean", nullable: true, default: false })
  isDeleted: boolean;

  @Column({ type: "text", nullable: true })
  name: string;

  @Column({ type: "text", nullable: true })
  address: string;

  @Column({ type: "text", nullable: true })
  propertyType: string;

  @Column({ type: "text", nullable: true })
  landUse: string;

  @Column({ type: "text", nullable: true })
  long: string;

  @Column({ type: "text", nullable: true })
  lat: string;

  @ManyToOne(() => Zone, (zone) => zone)
  zone: Zone;

  @Column({ type: "text", nullable: true })
  rooms: number;

  @Column({ nullable: true })
  calendlyLink: string;

  @Column({ type: "text", nullable: true })
  bathrooms: number;

  @Column({ default: false })
  vault: boolean;

  @Column({ default: false })
  cleaning: boolean;

  @Column({ default: false })
  wifi: boolean;

  @Column({ default: false })
  security: boolean;

  @Column({ type: "text", nullable: true })
  painting: number;

  @Column({ type: "text", nullable: true })
  garage: number;

  @Column({ type: "text", nullable: true })
  floor: number;

  @Column({ type: "text", nullable: true })
  unused: number;

  @Column({ type: "text", nullable: true })
  value: number;

  @Column({ type: "text", nullable: true })
  squareMeters: number;

  @Column({ type: "text", nullable: true })
  stripeProductId: string;

  @Column({ type: "text", nullable: true })
  stripePriceId: string;

  @Column("jsonb", { nullable: true, default: { min: 0, max: 0 } })
  suggestedValue: object;

  @Column({ type: "text", nullable: true })
  expectedValue: number;

  @Column({ type: "text", nullable: true })
  image: string;

  @OneToMany(() => Images, (images) => images.location)
  imagesLocation: Images[];

  @ManyToOne(() => User, (user) => user.locations)
  owner: User;

  @ManyToOne(() => User, (user) => user.locations)
  admins: User;

  @OneToMany(() => Room, (room) => room.location)
  roomsDetails: Room[];

  @OneToMany(() => Image3d, (image3d) => image3d.location)
  images3D: Image3d[];

  @Column({ type: "text", nullable: true })
  email: string;

  @Column({ type: "text", nullable: true })
  phone: number;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "timestamptz", nullable: true })
  startLease: Date;

  @Column({ type: "timestamptz", nullable: true })
  endLease: Date;

  @Column({ default: true })
  createdByAdmin: boolean;

  @Column("timestamp with time zone", {
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
  })
  created: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.location)
  reservations: Reservation[];

  @Column({ default: false })
  isDaily: boolean;

  @Column({ default: 0 })
  dailyValue: number;
}
