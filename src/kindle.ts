import { KindleBook, KindleBookData } from "./book.js";
import { KindleRequiredCookies, HttpClient, TLSClient } from "./http-client.js";

export type { KindleBook, KindleBookDetails } from "./book.js";
export type { KindleOwnedBookMetadataResponse } from "./book-metadata";

export type KindleConfiguration = {
	/**
	 * Cookie string copied from your browser or exact
	 * requried cookies
	 */
	cookies: KindleRequiredCookies | string;
	deviceToken: string;
	// Optional
	clientVersion?: string;
};

export type KindleOptions = {
	config: KindleConfiguration;
	sessionId: string;
};

export type KindleFromCookieOptions = {
	cookieString: string;
	deviceToken: string;
};

export class Kindle {
	public static DEVICE_TOKEN_URL =
		"https://read.amazon.com/service/web/register/getDeviceToken";
	public static readonly BOOKS_URL =
		"https://read.amazon.com/kindle-library/search?query=&libraryType=BOOKS&sortType=recency&querySize=50";

	/**
	 * The default list of books fetched when setting up {@link Kindle}
	 *
	 * We need to hit up the books endpoint to get necessary cookies
	 * so we save the initial response here just to make sure the
	 * user doesn't have to run the same request twice for no reason
	 */
	readonly defaultBooks: KindleBook[];
	readonly #client: HttpClient;

	constructor(
		private options: KindleOptions,
		client: HttpClient,
		// not necessary for initialization (if called from the outside)
		// so we're leaving this nullable
		prePopulatedBooks?: KindleBook[],
	) {
		this.defaultBooks = prePopulatedBooks ?? [];
		this.#client = client;
	}

	/**
	 * Destroys the underlying go server.
	 */
	async destroy() {
		await TLSClient.destroy();
	}

	static async fromConfig(config: KindleConfiguration): Promise<Kindle> {
		const cookies =
			typeof config.cookies === "string"
				? Kindle.deserializeCookies(config.cookies)
				: config.cookies;
		const client = new HttpClient(cookies);

		const { sessionId, books } = await Kindle.baseRequest(client);
		client.updateSession(sessionId);
		const deviceInfo = await Kindle.deviceToken(client, config.deviceToken);
		client.updateAdpSession(deviceInfo.deviceSessionToken);

		return new this(
			{
				config: { cookies, deviceToken: config.deviceToken },
				sessionId,
			},
			client,
			books,
		);
	}

	static async deviceToken(
		client: HttpClient,
		token: string,
	): Promise<KindleDeviceInfo> {
		const params = new URLSearchParams({
			serialNumber: token,
			deviceType: token,
		});
		const url = `${Kindle.DEVICE_TOKEN_URL}?${params.toString()}`;
		const response = await client.request(url);
		return response.body as KindleDeviceInfo;
	}

	static async baseRequest(
		client: HttpClient,
		version?: string,
	): Promise<{
		books: KindleBook[];
		sessionId: string;
	}> {
		type Response = {
			itemsList: KindleBookData[];
		};

		const response = await client.request(Kindle.BOOKS_URL);
		const newCookies = client.extractSetCookies(response);
		const sessionId = newCookies["session-id"];

		return {
			books: (response.body as Response).itemsList.map(
				(book) => new KindleBook(book, client, version),
			),
			sessionId,
		};
	}

	async books(): Promise<KindleBook[]> {
		const result = await Kindle.baseRequest(this.#client);
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
		};
	}
}

export interface KindleDeviceInfo {
	clientHashId: string;
	deviceName: string;
	deviceSessionToken: string;
	eid: string;
}
