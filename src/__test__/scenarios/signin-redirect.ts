import { TLSClientResponseData } from "../../kindle";
import { unexpectedResponse } from "./unexpected-response";

export function signinRedirect() {
  const response = {
    headers: {
      Location: [
        "https://www.amazon.com/ap/signin?openid.pape.max_auth_age=1209600&openid.return_to=foobar",
      ],
    },
    status: 302,
    body: "{}",
    cookies: {},
    target:
      "https://read.amazon.com/kindle-library/search?query=&libraryType=BOOKS&sortType=acquisition_desc&querySize=50",
  } satisfies TLSClientResponseData;

  return unexpectedResponse({ response });
}
