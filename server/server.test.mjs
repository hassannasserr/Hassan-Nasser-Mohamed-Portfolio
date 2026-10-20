import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createApp } from "./app.mjs";
test("Node serves the compiled Angular app, real project images, and exact CV download", async () => {
  const server = createApp().listen(0);
  await new Promise((r) => server.once("listening", r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const response = await fetch(origin + "/api/portfolio");
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.name, "Hassan Nasser");
    assert.equal(data.projects.length, 4);
    assert.equal(data.community.length, 4);
    assert.equal((await fetch(origin + "/api/missing")).status, 404);
    assert.equal((await fetch(origin + "/api/health")).status, 200);
    const page = await fetch(origin + "/");
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.match(html, /<app-root>/);
    const main = html.match(/src="(main-[^"]+\.js)"/);
    assert.ok(main);
    assert.equal((await fetch(origin + "/" + main[1])).status, 200);
    const fallback = await fetch(origin + "/data/portfolio.json");
    assert.deepEqual(await fallback.json(), data);
    assert.equal((await fetch(origin + "/images/missing.jpg")).status, 404);
    const images = new Set([
      "profile.png",
      ...data.projects.flatMap((p) => [p.image, ...p.gallery]),
      ...data.community.map((c) => c.image),
    ]);
    for (const name of images) {
      const asset = await fetch(origin + "/images/" + name);
      assert.equal(asset.status, 200, name);
      assert.match(asset.headers.get("content-type"), /^image\//);
    }
    const cv = await fetch(origin + data.cv);
    assert.equal(cv.status, 200);
    assert.match(cv.headers.get("content-type"), /application\/pdf/);
    assert.match(
      cv.headers.get("content-disposition"),
      /attachment; filename="?Hassan_Nasser_CV\.pdf"?/,
    );
    const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
    assert.equal(
      hash(Buffer.from(await cv.arrayBuffer())),
      hash(
        await readFile(
          new URL("../public/Hassan_Nasser_CV.pdf", import.meta.url),
        ),
      ),
    );
  } finally {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
});
