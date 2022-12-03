import { COLLECTION_ALBUMS, connectToDatabase } from "database";
import { Db } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

import { catchChainedError, throwChainedError } from "shared/handleErrors";
import { logger } from "shared/logger";
import {
  Raw,
  RawMasterData,
  RawRelease,
  RawReleaseWithMasterData,
} from "shared/Release";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.query.secret !== process.env.REVALIDATE_TOKEN) {
    return res.status(401).json({ message: "Invalid token" });
  }

  const connection = await connectToDatabase().catch(
    catchChainedError("Could not connect to database")
  );

  if (connection instanceof Error) {
    logger.error(connection);
    return res.status(500).send("Error revalidating");
  }

  const syncedAlbums = await syncAlbumsToDatabase(connection.db).catch(
    catchChainedError("Could not sync albums")
  );

  if (syncedAlbums instanceof Error) {
    logger.error(syncedAlbums);
    return res.status(500).send("Error revalidating");
  }

  const revalidateResult = await res
    .revalidate("/")
    .catch(catchChainedError("Could not revalidate"));

  if (revalidateResult instanceof Error) {
    logger.error(revalidateResult);
    return res.status(500).send("Error revalidating");
  }

  return res.json({ revalidated: true });
}

async function syncAlbumsToDatabase(db: Db) {
  const [storedAlbums, fetchedAlbums] = await Promise.all([
    await db
      .collection<RawReleaseWithMasterData>(COLLECTION_ALBUMS)
      .find({})
      .toArray()
      .catch(throwChainedError("Could not get collections from database")),
    await request<Raw>({
      url: process.env.DISCOGS_ENDPOINT_RELEASES ?? "",
      init: {
        headers: getHeaders(),
      },
    })
      .then((response) => response.releases)
      .catch(throwChainedError("Could not fetch releases from discogs")),
  ]).catch(throwChainedError("Could not get albums from database or api"));

  const partialAlbumsToSaveInDatabase = fetchedAlbums.filter(
    (album) => !storedAlbums.find(({ id }) => id === album.id)
  );

  const albumsToSaveInDatabase = (
    await Promise.all(
      partialAlbumsToSaveInDatabase.map(async function fetchMasterDataForAlbum(
        album: RawRelease
      ) {
        if (!album.basic_information.master_url) {
          return {
            ...album,
            masterData: undefined,
          };
        }

        const response = await request<RawMasterData>({
          url: album.basic_information.master_url,
          init: {
            headers: getHeaders(),
          },
        }).catch(
          catchChainedError(`Could not fetch master data for album ${album.id}`)
        );

        if (response instanceof Error) {
          logger.info(response.message);
          return undefined;
        }

        return {
          ...album,
          masterData: response,
        };
      })
    )
  ).filter((item): item is RawReleaseWithMasterData => Boolean(item));

  const listOfAlbumIdsToDeleteFromDatabase = storedAlbums.reduce(
    (prev, album) => {
      const found = fetchedAlbums.find(({ id }) => id === album.id);
      return [...prev, ...(found ? [] : [album.id])];
    },
    [] as readonly number[]
  );

  logger.info("albumsToInsertInDatabase", albumsToSaveInDatabase);
  logger.info(
    "albumIdsToRemoveFromDatabase",
    listOfAlbumIdsToDeleteFromDatabase
  );

  await Promise.all([
    // Insert albums in db
    albumsToSaveInDatabase.length &&
      db.collection(COLLECTION_ALBUMS).insertMany([...albumsToSaveInDatabase]),
    // Remove albums from db
    listOfAlbumIdsToDeleteFromDatabase.length &&
      db.collection(COLLECTION_ALBUMS).deleteMany({
        id: { $in: listOfAlbumIdsToDeleteFromDatabase },
      }),
  ]).catch(throwChainedError("Could not update database"));

  return true;
}

async function request<T>({
  url,
  init,
}: {
  readonly url: string;
  readonly init: RequestInit;
}): Promise<T> {
  const response = await fetch(url, init).catch(
    throwChainedError(`Request to ${url} failed`)
  );

  if (!response.ok) {
    return Promise.reject(
      new Error(
        `Request to "${url}" failed with status code "${
          response.status
        }" and text "${await response.text()}"`
      )
    );
  }

  const json = await response
    .json()
    .catch(throwChainedError("Could not parse json"));

  return json;
}

function getHeaders(
  params: {
    readonly userAgent: string;
    readonly authorization: string;
  } = {
    userAgent: process.env.DISCOGS_USER_AGENT ?? "",
    authorization: process.env.DISCOGS_TOKEN ?? "",
  }
) {
  return new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent": params.userAgent,
    Authorization: params.authorization,
  });
}
