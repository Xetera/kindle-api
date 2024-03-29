import "dotenv/config";
import { test, expect, describe } from "vitest";
import { Kindle, KindleConfiguration } from "./kindle.js";
import { useScenario } from "./__test__/scenario.js";
import { singleBook } from "./__test__/scenarios/single-book.js";
import { multiplePages } from "./__test__/scenarios/multiple-pages.js";
import { startSession } from "./__test__/scenarios/start-session.js";
import { Filter } from "./query-filter.js";

const cookies = process.env.COOKIES;

function config(): KindleConfiguration {
  const deviceToken = process.env.DEVICE_TOKEN;
  if (!(deviceToken && cookies)) {
    throw Error("Invalid configuration");
  }
  return {
    deviceToken,
    cookies,
    tlsServer: {
      // rome-ignore lint/style/noNonNullAssertion: <explanation>
      apiKey: process.env.TLS_SERVER_API_KEY!,
      // rome-ignore lint/style/noNonNullAssertion: <explanation>
      url: process.env.TLS_SERVER_URL!,
    },
  };
}

test("should fetch first page when created", async () => {
  // given
  const { getBookDetails } = useScenario(singleBook);
  useScenario(startSession({ books: getBookDetails.meta.books }), {
    append: true,
  });

  // when
  const kindle = await Kindle.fromConfig(config());

  // then
  expect(kindle.defaultBooks).toMatchSnapshot();
  expect(await kindle.defaultBooks[0].fullDetails()).toMatchSnapshot();
});

describe("pagination", () => {
  test.each([
    {
      fetchAllPages: undefined,
    },
    {
      fetchAllPages: false,
    },
  ] satisfies Filter[])(
    "should only get the first page of book results when %s",
    async (filter) => {
      // given
      useScenario(startSession()); // used for initial setup
      const kindle = await Kindle.fromConfig(config());
      expect(kindle.defaultBooks.length).toBe(0);

      useScenario(multiplePages); // used for this test

      // when
      const books = await kindle.books({ filter });

      // then
      expect(books).toMatchSnapshot();
      expect(books.length).toBe(1);
    }
  );

  test("should fetch all books when fetchAllPages=true", async () => {
    // given
    useScenario(startSession()); // used for initial setup
    const kindle = await Kindle.fromConfig(config());
    expect(kindle.defaultBooks.length).toBe(0);

    useScenario(multiplePages); // used for this test

    // when
    const books = await kindle.books({ filter: { fetchAllPages: true } });

    // then
    expect(books).toMatchSnapshot();
    expect(books.length).toBe(2);
  });
});
