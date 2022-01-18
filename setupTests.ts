import "@testing-library/jest-dom/extend-expect";
import "cross-fetch/polyfill";

import { server } from "api/mocks/server";

beforeAll(() => server.listen());

// if you need to add a handler after calling setupServer for some specific test
// this will remove that handler for the rest of them
// (which is important for test isolation):
afterEach(() => server.resetHandlers());

afterAll(() => server.close());

// TODO investigate .env.test
process.env.DISCOGS_TOKEN = "Discogs token=test";
process.env.DISCOGS_USER_AGENT = "test";
process.env.DISCOGS_ENDPOINT_RELEASES = "https://api.discogs.com/users/";
process.env.DB_NAME = "vinyl_test";
process.env.DB_URI = "test";
