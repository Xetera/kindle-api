import { test, expect } from "vitest";
import { Kindle, KindleConfiguration } from "./kindle";

function config(): KindleConfiguration {
	const deviceToken = process.env.DEVICE_TOKEN;
	const cookies = process.env.COOKIES;
	if (!(deviceToken && cookies)) {
		throw Error("Invalid configuration");
	}
	return { deviceToken, cookies };
}

test("gets base books list", async () => {
	const kindle = await Kindle.fromConfig(config());

	expect(kindle.defaultBooks).toBeDefined();
	console.log(await kindle.defaultBooks[3].fullDetails());
	await kindle.destroy();
});
