import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./setup.msw";

beforeAll(() =>
  server.listen({
    onUnhandledRequest: "error",
  })
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
