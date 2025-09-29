"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  AudioWaveform,
  Command,
  Package,
  Home,
  BarChart3,
  Leaf,
  Target,
  Calendar,
  ListChecks,
  Settings
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { CheckinNotifications } from "@/components/checkin-notifications"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

// Data optimizada para BioFincas con URLs dinámicas
const getData = (searchParams: URLSearchParams) => {
  const productId = searchParams.get('productId');
  const productParam = productId ? `?productId=${productId}` : '';
  
  return {
    user: {
      name: "Admin BioFincas",
      email: "admin@biofincas.org",
      avatar: "https://github.com/shadcn.png",
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
        title: "Products",
        url: "/product",
        icon: Package,
        isActive: true, // Hace que sea clickeable
        items: [
          {
            title: "Task Table",
            url: `/product/list${productParam}`, // 🎯 Preservar productId
            icon: ListChecks,
          },
          {
            title: "Gantt Chart",
            url: `/product/gantt${productParam}`, // 🎯 Preservar productId
            icon: Calendar,
          },
          {
            title: "Metrics",
            url: `/product/metrics${productParam}`, // 🎯 Preservar productId
            icon: BarChart3,
          },
        ],
      },
      {
        title: "Indicadores",
        url: "/indicators",
        icon: Target,
      },
    // {
    //   title: "Configuración",
    //   url: "/settings",
    //   icon: Settings,
    //   items: [
    //     {
    //       title: "Organizaciones",
    //       url: "/settings/organizations",
    //       icon: BookOpen,
    //     },
    //     {
    //       title: "Estados",
    //       url: "/settings/statuses",
    //     },
    //     {
    //       title: "Fases",
    //       url: "/settings/phases",
    //     },
    //   ],
    // },
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
    };
  // Cerrar la función getData aquí
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const searchParams = useSearchParams();
  const data = getData(searchParams);

  
  
  return (
    <Sidebar collapsible="icon" className="border-r border-gray-300 dark:border-green-800 bg-gradient-to-b from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50" {...props}>
      <SidebarHeader className=" dark:border-green-800 bg-white/50 dark:bg-green-900/20">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="px-2 py-4 flex flex-col">
        <NavMain items={data.navMain} />
        <div className="mt-auto">
          <div className="flex justify-center">
            <Link 
              href="/settings" 
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
            >
              <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </Link>
          </div>
          <div className="flex justify-center p-2">
            <CheckinNotifications />
          </div>
          <NavUser />
        </div>
      </SidebarContent>
      <SidebarFooter className=" dark:border-green-800 bg-white/50 dark:bg-green-900/20">
      </SidebarFooter>
    </Sidebar>
  )
}
