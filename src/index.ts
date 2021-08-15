import { json } from "body-parser";
import * as express from "express";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { verifyPassword } from "./base/auth";
import { User } from "./entity/User";
import { createUserRepo } from "./repo/user_repo";
import { createLogin } from "./routes/login/create";
import { createSignup } from "./routes/signup/create";

// create connection with database
// note that it's not active database connection
// TypeORM creates connection pools and uses them for your requests
createConnection()
  .then(async (connection) => {
    // create express app
    const app = express();
    app.use(json());

    const { findUser, insertUser } = createUserRepo(
      connection.getRepository(User)
    );
    const signup = createSignup({ insertUser });
    const login = createLogin({ findUser, verifyPassword });

    app.post("/signup", signup);
    app.post("/login", login);

    app.listen(3000);

    console.log("Express application is up and running on port 3000");
  })
  .catch((error) => console.log("TypeORM connection error: ", error));
