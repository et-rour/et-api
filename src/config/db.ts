import "reflect-metadata";
import {createConnection} from "typeorm";

export async function intializeDB(): Promise<void> {
  await createConnection();
}