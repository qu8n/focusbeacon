// This file houses reusable dashboard cards

import { RiTimeLine, RiUser3Line, RiVideoOnLine } from "@remixicon/react"
import { Card } from "../ui/card"
import { Stat } from "../ui/stat"

export function TotalSessions({ data }: { data: any }) {
  const hasDelta = data.curr_period.sessions_delta
  return (
    <Card
      icon={<RiVideoOnLine size={16} className="opacity-40" />}
      title="Total sessions"
      className="sm:col-span-2"
    >
      <Stat
        value={data.curr_period.sessions_total}
        changeVal={hasDelta ? hasDelta : undefined}
        changeText={hasDelta ? `vs. previous ${data.period_type}` : undefined}
      />
    </Card>
  )
}

export function TotalHours({ data }: { data: any }) {
  const hasDelta = data.curr_period.hours_delta
  return (
    <Card
      icon={<RiTimeLine size={16} className="opacity-40" />}
      title="Total hours"
      className="sm:col-span-2"
    >
      <Stat
        value={data.curr_period.hours_total}
        changeVal={hasDelta ? hasDelta : undefined}
        changeText={hasDelta ? `vs. previous ${data.period_type}` : undefined}
      />
    </Card>
  )
}

export function TotalPartners({ data }: { data: any }) {
  return (
    <Card
      icon={<RiUser3Line size={16} className="opacity-40" />}
      title="Total partners"
      className="sm:col-span-2"
    >
      <Stat
        value={data.curr_period.partners_total}
        changeText={`${data.curr_period.partners_repeat.toLocaleString()} repeat`}
      />
    </Card>
  )
}
