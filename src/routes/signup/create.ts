import { Request, Response } from "express";
import { compose } from "../../base/compose";
import { handleSignup, signup, SignupHandlerOpts } from "./handler";

type CreateSignup = (
  opts: SignupHandlerOpts
) => (req: Request, res: Response) => void;
export const createSignup: CreateSignup = compose(handleSignup, signup);
