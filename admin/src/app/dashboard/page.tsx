"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Euro, Users, TrendingUp, Clock, CheckCircle, Package, XCircle } from "lucide-react";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  avgOrderValue: number;
  pendingOrders: number;
  readyOrders: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  user_profiles: { full_name: string; email: string } | null;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "En attente", variant: "outline" },
  paid: { label: "Payée", variant: "default" },
  preparing: { label: "En préparation", variant: "secondary" },
  ready: { label: "Prête", variant: "default" },
  completed: { label: "Récupérée", variant: "secondary" },
  cancelled: { label: "Annulée", variant: "destructive" },
};

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0, totalRevenue: 0, totalCustomers: 0,
    avgOrderValue: 0, pendingOrders: 0, readyOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const supabase = createClient();

    // Fetch orders with user profiles
    const { data: orders } = await supabase
      .from("orders")
      .select("id, order_number, total, status, created_at, user_id, user_profiles(full_name, email)")
      .order("created_at", { ascending: false });

    if (orders) {
      const uniqueCustomers = new Set(orders.map((o) => o.user_id));
      const totalRevenue = orders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + o.total, 0);

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalCustomers: uniqueCustomers.size,
        avgOrderValue: orders.length > 0 ? totalRevenue / orders.filter((o) => o.status !== "cancelled").length : 0,
        pendingOrders: orders.filter((o) => o.status === "pending" || o.status === "paid").length,
        readyOrders: orders.filter((o) => o.status === "ready").length,
      });

      setRecentOrders(orders.slice(0, 8) as unknown as RecentOrder[]);
    }

    setLoading(false);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5a3c]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a2a]">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble de votre activit&eacute;</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commandes totales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-[#2d5a3c]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1a3a2a]">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chiffre d&apos;affaires</CardTitle>
            <Euro className="h-4 w-4 text-[#2d5a3c]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1a3a2a]">{stats.totalRevenue.toFixed(2)} &euro;</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clients</CardTitle>
            <Users className="h-4 w-4 text-[#2d5a3c]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1a3a2a]">{stats.totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Panier moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#2d5a3c]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1a3a2a]">{stats.avgOrderValue.toFixed(2)} &euro;</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 pt-6">
            <Clock className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-900">{stats.pendingOrders} commande{stats.pendingOrders > 1 ? "s" : ""} en attente</p>
              <p className="text-sm text-amber-700">N&eacute;cessitent votre attention</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="flex items-center gap-3 pt-6">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-900">{stats.readyOrders} commande{stats.readyOrders > 1 ? "s" : ""} pr&ecirc;te{stats.readyOrders > 1 ? "s" : ""}</p>
              <p className="text-sm text-emerald-700">En attente de retrait client</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[#1a3a2a]">Commandes r&eacute;centes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucune commande pour le moment</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                return (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.user_profiles?.full_name || order.user_profiles?.email || "Client"} &middot; {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusConf.variant}>{statusConf.label}</Badge>
                      <span className="font-semibold text-sm min-w-[70px] text-right">{order.total.toFixed(2)} &euro;</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
