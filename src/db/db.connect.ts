import { Db, MongoClient, MongoClientOptions } from "mongodb";

import { logger, throwChainedError } from "utils";

const { DB_NAME, DB_URI } = process.env;

if (![DB_NAME, DB_URI].every(Boolean)) {
  throw new Error("Define mongodb environment variables");
}

const cache = {
  client: undefined,
  db: undefined,
};

export async function connectToDatabase(): Promise<{
  db: Db;
  client: MongoClient;
}> {
  const logTimeEnd = logger.timeStart(connectToDatabase.name);
  if (Object.values(cache).every(Boolean)) {
    logger.info("[DATABASE CACHED]");
    logTimeEnd();

    return {
      client: cache.client,
      db: cache.db,
    };
  }

  const options: MongoClientOptions = {};

  const client = new MongoClient(DB_URI, options);
  await client.connect().catch(throwChainedError("Client connection error"));

  const db = client.db(DB_NAME);

  cache.client = client;
  cache.db = db;

  logTimeEnd();

  return {
    client: cache.client,
    db: cache.db,
  };
}
