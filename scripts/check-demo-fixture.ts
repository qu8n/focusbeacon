/**
 * Guards the two ways the static demo can drift from the real API.
 *
 * 1. Regenerate the fixture and fail if it differs from the committed one. The
 *    generator is deterministic, so a diff means someone changed the fake data
 *    or the pipeline behind it and did not commit the result.
 * 2. Rebuild every payload in TypeScript at eight anchor dates and compare
 *    against what the Python endpoints returned for the same data. Add a field
 *    to an endpoint and this is what tells you the demo no longer matches.
 *
 * Run with `npm run check:demo`. The pre-push hook runs it for you.
 */

import { execFileSync } from "node:child_process"
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  getDemoHistory,
  getDemoLifetime,
  getDemoMonth,
  getDemoStreak,
  getDemoWeek,
  getDemoYear,
  HISTORY_PAGE_SIZE,
} from "../lib/demo"

const REPO_ROOT = join(__dirname, "..")
const COMMITTED_FIXTURE = join(REPO_ROOT, "lib", "demo", "fixture.json")
const MAX_REPORTED = 15

type Json = unknown

function rebuild(name: string, anchor: Date): Json {
  const [view, weekStart] = name.split(".")

  switch (view) {
    case "streak":
      return getDemoStreak(weekStart as "monday" | "sunday", anchor)
    case "week":
      return getDemoWeek(weekStart as "monday" | "sunday", anchor)
    case "month":
      return getDemoMonth(anchor)
    case "year":
      return getDemoYear(anchor)
    case "lifetime":
      return getDemoLifetime(anchor)
    case "history":
      return getDemoHistory(Number(weekStart), HISTORY_PAGE_SIZE, anchor)
    default:
      throw new Error(`no rebuild for payload "${name}"`)
  }
}

function collectDiff(
  actual: Json,
  expected: Json,
  path: string,
  found: string[]
) {
  if (found.length >= MAX_REPORTED) return

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      found.push(`${path}: expected a list, got ${JSON.stringify(actual)}`)
      return
    }
    if (actual.length !== expected.length) {
      found.push(
        `${path}: ${actual.length} entries, expected ${expected.length}`
      )
      return
    }
    expected.forEach((value, index) =>
      collectDiff(actual[index], value, `${path}[${index}]`, found)
    )
    return
  }

  if (expected !== null && typeof expected === "object") {
    if (actual === null || typeof actual !== "object") {
      found.push(`${path}: expected an object, got ${JSON.stringify(actual)}`)
      return
    }
    const keys = Object.keys(expected as object)
      .concat(Object.keys(actual as object))
      .filter((key, index, all) => all.indexOf(key) === index)
      .sort()
    keys.forEach((key) =>
      collectDiff(
        (actual as Record<string, Json>)[key],
        (expected as Record<string, Json>)[key],
        `${path}.${key}`,
        found
      )
    )
    return
  }

  if (actual !== expected) {
    found.push(
      `${path}: ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`
    )
  }
}

function main() {
  const workdir = mkdtempSync(join(tmpdir(), "demo-fixture-"))

  try {
    execFileSync(
      "uv",
      [
        "run",
        "scripts/generate_demo_fixture.py",
        "--fixture",
        join(workdir, "fixture.json"),
        "--goldens",
        join(workdir, "goldens"),
      ],
      { cwd: REPO_ROOT, stdio: ["ignore", "ignore", "inherit"] }
    )

    const regenerated = readFileSync(join(workdir, "fixture.json"), "utf8")
    const committed = readFileSync(COMMITTED_FIXTURE, "utf8")
    if (regenerated !== committed) {
      console.error(
        "lib/demo/fixture.json is out of date. Regenerate it with:\n" +
          "  uv run scripts/generate_demo_fixture.py"
      )
      process.exit(1)
    }

    const goldenDir = join(workdir, "goldens")
    const failures: string[] = []
    let compared = 0

    readdirSync(goldenDir)
      .sort()
      .forEach((file) => {
        const golden = JSON.parse(readFileSync(join(goldenDir, file), "utf8"))
        const [year, month, day] = golden.anchor.split("-").map(Number)
        const anchor = new Date(year, month - 1, day, 12)

        Object.keys(golden.payloads)
          .sort()
          .forEach((name) => {
            compared += 1
            const found: string[] = []
            // Round-trip so a TypeScript number meets a JSON number
            const actual = JSON.parse(JSON.stringify(rebuild(name, anchor)))
            collectDiff(actual, golden.payloads[name], name, found)
            found.forEach((line) =>
              failures.push(`${golden.anchor} (${golden.weekday})  ${line}`)
            )
          })
      })

    if (failures.length) {
      console.error(
        `The TypeScript rebuild does not match the API at ${failures.length} ` +
          "place(s):\n"
      )
      failures.slice(0, MAX_REPORTED).forEach((line) => console.error(`  ${line}`))
      if (failures.length > MAX_REPORTED) {
        console.error(`  ...and ${failures.length - MAX_REPORTED} more`)
      }
      process.exit(1)
    }

    console.log(`demo fixture ok: ${compared} payloads match the API`)
  } finally {
    rmSync(workdir, { recursive: true, force: true })
  }
}

main()
