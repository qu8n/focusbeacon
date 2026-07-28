import { describe, expect, it } from "vitest"

import {
  AvailableChartColors,
  chartColors,
  constructCategoryColors,
  getColorClassName,
  getYAxisDomain,
  hasOnlyOneValueForKey,
} from "@/lib/chart-utils"

describe("constructCategoryColors", () => {
  it("assigns colors in order", () => {
    const map = constructCategoryColors(["25m", "50m"], AvailableChartColors)
    expect(map.get("25m")).toBe(AvailableChartColors[0])
    expect(map.get("50m")).toBe(AvailableChartColors[1])
  })

  it("wraps around when there are more categories than colors", () => {
    const categories = Array.from(
      { length: AvailableChartColors.length + 2 },
      (_, index) => `series-${index}`
    )
    const map = constructCategoryColors(categories, AvailableChartColors)
    expect(map.get("series-0")).toBe(
      map.get(`series-${AvailableChartColors.length}`)
    )
  })

  it("handles no categories", () => {
    expect(constructCategoryColors([], AvailableChartColors).size).toBe(0)
  })

  it("keeps the last color when a category repeats", () => {
    const map = constructCategoryColors(["a", "a"], AvailableChartColors)
    expect(map.size).toBe(1)
    expect(map.get("a")).toBe(AvailableChartColors[1])
  })
})

describe("getColorClassName", () => {
  it("returns the class for a known color and utility", () => {
    expect(getColorClassName("custom-0", "bg")).toBe("bg-custom-0")
    expect(getColorClassName("custom-3", "stroke")).toBe("stroke-custom-3")
  })

  it("falls back to gray for an unknown color", () => {
    // @ts-expect-error deliberately outside the union, which is what the
    // runtime fallback exists for
    expect(getColorClassName("nope", "fill")).toBe("fill-gray-500")
  })

  it("covers every declared color and utility", () => {
    for (const color of AvailableChartColors) {
      for (const utility of ["bg", "stroke", "fill", "text"] as const) {
        expect(getColorClassName(color, utility)).toBe(
          `${utility}-${color}`
        )
      }
    }
  })

  it("exposes a color per duration bucket plus room to spare", () => {
    // The charts stack 25m, 50m and 75m
    expect(Object.keys(chartColors).length).toBeGreaterThanOrEqual(3)
  })
})

describe("getYAxisDomain", () => {
  it("starts at zero by default", () => {
    expect(getYAxisDomain(false, undefined, undefined)).toEqual([0, "auto"])
  })

  it("lets the chart pick the floor when autoMinValue is set", () => {
    expect(getYAxisDomain(true, undefined, undefined)).toEqual([
      "auto",
      "auto",
    ])
  })

  it("honours explicit bounds", () => {
    expect(getYAxisDomain(false, 5, 100)).toEqual([5, 100])
  })

  it("treats an explicit zero minimum as a value, not a missing one", () => {
    expect(getYAxisDomain(false, 0, 10)).toEqual([0, 10])
  })

  it("prefers autoMinValue over an explicit minimum", () => {
    expect(getYAxisDomain(true, 5, 100)).toEqual(["auto", 100])
  })
})

describe("hasOnlyOneValueForKey", () => {
  it("is true for a single entry", () => {
    expect(hasOnlyOneValueForKey([{ a: 1 }], "a")).toBe(true)
  })

  it("is false once a second entry carries the key", () => {
    expect(hasOnlyOneValueForKey([{ a: 1 }, { a: 2 }], "a")).toBe(false)
  })

  it("counts entries, not distinct values", () => {
    // Two rows with the same value still means the key appears twice
    expect(hasOnlyOneValueForKey([{ a: 1 }, { a: 1 }], "a")).toBe(false)
  })

  it("ignores entries without the key", () => {
    expect(hasOnlyOneValueForKey([{ a: 1 }, { b: 2 }], "a")).toBe(true)
  })

  it("is true for an empty list", () => {
    expect(hasOnlyOneValueForKey([], "a")).toBe(true)
  })

  it("does not match inherited properties", () => {
    // The check uses hasOwnProperty, so a key from the prototype chain is not
    // a value this row carries
    const row = Object.create({ a: 99 })
    row.b = 1
    expect(hasOnlyOneValueForKey([row, { a: 1 }], "a")).toBe(true)
  })
})
