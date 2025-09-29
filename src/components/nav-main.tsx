"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      icon?: LucideIcon
    }[]
  }[]
}) {
  const pathname = usePathname()
  const { setOpen, state } = useSidebar()
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  
  // Inicializar elementos abiertos basado en la ruta activa
  useEffect(() => {
    const activeItems = new Set<string>()
    items.forEach(item => {
      // Solo expandir automáticamente si estamos en una subruta específica
      if (item.items && item.items.length > 0) {
        // Verificar si alguna subruta específica está activa
        const hasActiveSubItem = item.items.some(subItem => pathname === subItem.url)
        if (hasActiveSubItem) {
          activeItems.add(item.title)
        }
      }
      // NUNCA expandir automáticamente para rutas principales como /product
    })
    setOpenItems(activeItems)
  }, [pathname, items])
  
  const handleLinkClick = () => {
    setOpen(false)
  }

  const handleCollapsibleClick = (itemTitle: string, hasSubItems: boolean) => {
    // Si la sidebar está collapsed y el item tiene sub-items, abrimos la sidebar
    if (state === "collapsed" && hasSubItems) {
      setOpen(true)
      // También abrimos el elemento específico
      setOpenItems(prev => new Set([...prev, itemTitle]))
    }
  }
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isItemActive = pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url + '/'))
          const hasSubItems = item.items && item.items.length > 0
          const isItemOpen = openItems.has(item.title) || isItemActive
          
          return (
            <Collapsible
              key={item.title}
              asChild={hasSubItems}
              open={isItemOpen}
              onOpenChange={(open) => {
                if (open) {
                  setOpenItems(prev => new Set([...prev, item.title]))
                } else {
                  setOpenItems(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(item.title)
                    return newSet
                  })
                }
              }}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {hasSubItems ? (
                  <>
                    {item.title === "Products" ? (
                      // Para Products: botón único que funciona como link y expandir
                      <SidebarMenuButton 
                        asChild
                        tooltip={item.title}
                        isActive={isItemActive}
                        className="w-full"
                      >
                        <Link 
                          href={item.url} 
                          onClick={(e) => {
                            e.preventDefault();
                            
                            // Si la sidebar está colapsada, solo expandir
                            if (state === "collapsed") {
                              setOpen(true);
                              // También expandir el item de Products
                              setOpenItems(prev => new Set([...prev, item.title]));
                              return;
                            }
                            
                            // Si la sidebar está expandida, navegar y alternar expansión
                            
                            // Alternar el estado de expansión de las subrutas
                            const isCurrentlyOpen = openItems.has(item.title);
                            if (isCurrentlyOpen) {
                              setOpenItems(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(item.title);
                                return newSet;
                              });
                            } else {
                              setOpenItems(prev => new Set([...prev, item.title]));
                            }
                            
                            // Contraer la navbar y navegar
                            setOpen(false);
                            
                            // Navegar a la URL después de contraer
                            setTimeout(() => {
                              window.location.href = item.url;
                            }, 200);
                          }}
                          className="flex items-center gap-2 w-full"
                        >
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    ) : (
                      // Para otros items: mantener el diseño original con dos botones
                      <div className="flex">
                        <SidebarMenuButton 
                          asChild
                          tooltip={item.title}
                          isActive={isItemActive}
                          className="flex-1"
                        >
                          <Link href={item.url} onClick={handleLinkClick}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        
                        {/* Botón para expandir/colapsar */}
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton 
                            tooltip={`Expandir ${item.title}`}
                            onClick={() => handleCollapsibleClick(item.title, hasSubItems)}
                            className="w-8 px-2"
                          >
                            <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                      </div>
                    )}
                    
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                              <Link href={subItem.url} onClick={handleLinkClick}>
                                {subItem.icon && <subItem.icon />}
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                    isActive={isItemActive}
                  >
                    <Link href={item.url} onClick={handleLinkClick}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
