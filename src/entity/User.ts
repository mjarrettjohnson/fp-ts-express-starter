import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class User {
  @Column({ generated: "uuid" })
  id: string;

  @PrimaryColumn()
  email: string;

  @Column()
  hash: string;

  @Column()
  accessToken: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;
}

export type UserWithPassword = {
  user: User;
  password: string;
};
