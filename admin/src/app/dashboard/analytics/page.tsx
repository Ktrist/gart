"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { BarChart3, TrendingUp, Award, ShoppingBag } from "lucide-react";

interface RevenueByDay {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface StatusBreakdown {
  name: string;
  value: number;
}

const PIE_COLORS = ["#2d5a3c", "#768d5d", "#4ade80", "#fbbf24", "#94a3b8", "#ef4444"];

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  paid: "Payée",
  preparing: "En préparation",
  ready: "Prête",
  completed: "Récupérée",
  cancelled: "Annulée",
};

export default function AnalyticsPage() {
  const [revenueByDay, setRevenueByDay] = useState<RevenueByDay[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    const supabase = createClient();

    // Fetch all orders with items
    const { data: orders } = await supabase
      .from("orders")
      .select("id, total, status, created_at, order_items(product_name, quantity, unit_price, total_price)")
      .order("created_at", { ascending: true });

    if (!orders) {
      setLoading(false);
      return;
    }

    // Revenue by day (last 30 days)
    const dayMap = new Map<string, { revenue: number; orders: number }>();
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dayMap.set(key, { revenue: 0, orders: 0 });
    }

    let totalRev = 0;
    const statusCount: Record<string, number> = {};
    const productMap = new Map<string, { quantity: number; revenue: number }>();

    for (const order of orders) {
      // Status breakdown
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;

      if (order.status === "cancelled") continue;

      totalRev += order.total;

      // Revenue by day
      const day = order.created_at.split("T")[0];
      if (dayMap.has(day)) {
        const entry = dayMap.get(day)!;
        entry.revenue += order.total;
        entry.orders += 1;
      }

      // Top products
      for (const item of (order as any).order_items || []) {
        const existing = productMap.get(item.product_name) || { quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.total_price;
        productMap.set(item.product_name, existing);
      }
    }

    setRevenueByDay(
      Array.from(dayMap.entries()).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
        revenue: Math.round(data.revenue * 100) / 100,
        orders: data.orders,
      }))
    );

    setTopProducts(
      Array.from(productMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
    );

    setStatusBreakdown(
      Object.entries(statusCount).map(([status, count]) => ({
        name: STATUS_LABELS[status] || status,
        value: count,
      }))
    );

    setTotalRevenue(totalRev);
    setTotalOrders(orders.length);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5a3c]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a2a]">Analytics</h1>
        <p className="text-muted-foreground">Statistiques de vente et performances</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">CA Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#2d5a3c]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1a3a2a]">{totalRevenue.toFixed(2)} &euro;</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Commandes</CardTitle>
            <ShoppingBag className="h-4 w-4 text-[#2d5a3c]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1a3a2a]">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Produit star</CardTitle>
            <Award className="h-4 w-4 text-[#2d5a3c]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1a3a2a]">{topProducts[0]?.name || "—"}</div>
            {topProducts[0] && (
              <p className="text-sm text-muted-foreground">{topProducts[0].revenue.toFixed(2)} &euro; de ventes</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#1a3a2a]">
            <BarChart3 className="h-5 w-5" />
            Chiffre d&apos;affaires (30 derniers jours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}\u00A0\u20AC`} />
              <Tooltip
                formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(2)} \u20AC`, "CA"]}
                labelStyle={{ fontWeight: 600 }}
              />
              <Bar dataKey="revenue" fill="#2d5a3c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1a3a2a]">Top produits</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aucune donn&eacute;e</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-6">{index + 1}</span>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.quantity} vendus</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm text-[#2d5a3c]">{product.revenue.toFixed(2)} &euro;</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1a3a2a]">R&eacute;partition des commandes</CardTitle>
          </CardHeader>
          <CardContent>
            {statusBreakdown.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aucune donn&eacute;e</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {statusBreakdown.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
