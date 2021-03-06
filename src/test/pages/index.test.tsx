/* eslint-disable @getify/proper-arrows/name */
import * as db from "db/db.connect";
jest.mock("db/db.connect");
const mockedDb = db as jest.Mocked<typeof db>;

import { render, screen } from "@testing-library/react";
import { RawRelease } from "api/albums";
import { getApiAlbums, getMasterData, getReleases } from "api/mocks/albums";
import mockDataReleases from "api/mocks/albums/releasesMockData.json";
import { rest } from "api/mocks/server";
import { Db, MongoClient } from "mongodb";
import { setupServer } from "msw/node";
import Home from "pages/index";

console.log = jest.fn();
console.time = jest.fn();

const server = setupServer(getApiAlbums, getReleases(), getMasterData());

const handlerCalled = jest.fn();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "warn" });
  server.events.on("request:start", (req) =>
    handlerCalled(`${req.method}: ${req.url.toString()}`)
  );
});
beforeEach(() => {
  handlerCalled.mockReset();
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

test("should not insert new releases in db if up to date", async () => {
  const insertMany = jest.fn(() => Promise.resolve(true));
  const deleteMany = jest.fn(() => Promise.resolve(true));
  const findCollections = jest.fn(() =>
    Promise.resolve([mockDataReleases.releases[0]])
  );
  mockedDb.connectToDatabase.mockResolvedValue(
    Promise.resolve(
      mockDatabase({
        findCollections,
        insertMany,
        deleteMany,
      })
    )
  );

  server.use(
    rest.get(process.env.DISCOGS_ENDPOINT_RELEASES, async (_req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          releases: [mockDataReleases.releases[0]],
        })
      );
    })
  );

  render(<Home syncCollection={true} />);

  expect(await screen.findAllByRole("article")).toHaveLength(1);
  expect(insertMany).toHaveBeenCalledTimes(0);
  expect(deleteMany).toHaveBeenCalledTimes(0);

  expect(handlerCalled.mock.calls.flat()).toMatchInlineSnapshot(`
Array [
  "GET: http://localhost/api/albums?syncCollection=true",
  "GET: https://api.discogs.com/users/*",
]
`);
});

test("should insert new releases in db", async () => {
  const insertMany = jest.fn(() => Promise.resolve(true));
  const deleteMany = jest.fn(() => Promise.resolve(true));
  const findCollections = jest.fn(() => Promise.resolve([]));
  mockedDb.connectToDatabase.mockResolvedValue(
    Promise.resolve(
      mockDatabase({
        findCollections,
        insertMany,
        deleteMany,
      })
    )
  );

  server.use(
    rest.get(process.env.DISCOGS_ENDPOINT_RELEASES, async (_req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          releases: [mockDataReleases.releases[0]],
        })
      );
    })
  );

  render(<Home syncCollection={true} />);

  expect(await screen.findAllByRole("article")).toHaveLength(1);
  expect(insertMany).toHaveBeenCalledTimes(1);
  expect(deleteMany).toHaveBeenCalledTimes(0);
  expect(handlerCalled.mock.calls.flat()).toMatchInlineSnapshot(`
Array [
  "GET: http://localhost/api/albums?syncCollection=true",
  "GET: https://api.discogs.com/users/*",
  "GET: https://api.discogs.com/masters/24155",
]
`);
});

test("should fetch albums from database if no sync specified", async () => {
  const insertMany = jest.fn(() => Promise.resolve(true));
  const deleteMany = jest.fn(() => Promise.resolve(true));
  const findCollections = jest.fn(() =>
    Promise.resolve([mockDataReleases.releases[0]])
  );
  mockedDb.connectToDatabase.mockResolvedValue(
    Promise.resolve(
      mockDatabase({
        findCollections,
        insertMany,
        deleteMany,
      })
    )
  );

  render(<Home syncCollection={false} />);

  expect(await screen.findAllByRole("article")).toHaveLength(1);
  expect(insertMany).toHaveBeenCalledTimes(0);
  expect(deleteMany).toHaveBeenCalledTimes(0);
  expect(handlerCalled.mock.calls.flat()).toMatchInlineSnapshot(`
Array [
  "GET: http://localhost/api/albums?syncCollection=false",
]
`);
});

test("should remove releases from db", async () => {
  const insertMany = jest.fn(() => Promise.resolve(true));
  const deleteMany = jest.fn(() => Promise.resolve(true));
  const findCollections = jest.fn(() =>
    Promise.resolve([mockDataReleases.releases[0]])
  );
  mockedDb.connectToDatabase.mockResolvedValue(
    Promise.resolve(
      mockDatabase({
        findCollections,
        insertMany,
        deleteMany,
      })
    )
  );

  server.use(
    rest.get(process.env.DISCOGS_ENDPOINT_RELEASES, async (_req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          releases: [mockDataReleases.releases[1]],
        })
      );
    })
  );

  render(<Home syncCollection={true} />);

  expect(await screen.findAllByRole("article")).toHaveLength(1);
  expect(insertMany).toHaveBeenCalledTimes(1);
  expect(deleteMany).toHaveBeenCalledTimes(1);
  expect(handlerCalled.mock.calls.flat()).toMatchInlineSnapshot(`
Array [
  "GET: http://localhost/api/albums?syncCollection=true",
  "GET: https://api.discogs.com/users/*",
  "GET: https://api.discogs.com/masters/4126",
]
`);
});

describe("Error handling", () => {
  test("should show error message if db connection failed", async () => {
    mockedDb.connectToDatabase.mockRejectedValue("Database connection error");

    render(<Home syncCollection={true} />);

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  test("should show error message if db fails to update", async () => {
    const insertMany = jest.fn(() => Promise.resolve(true));
    const deleteMany = jest.fn(() => Promise.resolve(true));
    const findCollections = jest.fn(() => Promise.reject("No connection"));
    mockedDb.connectToDatabase.mockResolvedValue(
      Promise.resolve(
        mockDatabase({
          findCollections,
          insertMany,
          deleteMany,
        })
      )
    );

    render(<Home syncCollection={true} />);

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(insertMany).toHaveBeenCalledTimes(0);
    expect(deleteMany).toHaveBeenCalledTimes(0);
    expect(handlerCalled.mock.calls.flat()).toMatchInlineSnapshot(`
Array [
  "GET: http://localhost/api/albums?syncCollection=true",
  "GET: https://api.discogs.com/users/*",
]
`);
  });

  test("should show error when error in external collection request", async () => {
    const insertMany = jest.fn(() => Promise.resolve(true));
    const deleteMany = jest.fn(() => Promise.resolve(true));
    const findCollections = jest.fn(() =>
      Promise.resolve([mockDataReleases.releases[0]])
    );
    mockedDb.connectToDatabase.mockResolvedValue(
      Promise.resolve(
        mockDatabase({
          findCollections,
          insertMany,
          deleteMany,
        })
      )
    );

    server.use(
      rest.get(
        process.env.DISCOGS_ENDPOINT_RELEASES,
        async (_req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              message: "not found",
            })
          );
        }
      )
    );

    render(<Home syncCollection={true} />);

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(insertMany).toHaveBeenCalledTimes(0);
    expect(deleteMany).toHaveBeenCalledTimes(0);
    expect(handlerCalled.mock.calls.flat()).toMatchInlineSnapshot(`
Array [
  "GET: http://localhost/api/albums?syncCollection=true",
  "GET: https://api.discogs.com/users/*",
]
`);
  });

  test("should not update db when masterdata request fail", async () => {
    const insertMany = jest.fn(() => Promise.resolve(true));
    const deleteMany = jest.fn(() => Promise.resolve(true));
    const findCollections = jest.fn(() => Promise.resolve([]));
    mockedDb.connectToDatabase.mockResolvedValue(
      mockDatabase({
        findCollections,
        insertMany,
        deleteMany,
      })
    );

    server.use(
      rest.get(
        process.env.DISCOGS_ENDPOINT_RELEASES,
        async (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              releases: [
                mockDataReleases.releases[0],
                { ...mockDataReleases.releases[1], masterData: undefined },
              ],
            })
          );
        }
      ),
      rest.get(
        mockDataReleases.releases[1].basic_information.master_url,
        async (_req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              message: "not found",
            })
          );
        }
      )
    );

    render(<Home syncCollection={true} />);

    expect(await screen.findAllByRole("article")).toHaveLength(1);
    expect(insertMany).toHaveBeenCalledTimes(1);
    expect(deleteMany).toHaveBeenCalledTimes(0);
    expect(handlerCalled.mock.calls.flat()).toMatchInlineSnapshot(`
Array [
  "GET: http://localhost/api/albums?syncCollection=true",
  "GET: https://api.discogs.com/users/*",
  "GET: https://api.discogs.com/masters/24155",
  "GET: https://api.discogs.com/masters/4126",
]
`);
  });
});

const mockDatabase = ({
  findCollections,
  insertMany,
  deleteMany,
}: {
  findCollections: jest.Mock<Promise<RawRelease[]>>;
  insertMany: jest.Mock<Promise<boolean>>;
  deleteMany: jest.Mock<Promise<boolean>>;
}) => ({
  client: {} as unknown as MongoClient,
  db: {
    collection: jest.fn(() => ({
      find: jest.fn(() => ({
        toArray: findCollections,
      })),
      insertMany,
      deleteMany,
    })),
  } as unknown as Db,
});

const errorMessage = "Something went wrong when fetching albums";
