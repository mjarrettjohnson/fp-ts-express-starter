import { Request, Response } from "express";
import { compose } from "../../base/compose";
import { VerifyPasswordFn } from "../../base/auth";
import {
  HttpError,
  HttpStatusCode,
  invalidCredentials,
  serverError,
} from "../../base/errors";
import { AsyncEither, Either } from "../../base/utils";
import { User } from "../../entity/User";
import { FindUserFn } from "../../repo/user_repo";

type LoginRequest = {
  password: string;
  email: string;
};

export type LoginHandlerOpts = {
  findUser: FindUserFn;
  verifyPassword: VerifyPasswordFn;
};

type OnLogin = (req: Request) => AsyncEither<User, HttpError>;

const toLoginRequest = (req: Request): LoginRequest => {
  const { email, password } = req.body;
  if (email && password) {
    return { email, password };
  }
  throw new Error("No email or password");
};

const toServerError = (err: any) =>
  err instanceof HttpError ? err : serverError();

export function login({ findUser, verifyPassword }: LoginHandlerOpts) {
  return compose(
    Either.chain(Either.from(verifyPassword, invalidCredentials)),
    Either.chain(Either.from(findUser, toServerError)),
    Either.from(toLoginRequest, invalidCredentials)
  );
}

export function handleLogin(onLogin: OnLogin) {
  return (req: Request, res: Response) => {
    const onSuccess = ({ id, accessToken }: User) =>
      res.status(HttpStatusCode.OK).json({ accessToken, id });

    const onFailure = ({ status, message }: HttpError) =>
      res.status(status).json({ message });

    compose(Either.unwrap(onSuccess, onFailure), onLogin)(req);
  };
}
