import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
const source = readFileSync(new URL("../screens/Clock.tsx", import.meta.url), "utf8");
const circleExpression = source.match(/styles\.obj,\s*(.*?)\s*&&\s*\{/s)?.[1];
const numeralExpression = source.match(/styles\.objText,\s*(.*?)\s*&&\s*\{/s)?.[1];
const normalizedHourExpression = source.match(/const hour12 = (.*);/)?.[1];
function highlightedHours(expression, time) {
  const matches = new Function("time", "v", "hour12", `return ${expression};`);
  const hour12 = normalizedHourExpression ? new Function("time", `return ${normalizedHourExpression};`)(time) : undefined;
  return Array.from({ length: 12 }, (_, index) => index + 1).filter((hour) => matches(time, hour, hour12));
}
test("the analog circle and numeral each highlight the local 12-hour position", () => {
  expect(circleExpression).toBeDefined();
  expect(numeralExpression).toBeDefined();
  const cases = [[0, 12], [1, 1], [11, 11], [12, 12], [13, 1], [23, 11]];
  for (const [hour, expected] of cases) {
    const time = { getHours: () => hour };
    const circleHours = highlightedHours(circleExpression, time);
    const numeralHours = highlightedHours(numeralExpression, time);
    expect(circleHours, `circle highlight at local hour ${hour}`).toEqual([expected]);
    expect(numeralHours, `numeral highlight at local hour ${hour}`).toEqual([expected]);
    expect(circleHours).toEqual(numeralHours);
  }
});
