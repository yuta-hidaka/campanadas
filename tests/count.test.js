import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
const source = readFileSync(new URL("../screens/Count.tsx", import.meta.url), "utf8");
const start = source.indexOf('  const text = "Prepararos');
const end = source.indexOf("  useEffect(() => {", start);
if (start < 0 || end < 0)
  throw new Error("Count callback source was not found");
const transpiler = new Bun.Transpiler({ loader: "ts" });
const createCallback = new Function("useState", "Audio", "require", "interstitialAd", "setTimeout", "GRAPE", transpiler.transformSync(`${source.slice(start, end)}
return onChange;`));
function screen(isTest = false) {
  const state = [];
  const events = [];
  const timers = [];
  let cursor = 0;
  const cannon = {
    start: () => events.push("confetti:start"),
    stop: () => events.push("confetti:stop")
  };
  const useState = (initial) => {
    const index = cursor++;
    if (!(index in state)) {
      state[index] = index === 2 ? cannon : index === 3 ? isTest : initial;
    }
    return [state[index], (value) => {
      state[index] = value;
    }];
  };
  const Audio = { Sound: { createAsync: async (asset) => ({ sound: {
    playAsync: async () => {
      events.push(`play:${asset}`);
    },
    unloadAsync: async () => {
      events.push(`unload:${asset}`);
    }
  } }) } };
  return {
    events,
    timers,
    get grape() {
      return state[1];
    },
    get label() {
      return state[9];
    },
    async tick(now) {
      cursor = 0;
      const onChange = createCallback(useState, Audio, (asset) => asset.split("/").pop(), { show: () => events.push("ad:show") }, (callback, delay) => {
        events.push(`timer:${delay}`);
        timers.push(callback);
      }, 12);
      onChange(now);
      await Promise.resolve();
    }
  };
}
const local = (year, month, day, hour, minute, second) => new Date(year, month - 1, day, hour, minute, second);
function plays(events) {
  return events.filter((event) => event.startsWith("play:"));
}
describe("Count local New Year window", () => {
  test("does not ring on New Year's Day at noon", async () => {
    const count = screen();
    await count.tick(local(2027, 1, 1, 12, 0, 3));
    expect(plays(count.events)).toEqual([]);
    expect(count.grape).toBe(12);
  });
  test("does not play cuartos on New Year's Eve at noon", async () => {
    const count = screen();
    await count.tick(local(2026, 12, 31, 12, 0, 44));
    expect(count.events).toEqual([]);
    expect(count.label).toBe("Prepararos para comer las uvas !!!");
  });
  test("rejects adjacent dates, hours and minutes for every timed phase", async () => {
    const outside = [
      [2026, 12, 30, 23, 59],
      [2026, 12, 31, 22, 59],
      [2026, 12, 31, 23, 58],
      [2027, 1, 1, 0, 1],
      [2027, 1, 1, 1, 0],
      [2027, 1, 2, 0, 0]
    ];
    for (const [year, month, day, hour, minute] of outside) {
      const count = screen();
      for (const second of [3, 34, 36, 44, 58, 0]) {
        await count.tick(local(year, month, day, hour, minute, second));
      }
      expect(count.events).toEqual([]);
      expect(count.grape).toBe(12);
      expect(count.label).toBe("Prepararos para comer las uvas !!!");
    }
  });
  test("prepares, plays cuartos and labels the coming bells before midnight", async () => {
    const count = screen();
    await count.tick(local(2026, 12, 31, 23, 59, 36));
    expect(plays(count.events)).toEqual(["play:bell2.mp3"]);
    await count.tick(local(2026, 12, 31, 23, 59, 44));
    expect(plays(count.events)).toEqual(["play:bell2.mp3", "play:cuartos.mp3"]);
    expect(count.label).toBe("Los Cuartos  !!!");
    await count.tick(local(2026, 12, 31, 23, 59, 58));
    expect(count.label).toBe("Las Campanadas  !!!");
    expect(count.grape).toBe(12);
  });
  test("rings all 12 bells across midnight and celebrates after the final bell", async () => {
    const count = screen();
    await count.tick(local(2026, 12, 31, 23, 59, 58));
    for (let second = 0;second <= 33; second += 3) {
      await count.tick(local(2027, 1, 1, 0, 0, second));
      expect(count.grape).toBe(12 - second / 3);
    }
    expect(plays(count.events)).toEqual(Array(12).fill("play:bell.mp3"));
    await count.tick(local(2027, 1, 1, 0, 0, 34));
    expect(plays(count.events).at(-1)).toBe("play:cheer.mp3");
    expect(count.grape).toBe(0);
    expect(count.label).toBe("Feliz año nuevo!!!\uD83E\uDD73");
    expect(count.events).toContain("confetti:start");
    expect(count.events).toContain("timer:5000");
    count.timers[0]();
    expect(count.events.slice(-2)).toEqual(["ad:show", "confetti:stop"]);
    expect(count.grape).toBe(12);
  });
  test("does not restart preparation after the celebration", async () => {
    const count = screen();
    await count.tick(local(2027, 1, 1, 0, 0, 34));
    count.events.length = 0;
    for (const second of [36, 44, 58, 59]) {
      await count.tick(local(2027, 1, 1, 0, 0, second));
    }
    expect(count.events).toEqual([]);
    expect(count.label).toBe("Feliz año nuevo!!!\uD83E\uDD73");
  });
  test("works for later years without a fixed year", async () => {
    for (const year of [2028, 2031, 2040]) {
      const count = screen();
      await count.tick(local(year - 1, 12, 31, 23, 59, 44));
      await count.tick(local(year, 1, 1, 0, 0, 3));
      expect(plays(count.events)).toEqual(["play:cuartos.mp3", "play:bell.mp3"]);
      expect(count.grape).toBe(11);
    }
  });
  test("keeps test mode available on an arbitrary date and time", async () => {
    const count = screen(true);
    for (const second of [36, 44, 58, 0, 3, 34]) {
      await count.tick(local(2030, 6, 15, 12, 17, second));
    }
    expect(plays(count.events)).toEqual([
      "play:bell2.mp3",
      "play:cuartos.mp3",
      "play:bell.mp3",
      "play:bell.mp3",
      "play:cheer.mp3"
    ]);
    expect(count.label).toBe("Feliz año nuevo!!!\uD83E\uDD73");
    expect(count.events).toContain("confetti:start");
  });
});
