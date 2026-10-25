import { describe, expect, it } from "vitest";

import { centsToDecimal, decimalToCents, tipCentsFor, toTwoDecimals } from "../src/money.js";

describe("centsToDecimal", () => {
  it.each([
    [0, "0.00"],
    [1, "0.01"],
    [10, "0.10"],
    [99, "0.99"],
    [100, "1.00"],
    [60000, "600.00"],
    [123456, "1234.56"],
    [34218000, "342180.00"],
    [-510, "-5.10"],
    [-1, "-0.01"],
  ])("%i -> %s", (cents, expected) => {
    expect(centsToDecimal(cents)).toBe(expected);
  });

  it("rounds fractional cents instead of emitting floats", () => {
    expect(centsToDecimal(1234.4)).toBe("12.34");
    expect(centsToDecimal(1234.6)).toBe("12.35");
  });
});

describe("toTwoDecimals", () => {
  it.each([
    ["74.4", "74.40"],
    ["925.6", "925.60"],
    ["5000", "5000.00"],
    ["0", "0.00"],
    ["99.36", "99.36"],
    ["1000.000000", "1000.00"],
    ["n/a", "n/a"],
  ])("%s -> %s", (value, expected) => {
    expect(toTwoDecimals(value)).toBe(expected);
  });
});

describe("decimalToCents", () => {
  it.each([
    ["0", 0],
    ["0.00", 0],
    ["1", 100],
    ["1.5", 150],
    ["12.30", 1230],
    ["600.00", 60000],
    [" 42.10 ", 4210],
    ["-5.10", -510],
    ["1000.000000", 100000],
  ])("%s -> %i", (value, expected) => {
    expect(decimalToCents(value)).toBe(expected);
  });

  it.each(["", "abc", "1,000.00", "$5", "1.2.3", "1e3", ".5", "5.", "1.1234567"])("rejects %j", (value) => {
    expect(() => decimalToCents(value)).toThrow(/Invalid decimal amount/);
  });

  it("round-trips every cent value up to $1,000", () => {
    for (let cents = 0; cents <= 100_000; cents += 7) {
      expect(decimalToCents(centsToDecimal(cents))).toBe(cents);
    }
  });
});

describe("tipCentsFor", () => {
  it.each([
    [10000, 20, 2000],
    [10600, 20, 2120],
    [3800, 15, 570],
    [999, 18, 180],
    [0, 20, 0],
    [12345, 0, 0],
  ])("%i at %i%% -> %i", (total, pct, expected) => {
    expect(tipCentsFor(total, pct)).toBe(expected);
  });

  it("always returns whole cents", () => {
    for (const pct of [15, 18, 20, 22]) {
      for (const total of [101, 333, 4567, 89999]) {
        expect(Number.isInteger(tipCentsFor(total, pct))).toBe(true);
      }
    }
  });
});
