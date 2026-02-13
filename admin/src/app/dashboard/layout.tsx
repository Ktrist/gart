"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Commandes",
    href: "/dashboard/orders",
    icon: ShoppingBag,
  },
  {
    label: "Produits",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
];

function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 px-3 py-1">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ backgroundColor: "#2d5a3c" }}
      >
        <span
          className="text-sm font-bold tracking-tight"
          style={{ color: "#faf8f5" }}
        >
          G
        </span>
      </div>
      <div className="flex flex-col">
        <span
          className="text-base font-bold tracking-wide"
          style={{ color: "#1a3a2a" }}
        >
          GART
        </span>
        <span className="text-[11px] leading-none text-muted-foreground">
          Admin
        </span>
      </div>
    </div>
  );
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {navigation.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "text-white"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            style={
              isActive
                ? { backgroundColor: "#2d5a3c" }
                : undefined
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton({
  onLogout,
  className,
}: {
  onLogout: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      onClick={onLogout}
      className={cn(
        "w-full justify-start gap-3 px-3 text-sm font-medium text-muted-foreground hover:text-destructive",
        className
      )}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      Se deconnecter
    </Button>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
      } else {
        setIsChecking(false);
      }
    });
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: "#faf8f5" }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-10 w-10 animate-spin rounded-full border-[3px] border-current border-t-transparent"
            style={{ color: "#2d5a3c" }}
          />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#faf8f5" }}>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-border px-4">
          <SidebarBrand />
        </div>

        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-4">
          <NavLinks pathname={pathname} />

          <div className="border-t border-border pt-3">
            <LogoutButton onLogout={handleLogout} />
          </div>
        </div>
      </aside>

      {/* Mobile header + sheet sidebar */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-3 border-b border-border bg-white px-4 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
              <SheetHeader className="flex h-16 flex-row items-center justify-between border-b border-border px-4">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarBrand />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </SheetHeader>

              <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-4">
                <NavLinks
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />

                <div className="border-t border-border pt-3">
                  <LogoutButton onLogout={handleLogout} />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <SidebarBrand />
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
