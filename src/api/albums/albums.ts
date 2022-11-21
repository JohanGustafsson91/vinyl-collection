import { connectToDatabase } from "db/db.connect";
import { Db } from "mongodb";

import { catchChainedError, logger, throwChainedError } from "utils";

import type {
  FormattedAlbum,
  Raw,
  RawMasterData,
  RawRelease,
  RawReleaseWithMasterData,
} from ".";

const COLLECTION_ALBUMS = "albums";

export async function getAlbums() {
  const { db } = await connectToDatabase().catch(
    throwChainedError("Could not connect to database")
  );

  const [storedAlbums, fetchedAlbums] = await Promise.all([
    getStoredAlbumsFromDb(db),
    fetchAlbums(),
  ]).catch(throwChainedError("Could not get albums from database or api"));

  const albumsToSaveInDatabaseWithoutMasterData = fetchedAlbums.filter(
    (album) => !storedAlbums.find(({ id }) => id === album.id)
  );

  const albumsToInsertInDatabase = (
    await Promise.all(
      albumsToSaveInDatabaseWithoutMasterData.map(fetchMasterDataForAlbum)
    )
  ).filter(Boolean);

  const albumIdsToRemoveFromDatabase = storedAlbums.reduce((prev, album) => {
    const found = fetchedAlbums.find(({ id }) => id === album.id);
    return [...prev, ...(found ? [] : [album.id])];
  }, []);

  logger.info("albumsToInsertInDatabase", albumsToInsertInDatabase);
  logger.info("albumIdsToRemoveFromDatabase", albumIdsToRemoveFromDatabase);

  await Promise.all([
    // Insert albums in db
    albumsToInsertInDatabase.length &&
      db.collection(COLLECTION_ALBUMS).insertMany(albumsToInsertInDatabase),
    // Remove albums from db
    albumIdsToRemoveFromDatabase.length &&
      db.collection(COLLECTION_ALBUMS).deleteMany({
        id: { $in: albumIdsToRemoveFromDatabase },
      }),
  ]).catch(throwChainedError("Could not update database"));

  const payload = [
    ...storedAlbums.filter(function notRemovedAlbum({ id }) {
      return !albumIdsToRemoveFromDatabase.find((removeId) => removeId === id);
    }),
    ...albumsToInsertInDatabase,
  ];

  return getFormattedAlbums(payload);
}

export async function getAlbumsFromDatabase() {
  const { db } = await connectToDatabase().catch(
    throwChainedError("Could not connect to database")
  );

  const albums = await getStoredAlbumsFromDb(db).catch(
    throwChainedError("Could not get albums from database")
  );

  return getFormattedAlbums(albums);
}

async function getStoredAlbumsFromDb(db: Db) {
  const logTimeEnd = logger.timeStart(getStoredAlbumsFromDb.name);
  const storedAlbums = await db
    .collection(COLLECTION_ALBUMS)
    .find({})
    .toArray()
    .catch(throwChainedError("Could not get collections from database"));
  logTimeEnd();

  return storedAlbums as unknown as RawReleaseWithMasterData[];
}

async function fetchAlbums() {
  const response = await request<Raw>(process.env.DISCOGS_ENDPOINT_RELEASES, {
    headers: getHeaders(),
  }).catch(throwChainedError("Could not fetch releases from discogs"));

  return response.releases;
}

async function fetchMasterDataForAlbum(
  album: Omit<RawRelease, "masterData">
): Promise<RawReleaseWithMasterData | undefined> {
  if (!album.basic_information.master_url) {
    return {
      ...album,
      masterData: undefined,
    };
  }

  const response = await request<RawMasterData>(
    album.basic_information.master_url,
    {
      headers: getHeaders(),
    }
  ).catch(
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
}

function getFormattedAlbums(raw: RawReleaseWithMasterData[]): FormattedAlbum[] {
  return raw
    .map(function formatAlbum(release) {
      const { basic_information, masterData } = release;

      return {
        id: release.id,
        artist: basic_information.artists[0].name,
        title: basic_information.title,
        printedYear: basic_information.year,
        releasedYear: masterData?.year,
        thumbnail: basic_information.thumb,
        coverImage: basic_information.cover_image,
        format: basic_information.formats[0].name,
        numberOfDiscs: basic_information.formats[0].qty,
        label: basic_information.labels[0].name,
        labelCategoryNumber: basic_information.labels[0].catno,
        genres: basic_information.genres,
        tracks:
          masterData?.tracklist?.map(function mapTrack(track) {
            return {
              title: track.title,
              position: track.position,
              duration: track.duration,
            };
          }) ?? [],
        videos:
          masterData?.videos?.map(function mapVideoData(video) {
            return {
              url: video.uri,
              title: video.title,
            };
          }) ?? [],
      };
    })
    .sort(function sortByTitle(a, b) {
      const [titleA, titleB] = [a.title, b.title].map(simplifyArtistName);
      return titleB.localeCompare(titleA);
    })
    .sort(function sortByReleaseYear(a, b) {
      return a.releasedYear - b.releasedYear;
    })
    .sort(function sortByArtist(a, b) {
      const [nameA, nameB] = [a.artist, b.artist].map(simplifyArtistName);

      if (nameA < nameB) {
        return -1;
      }

      if (nameA > nameB) {
        return 1;
      }

      return 0;
    });
}

function simplifyArtistName(name: string) {
  return name.toUpperCase().replace("THE", "").trim();
}

async function request<T>(url: string, init: RequestInit): Promise<T> {
  const logTimeEnd = logger.timeStart(url);
  const response = await fetch(url, init).catch(
    throwChainedError(`Request to ${url} failed`)
  );
  logTimeEnd();

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

function getHeaders(): Headers | never {
  const { DISCOGS_TOKEN, DISCOGS_USER_AGENT } = process.env;

  if (![DISCOGS_TOKEN, DISCOGS_USER_AGENT].every(Boolean)) {
    throw new Error("Missing discogs environment variables");
  }

  return new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent": DISCOGS_USER_AGENT,
    Authorization: DISCOGS_TOKEN,
  });
}
