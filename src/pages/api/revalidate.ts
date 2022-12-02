import {
  COLLECTION_ALBUMS,
  getStoredAlbumsFromDb,
  Raw,
  RawMasterData,
  RawRelease,
  RawReleaseWithMasterData,
} from "api/albums";
import { connectToDatabase } from "db";
import { NextApiRequest, NextApiResponse } from "next";

import { catchChainedError, logger, throwChainedError } from "utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.query.secret !== process.env.REVALIDATE_TOKEN) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const { db } = await connectToDatabase().catch(
      throwChainedError("Could not connect to database")
    );

    const [storedAlbums, fetchedAlbums] = await Promise.all([
      getStoredAlbumsFromDb({ db }),
      fetchAlbums(),
    ]).catch(throwChainedError("Could not get albums from database or api"));

    const albumsToSaveInDatabaseWithoutMasterData = fetchedAlbums.filter(
      (album) => !storedAlbums.find(({ id }) => id === album.id)
    );

    const albumsToInsertInDatabase = (
      await Promise.all(
        albumsToSaveInDatabaseWithoutMasterData.map(
          async function fetchMasterDataForAlbum(
            album: Omit<RawRelease, "masterData">
          ): Promise<RawReleaseWithMasterData | undefined> {
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
              catchChainedError(
                `Could not fetch master data for album ${album.id}`
              )
            );

            if (response instanceof Error) {
              logger.info(response.message);
              return undefined;
            }

            return {
              ...album,
              masterData: response,
            };
          }
        )
      )
    ).filter(Boolean) as readonly RawReleaseWithMasterData[];

    // eslint-disable-next-line functional/functional-parameters
    const albumIdsToRemoveFromDatabase = storedAlbums.reduce((prev, album) => {
      const found = fetchedAlbums.find(({ id }) => id === album.id);
      return [...prev, ...(found ? [] : [album.id])];
    }, [] as readonly number[]);

    logger.info("albumsToInsertInDatabase", albumsToInsertInDatabase);
    logger.info("albumIdsToRemoveFromDatabase", albumIdsToRemoveFromDatabase);

    await Promise.all([
      // Insert albums in db
      albumsToInsertInDatabase.length &&
        db
          .collection(COLLECTION_ALBUMS)
          .insertMany([...albumsToInsertInDatabase]),
      // Remove albums from db
      albumIdsToRemoveFromDatabase.length &&
        db.collection(COLLECTION_ALBUMS).deleteMany({
          id: { $in: albumIdsToRemoveFromDatabase },
        }),
    ]).catch(throwChainedError("Could not update database"));

    await res.revalidate("/");
    return res.json({ revalidated: true });
  } catch (err) {
    return res.status(500).send("Error revalidating");
  }
}

async function fetchAlbums(url = process.env.DISCOGS_ENDPOINT_RELEASES) {
  const response = await request<Raw>({
    url: url ?? "",
    init: {
      headers: getHeaders(),
    },
  }).catch(throwChainedError("Could not fetch releases from discogs"));

  return response.releases;
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
