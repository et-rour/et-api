import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import { Location } from "./Location";

@Entity()
export class Image3d extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  image: string;

  @Column()
  longitude: string;

  @Column()
  latitude: string;

  @ManyToOne(() => Location, (location) => location.images3D)
  location: Location;
}
