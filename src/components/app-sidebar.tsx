"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  //Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "BioFincas",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Ecoimpulso",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "GreenWatersheds",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Indicators",
      url: "/indicators",
      icon: SquareTerminal,
      items: [
        {
          title: "Metrics",
          url: "/indicators/metrics",
        },
      ],
    },
    // {
    //   title: "Workpackages",
    //   url: "#",
    //   icon: Bot,
    //   items: [
    //     {
    //       title: "Genesis",
    //       url: "#",
    //     },
    //     {
    //       title: "Explorer",
    //       url: "#",
    //     },
    //     {
    //       title: "Quantum",
    //       url: "#",
    //     },
    //   ],
    // },
    {
      title: "Products",
      url: "/product",
      icon: BookOpen,
      items: [
        {
          title: "Gantt Chart",
          url: "/product/gantt",
        },
        {
          title: "List",
          url: "/product/list",
        },
        {
          title: "Metrics",
          url: "/product/metrics",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
