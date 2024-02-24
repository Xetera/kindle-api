import { Scenario } from "../scenario.js";
import { faker } from "@faker-js/faker";
import { defaultRequestBody } from "./fixtures/default-request-body.js";
import { sessionToken } from "./fixtures/tokens.js";
import { KindleBookData } from "../../book.js";

export function startSession({ books }: { books?: KindleBookData[] } = {}) {
  return {
    startSession: {
      request: {
        method: "post",
        url: "http://localhost:8080/api/forward",
        body: {
          ...defaultRequestBody,
          requestUrl:
            "https://read.amazon.com/kindle-library/search?query=&libraryType=BOOKS&sortType=acquisition_desc&querySize=50",
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
            itemsList: books ?? [],
          }),
        },
        meta: {
          books: books ?? [],
        },
      },
    },
    getDeviceToken: {
      request: {
        method: "post",
        url: "http://localhost:8080/api/forward",
        body: {
          ...defaultRequestBody,
          requestUrl:
            "https://read.amazon.com/service/web/register/getDeviceToken?serialNumber=bar&deviceType=bar",
          headers: {
            ...defaultRequestBody.headers,
            "x-amzn-sessionid": "2",
          },
        },
      },
      response: {
        status: 200,
        headers: {},
        body: {
          status: 200,
          cookies: {
            "session-id": faker.string.uuid(),
          },
          body: JSON.stringify({
            clientHashId: faker.string.uuid(),
            deviceName: faker.lorem.word(),
            deviceSessionToken: sessionToken,
            eid: faker.string.uuid(),
          }),
        },
      },
    },
  } satisfies Scenario;
}
