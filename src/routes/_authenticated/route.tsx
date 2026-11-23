import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import logoAsset from "@/assets/logo-evolutie-crm.webp.asset.json";
import { LayoutDashboard, KanbanSquare, LogOut, ListChecks, Users, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsAdmin } from "@/hooks/use-is-admin";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useIsAdmin();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2 px-5 py-6">
          <img src={logoAsset.url} alt="Evolutie CRM" className="h-9 w-auto" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          <SideLink to="/crm" icon={<KanbanSquare className="h-4 w-4" />} label="Funil de vendas" />
          <SideLink to="/tarefas" icon={<ListChecks className="h-4 w-4" />} label="Tarefas" />
          <SideLink to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
          {isAdmin && <SideLink to="/usuarios" icon={<Users className="h-4 w-4" />} label="Usuários" />}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <p className="truncate px-2 pb-2 text-xs text-sidebar-foreground/60">{user?.email}</p>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-3 md:hidden">
          <span className="rounded-md bg-sidebar px-2 py-1"><img src={logoAsset.url} alt="Evolutie CRM" className="h-6 w-auto" /></span>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-64 flex-col bg-sidebar p-0 text-sidebar-foreground">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="px-5 py-6">
                <img src={logoAsset.url} alt="Evolutie CRM" className="h-9 w-auto" />
              </div>
              <nav className="flex flex-1 flex-col gap-1 px-3" onClick={() => setMenuOpen(false)}>
                <SideLink to="/crm" icon={<KanbanSquare className="h-4 w-4" />} label="Funil de vendas" />
                <SideLink to="/tarefas" icon={<ListChecks className="h-4 w-4" />} label="Tarefas" />
                <SideLink to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
                {isAdmin && <SideLink to="/usuarios" icon={<Users className="h-4 w-4" />} label="Usuários" />}
              </nav>
              <div className="border-t border-sidebar-border p-3">
                <p className="truncate px-2 pb-2 text-xs text-sidebar-foreground/60">{user?.email}</p>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-sidebar-accent"
                >
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </header>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SideLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      {icon}
      {label}
    </Link>
  );
}
