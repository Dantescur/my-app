import { serve } from "@hono/node-server";
import playwright from "playwright-core";
import { Hono } from "hono";

const app = new Hono();

const token = "QlsEnjEptEj6sG9103b502c30acc4d1574803f8441";
const pwdEndpoint = `wss://production-sfo.browserless.io/firefox/playwright?token=${token}`;

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/screen", async (c) => {
  try {
    const browser = await playwright.firefox.connect(pwdEndpoint);
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://api.chatwars.me/webview/map");
    // await new Promise((resolve) => setTimeout(resolve, 5000));
    const screenBuffer = await page.locator(".map-grid-wrapper").screenshot({
      type: "jpeg",
      quality: 100,
    });
    await browser.close();
    return c.body(screenBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error taking the screenshoot ", error);
    return c.body("Error taking the screenshot ", { status: 500 });
  }
});

const port = Number(process.env.PORT) || 4000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
