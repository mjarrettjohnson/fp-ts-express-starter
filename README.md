# FP Express Server

This package contains a starter kit for creating an express application connecting to a database using typeORM.

It is an exploratation of how to use functional programming techniques (particularly eithers and compose) to build an express server.

In order to configure this project you will neeed to create a new ormconfig.json file in the root package.

it should look something like this:

```json
{
  "type": "",
  "host": "",
  "port": 12345,
  "username": "",
  "database": "",
  "synchronize": true,
  "logging": {
    "logQueries": true,
    "logFailedQueryError": true
  },
  "entities": ["dist/entity/*.js"],
  "subscribers": ["dist/subscriber/*.js"],
  "migrations": ["dist/migration/*.js"],
  "cli": {
    "entitiesDir": "dist/entity",
    "migrationsDir": "dist/migration",
    "subscribersDir": "dist/subscriber"
  }
}
```
