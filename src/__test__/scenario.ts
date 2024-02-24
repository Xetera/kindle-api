import isEqual from "lodash.isequal";
import { server } from "./setup.msw.js";
import { HttpResponse, http } from "msw";
import { diffString } from "json-diff";

export interface RequestResponsePair {
  request: {
    method: "get" | "post" | "put" | "delete";
    url: string;
    body?: any;
  };
  response: {
    headers: Record<string, string | string[]>;
    body?: any;
    status: number;

    meta?: any;
  };
}

export type Scenario = Record<string, RequestResponsePair>;

type Extractor<T extends Record<string, { response: { body?: any } }>> = {
  [K in keyof T]: T[K]["response"];
};

export function useScenario<T extends Scenario>(
  scenario: T,
  { append }: { append?: boolean } = {}
): Extractor<T> {
  if (append === false || append === undefined) {
    server.resetHandlers(...[]);
  }

  const requests = Object.entries(scenario);
  requests.reverse();

  const expectedResponses: Record<string, any> = {};

  for (const [
    requestName,
    {
      request: { method, url, body: requestBody },
      response,
    },
  ] of requests) {
    server.use(
      http[method](
        url,
        async (ctx) => {
          const actualRequestBody = await ctx.request.json();
          if (
            requestBody != null &&
            isEqual(requestBody, actualRequestBody) === false
          ) {
            console.error(
              `Unexpected request body for request ${requestName} at ${url}`
            );
            console.error(
              diffString(requestBody, actualRequestBody, {
                full: true,
                verbose: true,
              })
            );
            throw new Error("Unexpected request body");
          }

          if (response.body != null) {
            return HttpResponse.json(response.body, {
              status: response.status,
            });
          }

          return new HttpResponse(undefined, { status: response.status });
        },
        {
          once: true,
        }
      )
    );

    expectedResponses[requestName] = response;
  }

  return expectedResponses as Extractor<T>;
}
