/* eslint-disable @typescript-eslint/no-explicit-any */
// Tremor Raw chartColors [v0.0.0]

export type ColorUtility = "bg" | "stroke" | "fill" | "text"

export const chartColors = {
  "custom-0": {
    bg: `bg-custom-0`,
    stroke: `stroke-custom-0`,
    fill: `fill-custom-0`,
    text: `text-custom-0`,
  },
  "custom-1": {
    bg: `bg-custom-1`,
    stroke: `stroke-custom-1`,
    fill: `fill-custom-1`,
    text: `text-custom-1`,
  },
  "custom-2": {
    bg: `bg-custom-2`,
    stroke: `stroke-custom-2`,
    fill: `fill-custom-2`,
    text: `text-custom-2`,
  },
  "custom-3": {
    bg: `bg-custom-3`,
    stroke: `stroke-custom-3`,
    fill: `fill-custom-3`,
    text: `text-custom-3`,
  },
  "custom-4": {
    bg: `bg-custom-4`,
    stroke: `stroke-custom-4`,
    fill: `fill-custom-4`,
    text: `text-custom-4`,
  },
  "custom-5": {
    bg: `bg-custom-5`,
    stroke: `stroke-custom-5`,
    fill: `fill-custom-5`,
    text: `text-custom-5`,
  },
} as const satisfies {
  [color: string]: {
    [key in ColorUtility]: string
  }
}

export type AvailableChartColorsKeys = keyof typeof chartColors

export const AvailableChartColors: AvailableChartColorsKeys[] = Object.keys(
  chartColors
) as Array<AvailableChartColorsKeys>

export const constructCategoryColors = (
  categories: string[],
  colors: AvailableChartColorsKeys[]
): Map<string, AvailableChartColorsKeys> => {
  const categoryColors = new Map<string, AvailableChartColorsKeys>()
  categories.forEach((category, index) => {
    categoryColors.set(category, colors[index % colors.length])
  })
  return categoryColors
}

export const getColorClassName = (
  color: AvailableChartColorsKeys,
  type: ColorUtility
): string => {
  const fallbackColor = {
    bg: "bg-gray-500",
    stroke: "stroke-gray-500",
    fill: "fill-gray-500",
    text: "text-gray-500",
  }
  return chartColors[color]?.[type] ?? fallbackColor[type]
}

// Tremor Raw getYAxisDomain [v0.0.0]

export const getYAxisDomain = (
  autoMinValue: boolean,
  minValue: number | undefined,
  maxValue: number | undefined
) => {
  const minDomain = autoMinValue ? "auto" : minValue ?? 0
  const maxDomain = maxValue ?? "auto"
  return [minDomain, maxDomain]
}

// Tremor Raw hasOnlyOneValueForKey [v0.1.0]

export function hasOnlyOneValueForKey(
  array: any[],
  keyToCheck: string
): boolean {
  const val: any[] = []

  for (const obj of array) {
    if (Object.prototype.hasOwnProperty.call(obj, keyToCheck)) {
      val.push(obj[keyToCheck])
      if (val.length > 1) {
        return false
      }
    }
  }

  return true
}
