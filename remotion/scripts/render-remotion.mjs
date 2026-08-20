import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser, renderStill } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stillsOnly = process.argv.includes("--stills");

const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (config) => config,
});

const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({
  serveUrl: bundled,
  id: "main",
  puppeteerInstance: browser,
});

if (stillsOnly) {
  for (const frame of [40, 200, 420, 700, 900, 1120, 1250]) {
    await renderStill({
      composition,
      serveUrl: bundled,
      output: `/tmp/qa/frame-${frame}.png`,
      frame,
      puppeteerInstance: browser,
      overwrite: true,
    });
    console.log("still", frame);
  }
} else {
  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: "/tmp/render/silent.mp4",
    puppeteerInstance: browser,
    muted: true,
    concurrency: 1,
    onProgress: ({ progress }) => {
      if (Math.round(progress * 100) % 10 === 0) console.log("progress", Math.round(progress * 100));
    },
  });
}

await browser.close({ silent: false });
