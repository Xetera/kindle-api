import { faker } from "@faker-js/faker";
import { TLSClientResponseData } from "../../kindle.js";
import { Scenario } from "../scenario.js";
import { sample1, sample1Details, sample1MetaData } from "./fixtures/books.js";
import { defaultRequestBody } from "./fixtures/default-request-body.js";
import { sessionToken } from "./fixtures/tokens.js";

export function unexpectedResponse({
  startSessionResponse,
  getBookDetailsResponse,
  getBookMetaDataResponse,
  getDeviceTokenResponse,
}: {
  startSessionResponse?: TLSClientResponseData;
  getBookDetailsResponse?: TLSClientResponseData;
  getBookMetaDataResponse?: TLSClientResponseData;
  getDeviceTokenResponse?: TLSClientResponseData;
}) {
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
        body: startSessionResponse ?? {
          status: 200,
          cookies: {
            "session-id": "2",
          },
          body: JSON.stringify({
            itemsList: [sample1],
          }),
        },
        meta: {
          response: startSessionResponse,
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
        body: getDeviceTokenResponse ?? {
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
        body: getBookDetailsResponse ?? {
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
        body: getBookMetaDataResponse ?? {
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
}
