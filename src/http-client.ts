import initCycleTLS, { CycleTLSClient, CycleTLSResponse } from "cycletls";

export const JA3_SIGNATURE =
	"771,255-49195-49199-49196-49200-49171-49172-156-157-47-53,0-10-11-13,23-24,0";

export const USER_AGENT =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";

const JSONP_REGEX = /\(({.*})\)/;

/**
 * HTTPClient for doing http requests
 * Can be initialized with a custom CycleTLSClient
 */
export class HttpClient {
	private sessionId?: string;
	private adpSessionId?: string;

	constructor(
		private readonly cookies: KindleRequiredCookies,
		private readonly client: CycleTLSClient,
	) {}

	static async initialize(cookies: KindleRequiredCookies) {
		const client = await TLSClient.instance();
		return new this(cookies, client);
	}

	async request(url: string, args?: Parameters<CycleTLSClient>[1]) {
		const headers: Record<string, string> = {
			Cookie: this.serializeCookies(),
			...args?.headers,
		};
		if (this.sessionId) {
			headers["x-amzn-sessionid"] = this.sessionId;
		}

		if (this.adpSessionId) {
			headers["x-adp-session-token"] = this.adpSessionId;
		}
		return this.client(url, {
			...args,
			headers,
			userAgent: USER_AGENT,
			ja3: JA3_SIGNATURE,
		});
	}

	parseJsonpResponse<T>(response: CycleTLSResponse): T | undefined {
		const content = response.body.match(JSONP_REGEX)?.[1];
		if (!content) {
			return;
		}

		return JSON.parse(content);
	}

	updateSession(id: string): void {
		this.sessionId = id;
	}

	updateAdpSession(id: string): void {
		this.adpSessionId = id;
	}

	extractSetCookies(response: CycleTLSResponse): Record<string, string> {
		const set = response.headers["Set-Cookie"] as string[];
		return Object.fromEntries(
			set.map((setCookie) => {
				const [key, value] = setCookie.split("=");
				return [key, value.split(";")[0]];
			}),
		);
	}

	serializeCookies(): string {
		return Object.entries(this.cookies)
			.map(
				([key, value]) =>
					`${key.replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`)}=${value}`,
			)
			.join("; ")
			.trim();
	}
}

/**
 * Cycletls has a strange initialization pattern
 * that resembles a singleton but isn't actually one.
 *
 * So we wrap it in a real singleton to avoid initializing it
 * multiple times
 */
export class TLSClient {
	private static client?: CycleTLSClient;

	static async instance(
		params?: Parameters<typeof initCycleTLS>[0],
	): Promise<CycleTLSClient> {
		if (TLSClient.client) {
			return TLSClient.client;
		}
		const client = await initCycleTLS(params);
		TLSClient.client = client;

		return client;
	}

	static destroy() {
		if (!TLSClient.client) {
			return;
		}
		return TLSClient.client.exit();
	}
}

export type KindleRequiredCookies = {
	ubidMain: string;
	atMain: string;
	sessionId: string;
};
