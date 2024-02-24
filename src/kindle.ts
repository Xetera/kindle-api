import { KindleBook } from "./book.js";
import { fetchBooks, toUrl } from "./fetch-books.js";
import {
  KindleRequiredCookies,
  HttpClient,
  TlsClientConfig,
} from "./http-client.js";
import { Filter, Query } from "./query-filter.js";

export type {
  KindleBook,
  KindleBookDetails,
  KindleBookData,
  KindleBookLightDetails,
  KindleAuthor,
} from "./book.js";
export type {
  KindleOwnedBookMetadataResponse,
  KindleBookMetadataResponse,
} from "./book-metadata.js";

export {
  HttpClient,
  type KindleRequiredCookies,
  type TlsClientConfig,
} from "./http-client.js";
export type {
  TLSClientRequestPayload,
  TLSClientResponseData,
} from "./tls-client-api.js";

export type KindleConfiguration = {
  /**
   * Cookie string copied from your browser or exact
   * requried cookies
   */
  cookies: KindleRequiredCookies | string;
  deviceToken: string;
  // Optional
  clientVersion?: string;
  tlsServer: TlsClientConfig;

  /**
   * Factory that creates or returns a custom instance of http client.
   */
  clientFactory?: (
    cookies: KindleRequiredCookies,
    clientOptions: TlsClientConfig
  ) => HttpClient;

  /**
   * Base url of the kindle service.
   * Amazon has different regional service endpoints, for example https://lesen.amazon.de/kindle-library (DACH region) or https://read.amazon.com/kindle-library (worldwide).
   * Path and query parameters will be ignored.
   *
   * @default "https://read.amazon.com"
   */
  baseUrl?: string;
};

export type KindleOptions = {
  config: KindleConfiguration;
  sessionId: string;
  baseUrl: string;
};

export type KindleFromCookieOptions = {
  cookieString: string;
  deviceToken: string;
};

export class Kindle {
  public static readonly BASE_URL = "https://read.amazon.com";

  public static readonly DEVICE_TOKEN_PATH =
    "service/web/register/getDeviceToken";

  public static readonly BOOKS_PATH =
    "kindle-library/search?query=&libraryType=BOOKS&sortType=recency&querySize=50";

  public static readonly DEFAULT_QUERY = Object.freeze({
    sortType: "acquisition_desc",
  } satisfies Query);

  public static readonly DEFAULT_FILTER = Object.freeze({
    querySize: 50,
    fetchAllPages: false,
  } satisfies Filter);

  /**
   * The default list of books fetched when setting up {@link Kindle}
   *
   * We need to hit up the books endpoint to get necessary cookies
   * so we save the initial response here just to make sure the
   * user doesn't have to run the same request twice for no reason
   */
  readonly defaultBooks: KindleBook[];
  readonly #client: HttpClient;
  readonly #baseUrl: string;

  constructor(
    private options: KindleOptions,
    client: HttpClient,
    // not necessary for initialization (if called from the outside)
    // so we're leaving this nullable
    prePopulatedBooks?: KindleBook[]
  ) {
    this.defaultBooks = prePopulatedBooks ?? [];
    this.#client = client;
    this.#baseUrl = options.baseUrl;
  }

  static async fromConfig(config: KindleConfiguration): Promise<Kindle> {
    const baseUrl = new URL(config.baseUrl ?? Kindle.BASE_URL).origin;
    const cookies =
      typeof config.cookies === "string"
        ? Kindle.deserializeCookies(config.cookies)
        : config.cookies;
    const client =
      config.clientFactory?.(cookies, config.tlsServer) ??
      new HttpClient(cookies, config.tlsServer);

    const { sessionId, books } = await Kindle.baseRequest(baseUrl, client);
    client.updateSession(sessionId);

    const deviceInfo = await Kindle.deviceToken(
      baseUrl,
      client,
      config.deviceToken
    );
    client.updateAdpSession(deviceInfo.deviceSessionToken);

    return new this(
      {
        config: {
          ...config,
          cookies,
        },
        sessionId,
        baseUrl,
      },
      client,
      books
    );
  }

  static async deviceToken(
    baseUrl: string,
    client: HttpClient,
    token: string
  ): Promise<KindleDeviceInfo> {
    const params = new URLSearchParams({
      serialNumber: token,
      deviceType: token,
    });
    const url = `${baseUrl}/${Kindle.DEVICE_TOKEN_PATH}?${params.toString()}`;
    const response = await client.request(url);
    return JSON.parse(response.body) as KindleDeviceInfo;
  }

  static async baseRequest(
    baseUrl: string,
    client: HttpClient,
    version?: string,
    args?: {
      query?: Query;
      filter?: Filter;
    }
  ): Promise<{
    books: KindleBook[];
    sessionId: string;
  }> {
    const query = {
      ...Kindle.DEFAULT_QUERY,
      ...args?.query,
    };
    const filter = {
      ...Kindle.DEFAULT_FILTER,
      ...args?.filter,
    };

    let allBooks: KindleBook[] = [];
    let latestSessionId: string | undefined;

    // loop until we get less than the requested amount of books or hit the limit
    do {
      const url = toUrl(baseUrl, query, filter);
      const { books, sessionId, paginationToken } = await fetchBooks(
        client,
        url,
        baseUrl,
        version
      );

      latestSessionId = sessionId;

      allBooks = [...allBooks, ...books];

      // update offset
      filter.paginationToken = paginationToken;
    } while (
      filter.paginationToken !== undefined &&
      filter.fetchAllPages === true
    );

    return {
      books: allBooks,
      sessionId: latestSessionId,
    };
  }

  async books(args?: {
    query?: Query;
    filter?: Filter;
  }): Promise<KindleBook[]> {
    const result = await Kindle.baseRequest(
      this.#baseUrl,
      this.#client,
      undefined,
      args
    );
    // refreshing the internal session every time books is called.
    // This doesn't prevent us from calling the books endpoint but
    // it does prevent requesting the metadata of individual books
    this.options.sessionId = result.sessionId;
    return result.books;
  }

  static deserializeCookies(cookies: string): KindleRequiredCookies {
    const values = cookies
      .split(";")
      .map((v) => v.split("="))
      .reduce((acc, [key, value]) => {
        acc[decodeURIComponent(key.trim())] = decodeURIComponent(value.trim());
        return acc;
      }, {} as Record<string, string>);

    return {
      atMain: values["at-main"],
      sessionId: values["session-id"],
      ubidMain: values["ubid-main"],
      xMain: values["x-main"],
    };
  }
}

export interface KindleDeviceInfo {
  clientHashId: string;
  deviceName: string;
  deviceSessionToken: string;
  eid: string;
}
