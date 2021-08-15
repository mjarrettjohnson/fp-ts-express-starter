import { compare, genSalt, hash } from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { getManager } from 'typeorm';
import { SECRET } from '../config';
import { User } from '../entity/User';

const SALT_ROUNDS = 10;

export type VerifyPasswordFn = (opts: { user: User, password: string}) => Promise<User>;

export const verifyPassword: VerifyPasswordFn = ({ user, password }): Promise<User> =>
  new Promise((res, rej) =>
    compare(password, user.hash, (err, same: boolean) => {
      same ? res(user) : rej(same);
    }),
  );

export const hashPassword = async (
  password: string,
): Promise<string | undefined> => {
  const salt = await createSalt();
  if (!salt) {
    return undefined;
  }

  return createHash(password, salt);
};

export const createSalt = (
  rounds: number = SALT_ROUNDS,
): Promise<string> =>
  new Promise((res, rej) =>
    genSalt(rounds, (err, salt) => {
      if (err) {
        rej(new Error('Could not create salt'));
      }

      res(salt);
    }),
  );

export const createHash = (
  password: string,
  salt: string,
): Promise<string> =>
  new Promise((res, rej) =>
    hash(password, salt, (err, hash) => {
      if (err) {
        return rej(err);
      }

      res(hash);
    }),
  );

export const createAccessToken = (
  {
    id,
    firstName,
    lastName,
  }: { id: string; firstName: string; lastName: string },
  now = new Date(),
): string => {
  now.setMonth(now.getMonth() + 1);
  return sign(
    { id, firstName, lastName, expiry: now.getTime() },
    SECRET,
  );
};

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];

    verify(
      token,
      SECRET,
      async (err, payload: { expiry: number }) => {
        if (err) {
          return res.sendStatus(403);
        }

        if (new Date().getTime() > payload.expiry) {
          return res.sendStatus(403);
        }

        try {
          const repo = getManager().getRepository(User);
          var user = await repo
            .createQueryBuilder('user')
            .where('user.accessToken = :token', { token })
            .getOneOrFail();
          (req as any).user = user;
        } catch (err) {
          return res.sendStatus(403);
        }
        next();
      },
    );
  } else {
    res.sendStatus(401);
  }
};
