import "dotenv/config";
import { test, expect } from "vitest";
import { Kindle, KindleConfiguration } from "./kindle";

const cookies = process.env.COOKIES;

function config(): KindleConfiguration {
  const deviceToken = process.env.DEVICE_TOKEN;
  if (!(deviceToken && cookies)) {
    throw Error("Invalid configuration");
  }
  return {
    deviceToken,
    cookies,
    tlsServer: {
      // rome-ignore lint/style/noNonNullAssertion: <explanation>
      apiKey: process.env.TLS_SERVER_API_KEY!,
      // rome-ignore lint/style/noNonNullAssertion: <explanation>
      url: process.env.TLS_SERVER_URL!,
    },
  };
}

test(
  "gets base books list",
  async () => {
    const kindle = await Kindle.fromConfig(config());

    expect(kindle.defaultBooks).toBeDefined();
    console.log(await kindle.defaultBooks[3].fullDetails());
  },
  { timeout: 50000 }
);
