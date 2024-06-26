import { Avatar } from "@/components/avatar"
import { Link } from "@/components/link"

export function Logo() {
  return (
    <>
      <Avatar src="/images/icon-192.png" />
      <Link href="/">
        Focus<span className="font-semibold">Beacon</span>
      </Link>
    </>
  )
}
