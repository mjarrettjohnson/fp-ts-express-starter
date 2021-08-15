import { Repository } from "typeorm";
import { invalidCredentials } from "../base/errors";
import { User } from "../entity/User";

type Credentials = {
  email: string,
  password: string
}

export type FindUserFn = (credentials: Credentials) => Promise<{ user: User, password: string }>
export type InsertUserFn = (user: User) => Promise<User>

type UserRepo = {
  findUser: FindUserFn,
  insertUser: InsertUserFn
}

export const createUserRepo = (repo: Repository<User>): UserRepo => ({
  findUser: async ({ email, password }: Credentials) => {
      const user = await repo.findOne({ where: { email }});
      if (!!user) {
        return { user, password};
      }
      throw invalidCredentials();
  },

  insertUser: async (user: User)  => {
    await repo.insert(user);
    return user;
  }
});
