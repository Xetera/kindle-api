import { TLSClientResponseData } from "../../kindle";
import { Scenario } from "../scenario";
import { defaultRequestBody } from "./fixtures/default-request-body";

export function unexpectedResponse({
  response,
}: {
  response: TLSClientResponseData;
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
        body: response,
        meta: {
          response,
        },
      },
    },
  } satisfies Scenario;
}
