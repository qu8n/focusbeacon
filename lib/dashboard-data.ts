/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * One dashboard query, served from the API when signed in and from the static
 * demo fixture when not.
 *
 * The demo module is imported dynamically so that its fixture is code-split
 * into its own chunk. Signed-in users never download it, and demo views never
 * hit a serverless function.
 *
 * The return is `any` because the API's is: a signed-in user with no sessions
 * gets `{zero_sessions: true}` instead of a payload, and every dashboard page
 * checks for that before reading anything else. `fromFixture` is still typed,
 * so it has to name a function the demo module actually exports.
 */
export async function fetchDashboardData(
  demoMode: boolean,
  endpoint: string,
  fromFixture: (demo: typeof import("@/lib/demo")) => unknown
): Promise<any> {
  if (demoMode) return fromFixture(await import("@/lib/demo"))

  const response = await fetch(endpoint)
  if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`)
  return await response.json()
}
