import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Settings, HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppLayout() {
  const { user, logout } = useAuth();

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
