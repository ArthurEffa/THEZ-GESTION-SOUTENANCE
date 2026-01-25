import { LogOut, ChevronsLeft, ChevronsRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getNavigationForRole } from "@/config/navigation";
import { useGetDossiersCount } from "@/hooks/dossier-hooks"; // Import du hook
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge"; // Import du Badge
import logoImage from "@/assets/logo.jpg";

const roleLabels: Record<string, string> = {
  admin: "Admin",
  etudiant: "Etudiant",
  jury: "Jury",
  encadreur: "Encadreur",
};

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const location = useLocation();
  const collapsed = state === "collapsed";

  // Récupérer le nombre de dossiers en attente si l'utilisateur est admin
  const { data: dossiersEnAttenteCount } = useGetDossiersCount("DEPOSE", {
      enabled: user?.role === 'ADMIN',
  });

  const navigationItems = user ? getNavigationForRole(user.role) : [];

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar-background" collapsible="icon">
      <SidebarHeader className="p-3">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-2", collapsed && "justify-center w-full")}>
            <img src={logoImage} alt="Logo" className="h-8 w-8 object-contain"/>
            {!collapsed && <span className="text-sm font-medium text-sidebar-foreground">THEZ</span>}
          </div>
          {!collapsed && <button className="p-1 rounded hover:bg-sidebar-accent text-sidebar-muted transition-colors" onClick={toggleSidebar}><ChevronsLeft className="h-4 w-4" /></button>}
          {collapsed && <button className="absolute -right-3 top-5 p-1 rounded-full bg-background border border-sidebar-border shadow-sm hover:bg-sidebar-accent text-sidebar-muted transition-colors" onClick={toggleSidebar}><ChevronsRight className="h-3 w-3" /></button>}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup><SidebarGroupContent><SidebarMenu>
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(item.url));
            const showBadge = (item.url === '/candidats' || item.url === '/dossiers') && dossiersEnAttenteCount > 0;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined} className={cn("h-8 transition-colors duration-100", isActive ? "bg-sidebar-accent text-sidebar-foreground font-medium" : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
                  <NavLink to={item.url} className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm">{item.title}</span>
                    </div>
                    {!collapsed && showBadge && <Badge className="h-5">{dossiersEnAttenteCount}</Badge>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu></SidebarGroupContent></SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="mb-2 px-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-sidebar-muted">{roleLabels[user.role]}</p>
          </div>
        )}
        <button className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm", "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors", collapsed && "justify-center")} onClick={logout}>
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Deconnexion</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
