import { KindleBook, KindleBookData } from "./book.js";
import { AuthSessionError } from "./errors/auth-session-error.js";
import { UnexpectedResponseError } from "./errors/unexpected-response-error.js";
import { HttpClient } from "./http-client.js";
import { Kindle } from "./kindle.js";
import { Query, Filter } from "./query-filter.js";

export async function fetchBooks(
  client: HttpClient,
  url: string,
  version?: string
): Promise<{
  books: KindleBook[];
  sessionId: string;
  paginationToken?: string;
}> {
  type Response = {
    itemsList: KindleBookData[];
    paginationToken: string;
  };

  const resp = await client.request(url);

  if (AuthSessionError.isSignInRedirect(resp)) {
    throw AuthSessionError.sessionExpired(resp);
  } else if (!UnexpectedResponseError.isOk(resp)) {
    throw UnexpectedResponseError.unexpectedStatusCode(resp);
  }

  const newCookies = client.extractSetCookies(resp);
  const sessionId = newCookies["session-id"];

  const body = JSON.parse(resp.body) as Response;
  return {
    books: body.itemsList.map((book) => new KindleBook(book, client, version)),
    sessionId,
    paginationToken: body.paginationToken,
  };
}

export function toUrl(query: Query, filter: Filter): string {
  const url = new URL(Kindle.BOOKS_URL);
  const searchParams = {
    ...query,
    ...filter,
  };

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "fetchAllPages") {
      continue; // pagination handling is internal only and not part of the kindle api
    }

    if (value !== undefined) {
      url.searchParams.set(key, value.toString());
    } else {
      url.searchParams.delete(key);
    }
  }

  return url.toString();
}
