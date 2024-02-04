import { Scenario } from "../scenario.js";
import { sample1, sample1Details, sample1MetaData } from "./fixtures/books.js";
import { defaultRequestBody } from "./fixtures/default-request-body.js";
import { sessionToken } from "./fixtures/tokens.js";

export const singleBook = {
  getBookDetails: {
    request: {
      method: "post",
      url: "http://localhost:8080/api/forward",
      body: {
        ...defaultRequestBody,
        requestUrl:
          "https://read.amazon.com/service/mobile/reader/startReading?asin=B000FBJG4U&clientVersion=2000010",
        headers: {
          ...defaultRequestBody.headers,
          "x-amzn-sessionid": "2",
          "x-adp-session-token": sessionToken,
        },
      },
    },
    response: {
      headers: {},
      status: 200,
      body: {
        status: 200,
        cookies: {
          "session-id": "2",
        },
        body: JSON.stringify({
          ...sample1Details,
        }),
      },
      meta: {
        books: [sample1],
      },
    },
  },
  getBookMetaData: {
    request: {
      method: "post",
      url: "http://localhost:8080/api/forward",
      body: {
        ...defaultRequestBody,
        requestUrl:
          "https://read.amazon.com/service/metadata/lookup?asin=B000FBJG4U&metadataVersion=1",
        headers: {
          ...defaultRequestBody.headers,
          "x-amzn-sessionid": "2",
          "x-adp-session-token": sessionToken,
        },
      },
    },
    response: {
      headers: {},
      status: 200,
      body: {
        status: 200,
        cookies: {
          "session-id": "2",
        },
        body: `(${JSON.stringify({
          ...sample1MetaData,
        })})`,
      },
    },
  },
} satisfies Scenario;
