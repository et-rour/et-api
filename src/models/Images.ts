import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import { Location } from "./Location";
import { Publication } from "./Publication";
import { Room } from "./Room";

@Entity()
export class Images extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  image: string;

  @Column({ default: true })
  isVisible: boolean;

  // 0 for location
  // 1 for publication
  @Column({ default: 0 })
  table: number;

  @ManyToOne(() => Location, (location) => location.imagesLocation)
  location: Location;

  @ManyToOne(() => Room, (room) => room.imagesRoom)
  room: Room;

  @ManyToOne(() => Publication, (publication) => publication.imagesPublication)
  publication: Publication;
}
