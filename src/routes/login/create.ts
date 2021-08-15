import { Request, Response } from "express";
import { compose } from "../../base/compose";
import { login, handleLogin, LoginHandlerOpts } from "./handler";

type CreateLogin = (
  opts: LoginHandlerOpts
) => (req: Request, res: Response) => void;

export const createLogin: CreateLogin = compose(handleLogin, login);
