import { Scenario } from "../scenario";
import { sample1 } from "./fixtures/books";
import { defaultRequestBody } from "./fixtures/default-request-body";
import { sessionToken } from "./fixtures/tokens";

export const singlePages = {
  firstPage: {
    request: {
      method: "post",
      url: "http://localhost:8080/api/forward",
      body: {
        ...defaultRequestBody,
        requestUrl:
          "https://read.amazon.com/kindle-library/search?query=&libraryType=BOOKS&sortType=acquisition_desc&querySize=50",
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
        cookies: {
          "session-id": "2",
        },
        body: JSON.stringify({
          itemsList: [sample1],
        }),
      },
      meta: {
        books: [sample1],
      },
    },
  },
} satisfies Scenario;
