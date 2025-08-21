"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Command,
  SquareTerminal,
  Home,
  BarChart3,
  Settings,
  Leaf,
  Target,
  Calendar,
  ListChecks,
  TrendingUp
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Data optimizada para BioFincas
const data = {
  user: {
    name: "Admin BioFincas",
    email: "admin@biofincas.org",
    avatar: "/avatars/biofincas.jpg",
  },
  teams: [
    {
      name: "BioFincas",
      logo: Leaf,
      plan: "Sostenibilidad",
    },
    {
      name: "EcoImpulso",
      logo: AudioWaveform,
      plan: "Biodiversidad",
    },
    {
      name: "AguaVerde",
      logo: Command,
      plan: "Cuencas",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Productos",
      url: "/product",
      icon: SquareTerminal,
      items: [
        {
          title: "Lista de Productos",
          url: "/product/list",
          icon: ListChecks,
        },
        {
          title: "Cronograma Gantt",
          url: "/product/gantt",
          icon: Calendar,
        },
        {
          title: "Métricas",
          url: "/product/metrics",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Indicadores",
      url: "/indicators",
      icon: Target,
      items: [
        {
          title: "Métricas de Rendimiento",
          url: "/indicators/metrics",
          icon: TrendingUp,
        },
      ],
    },
    {
      title: "Configuración",
      url: "/settings",
      icon: Settings,
      items: [
        {
          title: "Organizaciones",
          url: "/settings/organizations",
          icon: BookOpen,
        },
        {
          title: "Estados",
          url: "/settings/statuses",
        },
        {
          title: "Fases",
          url: "/settings/phases",
        },
      ],
    },
  ],
  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: PieChart,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: Map,
  //   },
  // ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="border-r border-green-200 dark:border-green-800 bg-gradient-to-b from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50" {...props}>
      <SidebarHeader className="border-b border-green-200 dark:border-green-800 bg-white/50 dark:bg-green-900/20">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="border-t border-green-200 dark:border-green-800 bg-white/50 dark:bg-green-900/20 p-4">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
