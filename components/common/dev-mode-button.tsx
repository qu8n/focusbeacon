import { Button } from "@/components/ui/button"

export function DevModeButton({
  devMode,
  setDevMode,
}: {
  devMode: boolean
  setDevMode: (devMode: boolean) => void
}) {
  function toggleDevMode() {
    setDevMode(!devMode)
  }

  return (
    <div className="fixed bottom-0 right-0 mb-6 mr-10">
      <Button onClick={toggleDevMode}>Toggle dev mode</Button>
    </div>
  )
}
