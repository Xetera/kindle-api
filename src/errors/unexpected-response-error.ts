import { TLSClientResponseData } from "../kindle";

export class UnexpectedResponseError extends Error {
  constructor(message: string, public response: TLSClientResponseData) {
    super(message);
  }

  public static isOk(response: TLSClientResponseData): boolean {
    return response.status >= 200 && response.status < 300;
  }

  public static unexpectedStatusCode(resp: TLSClientResponseData) {
    return new UnexpectedResponseError(
      `Unexpected status code: ${resp.status}`,
      resp
    );
  }
}
