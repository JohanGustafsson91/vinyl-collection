/* eslint-disable @getify/proper-arrows/name */
import { render, screen } from "@testing-library/react";
import mockDataReleases from "api/mocks/albums/releasesMockData.json";
import { rest, server } from "api/mocks/server";
import * as db from "db/db.connect";
import { Db, MongoClient } from "mongodb";
jest.mock("db/db.connect");
const mockedDb = db as jest.Mocked<typeof db>;

import { GetServerSidePropsContext } from "next";
import Home, { getServerSideProps } from "pages/index";

console.log = jest.fn();
console.time = jest.fn();

test("should not insert new releases in db if up to date", async () => {
  const insertMany = jest.fn(() => Promise.resolve(true));
  const deleteMany = jest.fn(() => Promise.resolve(true));

  mockedDb.connectToDatabase.mockImplementation(() =>
    Promise.resolve({
      client: {} as unknown as MongoClient,
      db: {
        collection: jest.fn(() => ({
          find: jest.fn(() => ({
            toArray: jest.fn(() =>
              Promise.resolve([mockDataReleases.releases[0]])
            ),
          })),
          insertMany,
          deleteMany,
        })),
      } as unknown as Db,
    })
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

  const props = await runGetServerSideProps();

  expect(insertMany).toHaveBeenCalledTimes(0);
  expect(deleteMany).toHaveBeenCalledTimes(0);

  render(<Home {...props} />);

  const pageTitle = await screen.findByText("Vinyl Collection");
  expect(pageTitle).toBeInTheDocument();

  expect(screen.getAllByRole("article")).toHaveLength(1);
});

test("should insert new releases in db", async () => {
  const insertMany = jest.fn(() => Promise.resolve(true));
  const deleteMany = jest.fn(() => Promise.resolve(true));

  mockedDb.connectToDatabase.mockImplementation(() =>
    Promise.resolve({
      client: {} as unknown as MongoClient,
      db: {
        collection: jest.fn(() => ({
          find: jest.fn(() => ({
            toArray: jest.fn(() => Promise.resolve([])),
          })),
          insertMany,
          deleteMany,
        })),
      } as unknown as Db,
    })
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

  const props = await runGetServerSideProps();

  expect(insertMany).toHaveBeenCalledTimes(1);
  expect(deleteMany).toHaveBeenCalledTimes(0);

  render(<Home {...props} />);

  const pageTitle = await screen.findByText("Vinyl Collection");
  expect(pageTitle).toBeInTheDocument();

  expect(screen.getAllByRole("article")).toHaveLength(1);
});

test("should remove releases from db", async () => {
  const insertMany = jest.fn(() => Promise.resolve(true));
  const deleteMany = jest.fn(() => Promise.resolve(true));

  mockedDb.connectToDatabase.mockImplementation(() =>
    Promise.resolve({
      client: {} as unknown as MongoClient,
      db: {
        collection: jest.fn(() => ({
          find: jest.fn(() => ({
            toArray: jest.fn(() =>
              Promise.resolve([mockDataReleases.releases[0]])
            ),
          })),
          insertMany,
          deleteMany,
        })),
      } as unknown as Db,
    })
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

  const props = await runGetServerSideProps();

  expect(insertMany).toHaveBeenCalledTimes(1);
  expect(deleteMany).toHaveBeenCalledTimes(1);

  render(<Home {...props} />);

  const pageTitle = await screen.findByText("Vinyl Collection");
  expect(pageTitle).toBeInTheDocument();

  expect(screen.getAllByRole("article")).toHaveLength(1);
});

describe("Error handling", () => {
  test("should show error message if db connection failed", async () => {
    const insertMany = jest.fn(() => Promise.resolve(true));
    const deleteMany = jest.fn(() => Promise.resolve(true));

    mockedDb.connectToDatabase.mockRejectedValue("Database connection error");

    const props = await runGetServerSideProps();

    expect(insertMany).toHaveBeenCalledTimes(0);
    expect(deleteMany).toHaveBeenCalledTimes(0);

    render(<Home {...props} />);

    const pageTitle = await screen.findByText("Vinyl Collection");
    expect(pageTitle).toBeInTheDocument();

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test("should show error message if db fails to update", async () => {
    const insertMany = jest.fn(() => Promise.resolve(true));
    const deleteMany = jest.fn(() => Promise.resolve(true));

    mockedDb.connectToDatabase.mockImplementation(() =>
      Promise.resolve({
        client: {} as unknown as MongoClient,
        db: {
          collection: jest.fn(() => ({
            find: jest.fn(() => ({
              toArray: jest.fn(() => Promise.reject("No connection")),
            })),
            insertMany,
            deleteMany,
          })),
        } as unknown as Db,
      })
    );

    const props = await runGetServerSideProps();

    expect(insertMany).toHaveBeenCalledTimes(0);
    expect(deleteMany).toHaveBeenCalledTimes(0);

    render(<Home {...props} />);

    const pageTitle = await screen.findByText("Vinyl Collection");
    expect(pageTitle).toBeInTheDocument();

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test("should show error when error in external collection request", async () => {
    const insertMany = jest.fn(() => Promise.resolve(true));
    const deleteMany = jest.fn(() => Promise.resolve(true));

    mockedDb.connectToDatabase.mockImplementation(() =>
      Promise.resolve({
        client: {} as unknown as MongoClient,
        db: {
          collection: jest.fn(() => ({
            find: jest.fn(() => ({
              toArray: jest.fn(() =>
                Promise.resolve([mockDataReleases.releases[0]])
              ),
            })),
            insertMany,
            deleteMany,
          })),
        } as unknown as Db,
      })
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

    const props = await runGetServerSideProps();

    expect(insertMany).toHaveBeenCalledTimes(0);
    expect(deleteMany).toHaveBeenCalledTimes(0);

    render(<Home {...props} />);

    const pageTitle = await screen.findByText("Vinyl Collection");
    expect(pageTitle).toBeInTheDocument();

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test("should not update db when masterdata request fail", async () => {
    const insertMany = jest.fn(() => Promise.resolve(true));
    const deleteMany = jest.fn(() => Promise.resolve(true));

    mockedDb.connectToDatabase.mockImplementation(() =>
      Promise.resolve({
        client: {} as unknown as MongoClient,
        db: {
          collection: jest.fn(() => ({
            find: jest.fn(() => ({
              toArray: jest.fn(() => Promise.resolve([])),
            })),
            insertMany,
            deleteMany,
          })),
        } as unknown as Db,
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

    const props = await runGetServerSideProps();

    expect(insertMany).toHaveBeenCalledTimes(1);
    expect(deleteMany).toHaveBeenCalledTimes(0);

    render(<Home {...props} />);

    const pageTitle = await screen.findByText("Vinyl Collection");
    expect(pageTitle).toBeInTheDocument();

    expect(screen.getAllByRole("article")).toHaveLength(1);
  });
});

async function runGetServerSideProps() {
  const { props } = (await getServerSideProps(
    {} as unknown as GetServerSidePropsContext
  )) as unknown as { props: any };

  if (!("albums" in props)) {
    throw new Error("Error in props");
  }

  return props;
}

const errorMessage = "Something went wrong when fetching albums";
