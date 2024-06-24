import * as TabsPrimitives from "@radix-ui/react-tabs"
import React from "react"

import { cx, focusRing } from "@/lib/utils"

const Tabs = (
  props: Omit<
    React.ComponentPropsWithoutRef<typeof TabsPrimitives.Root>,
    "orientation"
  >
) => {
  return <TabsPrimitives.Root {...props} />
}

Tabs.displayName = "Tabs"

type TabsListVariant = "line" | "solid"

const TabsListVariantContext = React.createContext<TabsListVariant>("line")

interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitives.List> {
  variant?: TabsListVariant
}

const variantStyles: Record<TabsListVariant, string> = {
  line: cx(
    // base
    "flex items-center justify-start border-b",
    // border color
    "border-zinc-200 dark:border-zinc-800"
  ),
  solid: cx(
    // base
    "inline-flex items-center justify-center rounded-md p-1",
    // border color
    // "border-zinc-200 dark:border-zinc-800",
    // background color
    "bg-zinc-100 dark:bg-zinc-800"
  ),
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitives.List>,
  TabsListProps
>(({ className, variant = "line", children, ...props }, forwardedRef) => (
  <TabsPrimitives.List
    ref={forwardedRef}
    className={cx(variantStyles[variant], className)}
    {...props}
  >
    <TabsListVariantContext.Provider value={variant}>
      {children}
    </TabsListVariantContext.Provider>
  </TabsPrimitives.List>
))

TabsList.displayName = "TabsList"

function getVariantStyles(tabVariant: TabsListVariant) {
  switch (tabVariant) {
    case "line":
      return cx(
        // base
        "-mb-px items-center justify-center whitespace-nowrap border-b-2 border-transparent px-3 pb-3 text-sm font-medium transition-all",
        // text color
        "text-zinc-500 dark:text-zinc-500",
        // hover
        "hover:text-zinc-700 hover:dark:text-zinc-400",
        // border hover
        "hover:border-zinc-300 hover:dark:border-zinc-400",
        // selected
        "data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900",
        "data-[state=active]:dark:border-zinc-50 data-[state=active]:dark:text-zinc-50",
        // disabled
        "disabled:pointer-events-none",
        "disabled:text-zinc-300 disabled:dark:text-zinc-700"
      )
    case "solid":
      return cx(
        // base
        "inline-flex items-center justify-center whitespace-nowrap rounded px-3 py-1 transition-all text-sm font-medium",
        // text color
        "text-zinc-500 dark:text-zinc-400",
        // hover
        "hover:text-zinc-700 hover:dark:text-zinc-200",
        // selected
        " data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow",
        "data-[state=active]:dark:bg-zinc-900 data-[state=active]:dark:text-zinc-50",
        // disabled
        "disabled:pointer-events-none disabled:text-zinc-400 disabled:dark:text-zinc-600 disabled:opacity-50"
      )
  }
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitives.Trigger>
>(({ className, children, ...props }, forwardedRef) => {
  const variant = React.useContext(TabsListVariantContext)
  return (
    <TabsPrimitives.Trigger
      ref={forwardedRef}
      className={cx(getVariantStyles(variant), focusRing, className)}
      {...props}
    >
      {children}
    </TabsPrimitives.Trigger>
  )
})

TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitives.Content>
>(({ className, ...props }, forwardedRef) => (
  <TabsPrimitives.Content
    ref={forwardedRef}
    className={cx("outline-none", focusRing, className)}
    {...props}
  />
))

TabsContent.displayName = "TabsContent"

export { Tabs, TabsContent, TabsList, TabsTrigger }
