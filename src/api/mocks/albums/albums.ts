import { Raw, RawMasterData } from "api/albums/albums.Raw";
import { MockedRequest, ResponseComposition, rest } from "msw";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import handlerGetAlbums from "pages/api/albums";

import mockDataReleases from "./releasesMockData.json";

export const getReleases = () =>
  rest.get<{}, {}, Raw>(
    "https://api.discogs.com/users/*",
    function resolver(_, res, ctx) {
      const albums = [...mockDataReleases.releases].map(function immutable(a) {
        return {
          ...a,
        };
      });

      albums.forEach(function cleanMasterData(album) {
        // Master data is not included in real response
        delete album["masterData"];
      });

      return res(
        ctx.status(200),
        ctx.delay(1000),
        ctx.json({
          ...mockDataReleases,
          releases: albums,
        })
      );
    }
  );

export const getMasterData = () =>
  rest.get<{}, { releaseId: string }, RawMasterData | Partial<RawMasterData>>(
    "https://api.discogs.com/masters/:releaseId",
    function resolver(req, res, ctx) {
      const { releaseId } = req.params;

      const found = mockDataReleases.releases.find(function masterData(
        release
      ) {
        return release.basic_information.master_id.toString() === releaseId;
      });

      return res(
        ctx.json(
          found
            ? found.masterData
            : {
                tracklist: [],
                videos: [],
                year: 1900,
              }
        )
      );
    }
  );

export const getApiAlbums = rest.get(
  "/api/albums",
  withHandler(handlerGetAlbums as unknown as NextApiHandler)
);

function withHandler(
  handlerFunc: NextApiHandler,
  headers?: [string, string][],
  reqOverride?: Record<string, unknown>
) {
  return async (req: any, res: any, ctx: any) => {
    headers?.forEach(([name, value]) => req.headers.set(name, value));
    const { status, data } = await handler(
      { ...req, ...reqOverride },
      res
    )(handlerFunc);

    return res(ctx.status(status), ctx.json(data));
  };
}

/**
 * The request and response object differs in MSW and Next.
 * This handler formats the object to the Next format which
 * enables us to run our actual API handler in unit tests.
 */
const handler = (req: MockedRequest, res: ResponseComposition) => {
  const result: { status: number; data: unknown } = {
    status: 500,
    data: undefined,
  };
  const { searchParams } = req.url;
  const query: Record<string, unknown> = {};
  searchParams.forEach((v, k) => {
    query[k] = v;
  });

  return async (handler: NextApiHandler) => {
    void (await handler(
      { ...req, query } as unknown as NextApiRequest,
      {
        ...res,
        setHeader: () => {},
        status: (statusCode: number) => {
          result.status = statusCode;
          return {
            json: (json: Record<string, unknown>) => {
              result.data = json;
            },
            send: (data: unknown) => {
              result.data = data;
            },
            end: (data: unknown) => {
              result.data = data;
            },
          };
        },
      } as unknown as NextApiResponse
    ));

    return result;
  };
};
