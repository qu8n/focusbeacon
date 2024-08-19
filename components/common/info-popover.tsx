import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Text } from "@/components/ui/text"
import { RiInformation2Line } from "@remixicon/react"
import { useEffect, useState } from "react"

const popoverAutoCloseDelay = 2500

export function InfoPopover({ children }: { children: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setOpen(false)
      }, popoverAutoCloseDelay)
      return () => clearTimeout(timer)
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="rounded-md hover:bg-stone-200 p-1">
        <RiInformation2Line size={16} color="gray" />
      </PopoverTrigger>
      <PopoverContent className="bg-white">
        <Text>{children}</Text>
      </PopoverContent>
    </Popover>
  )
}
