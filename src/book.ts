import {
  KindleBookMetadataResponse,
  KindleOwnedBookMetadataResponse,
} from "./book-metadata.js";
import { HttpClient } from "./http-client.js";

export class KindleBook {
  public readonly title: string;
  public readonly authors: KindleAuthor[];
  public readonly imageUrl: string;
  public readonly asin: string;
  public readonly originType: string;
  public readonly productUrl: string;
  public readonly mangaOrComicAsin: boolean;
  public readonly webReaderUrl: string;
  public readonly resourceType: string;

  readonly #client: HttpClient;
  readonly #version: string;
  readonly #baseUrl: string;

  constructor(
    options: KindleBookData,
    client: HttpClient,
    baseUrl: string,
    version?: string
  ) {
    this.title = options.title;
    this.authors = KindleBook.normalizeAuthors(options.authors);
    this.imageUrl = options.productUrl;
    this.asin = options.asin;
    this.originType = options.originType;
    this.resourceType = options.resourceType;
    this.mangaOrComicAsin = options.mangaOrComicAsin;
    this.webReaderUrl = options.webReaderUrl;
    this.productUrl = options.productUrl;

    this.#client = client;
    this.#version = version ?? "2000010";
    this.#baseUrl = baseUrl;
  }

  /**
   * Basic details about the book.
   * If you need progress information you need to
   * call {@link KindleBook#fullDetails}
   * @returns
   */
  async details(): Promise<KindleBookLightDetails> {
    const response = await this.#client.request(
      `${this.#baseUrl}/service/mobile/reader/startReading?asin=${
        this.asin
      }&clientVersion=${this.#version}`
    );
    const info = JSON.parse(response.body) as KindleOwnedBookMetadataResponse;

    return {
      title: this.title,
      asin: this.asin,
      authors: this.authors,
      bookType: info.isSample ? "sample" : info.isOwned ? "owned" : "unknown",
      formatVersion: info.formatVersion,
      mangaOrComicAsin: this.mangaOrComicAsin,
      originType: this.originType,
      /** deprecated */
      productUrl: this.productUrl,
      coverUrl: this.productUrl,
      largeCoverUrl: KindleBook.toLargeImage(this.productUrl),
      metadataUrl: info.metadataUrl,
      progress: {
        reportedOnDevice: info.lastPageReadData.deviceName,
        position: info.lastPageReadData.position,
        syncDate: new Date(info.lastPageReadData.syncTime),
      },
      webReaderUrl: this.webReaderUrl,
      srl: info.srl,
    };
  }

  /**
   * Gets detailed information about the book.
   * Fires 2 http requests under the hood if previous details not given.
   */
  async fullDetails(
    partialDetails?: KindleBookLightDetails
  ): Promise<KindleBookDetails> {
    const info = partialDetails ?? (await this.details());
    const response = await this.#client.request(info.metadataUrl);

    const meta =
      this.#client.parseJsonpResponse<KindleBookMetadataResponse>(response);

    if (!meta) {
      throw Error("Something went wrong fetching book metadata");
    }

    const roughDecimal =
      ((meta.startPosition ?? 0) + info.progress.position) / meta.endPosition;

    // rounding 0.996 to 1
    const percentageRead = Number(roughDecimal.toFixed(3)) * 100;

    return {
      ...info,
      percentageRead,
      releaseDate: meta.releaseDate,
      startPosition: meta.startPosition,
      endPosition: meta.endPosition,
      publisher: meta.publisher,
    };
  }

  static normalizeAuthors(rawAuthors: string[]): KindleAuthor[] {
    if (rawAuthors.length === 0) {
      return [];
    }
    const [rawAuthor] = rawAuthors;
    // Kindle API truly has the most cursed authors data structure of all time
    return Array.from(new Set(rawAuthor.split(":").filter(Boolean)), (name) => {
      const [lastName, firstName] = name
        .split(",")
        .map((elems) => elems.trim());

      // sometimes an author only has one name like "Maddox"
      if (!firstName) {
        return {
          firstName: lastName,
          lastName: "",
        };
      }

      return {
        firstName,
        lastName,
      };
    });
  }

  static toLargeImage(url: string): string {
    return url.replace(/\._SY\d+_\./g, ".");
  }
}

export interface KindleAuthor {
  /**
   * A first name also includes (if applicable)
   * both given and middle names
   */
  firstName: string;
  lastName: string;
}

export interface KindleBookData {
  title: string;
  asin: string;
  authors: string[];
  mangaOrComicAsin: boolean;
  resourceType: "EBOOK" | "EBOOK_SAMPLE" | (string & {});
  originType: string;
  /* this is always 0 */
  percentageRead: number;
  productUrl: string;
  webReaderUrl: string;
}

export interface KindleBookLightDetails {
  title: string;
  bookType: "owned" | "sample" | "unknown";
  mangaOrComicAsin: boolean;
  formatVersion: string;
  progress: {
    reportedOnDevice: string;
    position: number;
    syncDate: Date;
  };
  asin: string;
  originType: string;
  authors: KindleAuthor[];
  /** @deprecated use {@link KindleBookLightDetails#coverUrl} */
  productUrl: string;
  /**
   * Heavily compressed image url of the book cover, use {@link KindleBookLightDetails#largeCoverUrl} for a better quality
   */
  coverUrl: string;
  largeCoverUrl: string;
  webReaderUrl: string;
  srl: number;
  metadataUrl: string;
}

export interface KindleBookDetails extends KindleBookLightDetails {
  publisher?: string;
  releaseDate: string;
  startPosition: number;
  endPosition: number;
  percentageRead: number;
}
