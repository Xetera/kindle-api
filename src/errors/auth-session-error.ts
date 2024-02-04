import { TLSClientResponseData } from "../kindle";

export class AuthSessionError extends Error {
  constructor(message: string, public response: TLSClientResponseData) {
    super(message);
  }

  public static isSignInRedirect(response: TLSClientResponseData): boolean {
    return (
      response.status === 302 &&
      Array.isArray(response.headers.Location) &&
      response.headers.Location.length > 0 &&
      response.headers.Location[0].startsWith(
        "https://www.amazon.com/ap/signin"
      )
    );
  }

  static sessionExpired(resp: TLSClientResponseData) {
    return new AuthSessionError("Session expired", resp);
  }
}
