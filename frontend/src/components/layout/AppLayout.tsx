import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Search, Settings, HelpCircle, Github } from "lucide-react";
import analyticsService from "@/services/analyticsService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

export function AppLayout() {
  const { user, logout } = useAuth();
  const { data: stats } = useQuery({
    queryKey: ['site-stats'],
    queryFn: () => analyticsService.getStats(),
    refetchInterval: 30000,
    enabled: IS_DEMO,
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header - Notion style */}
          <header className="sticky top-0 z-40 h-11 border-b border-border bg-background">
            <div className="flex h-full items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden h-7 w-7" />
                <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded text-sm text-muted-foreground hover:bg-accent cursor-pointer transition-colors">
                  <Search className="h-4 w-4" />
                  <span>Rechercher...</span>
                  <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-muted rounded">
                    Ctrl K
                  </kbd>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {IS_DEMO && (
                  <button
                    className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-white hover:bg-slate-700 transition-colors text-xs font-medium"
                    onClick={() => analyticsService.trackRepoClick()}
                    title="Voir le code source sur GitHub"
                  >
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <Github className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">GitHub</span>
                    <span className="tabular-nums">{stats?.repo_clicks ?? 0}</span>
                  </button>
                )}
                <button className="p-1.5 rounded hover:bg-accent text-muted-foreground transition-colors">
                  <HelpCircle className="h-4 w-4" />
                </button>
                <button className="p-1.5 rounded hover:bg-accent text-muted-foreground transition-colors">
                  <Settings className="h-4 w-4" />
                </button>
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1 rounded hover:bg-accent transition-colors">
                      <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                        <span className="text-[10px] font-medium text-primary-foreground">
                          {user ? getInitials(user.firstName, user.lastName) : "?"}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-foreground">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-sm cursor-pointer">
                      Profil
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm cursor-pointer">
                      Parametres
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-sm text-destructive cursor-pointer"
                      onClick={logout}
                    >
                      Deconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="page-transition p-4 md:p-6 max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
