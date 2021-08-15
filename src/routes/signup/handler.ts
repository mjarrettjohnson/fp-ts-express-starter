import { Request, Response } from "express";
import { compose } from "../../base/compose";
import { QueryFailedError } from "typeorm";
import { createAccessToken, createHash, createSalt } from "../../base/auth";
import {
  HttpError,
  HttpStatusCode,
  invalidRequest,
  serverError,
  ServerErrorHttpError,
} from "../../base/errors";
import { AsyncEither, Either } from "../../base/utils";
import { User } from "../../entity/User";
import { InsertUserFn } from "../../repo/user_repo";

type CreateUserRequest = {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
};

export type SignupHandlerOpts = {
  insertUser: InsertUserFn;
};

type OnSignup = (req: Request) => AsyncEither<User, HttpError>;

const toCreateUserRequest = ({
  body: { firstName, lastName, email, password },
}: Request): CreateUserRequest => {
  if (!firstName || !lastName || !email || !password) {
    throw new Error("Invalid request body");
  }
  return { firstName, lastName, email, password };
};

const createUser = async (req: CreateUserRequest): Promise<User> => {
  const { email, firstName, lastName, password } = req;
  const salt = await createSalt();
  const user = new User();
  user.email = email;
  user.firstName = firstName;
  user.lastName = lastName;
  user.hash = await createHash(password, salt);
  user.accessToken = createAccessToken({ firstName, id: user.id, lastName });
  return user;
};

const handleInsertError = (err: any) =>
  err instanceof QueryFailedError
    ? new ServerErrorHttpError("That user already exists")
    : serverError();

export function signup({ insertUser }: SignupHandlerOpts) {
  return compose(
    Either.chain(Either.from(insertUser, handleInsertError)),
    Either.chain(Either.from(createUser, serverError)),
    Either.from(toCreateUserRequest, invalidRequest)
  );
}

export function handleSignup(onSignup: OnSignup) {
  return (req: Request, res: Response) => {
    const onSuccess = ({ accessToken, id }: User) =>
      res.status(HttpStatusCode.OK).json({ accessToken, id });

    const onFailure = ({ status, message }: HttpError) =>
      res.status(status).json({ message });

    return compose(Either.unwrap(onSuccess, onFailure), onSignup)(req);
  };
}
