import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import { Location } from "./Location";
import { Room } from "./Room";
import { User } from "./User";

@Entity()
export class Reservation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("timestamp with time zone", {
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
  })
  created: Date;

  @Column({ type: "timestamptz" })
  start: Date;

  @Column({ type: "timestamptz" })
  end: Date;

  @ManyToOne(() => User, (user) => user.clientReservations)
  client: User;
  @Column({ nullable: true })
  clientId: number;

  @ManyToOne(() => User, (user) => user.ownerReservations)
  owner: User;
  @Column({ nullable: true })
  ownerId: number;

  @Column({ type: "text" })
  price: number;

  @Column({ type: "text" })
  status: string;

  @Column({ nullable: true })
  contractUrl: string;

  @Column({ default:false })
  isDaily: boolean;

  @ManyToOne(() => Location, (location) => location.reservations)
  location: Location;
  @Column({ nullable: true })
  locationId: number;

  @ManyToOne(() => Room, (room) => room.reservations)
  room: Room;
  @Column({ nullable: true })
  roomId: number;
}
