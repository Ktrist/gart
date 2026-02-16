"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Package, ChevronDown, ChevronUp, Truck, MapPin, Bell } from "lucide-react";
import { toast } from "sonner";
import type { Order } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "paid", label: "Payée" },
  { value: "preparing", label: "En préparation" },
  { value: "ready", label: "Prête" },
  { value: "completed", label: "Récupérée" },
  { value: "cancelled", label: "Annulée" },
];

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "En attente", variant: "outline" },
  paid: { label: "Payée", variant: "default" },
  preparing: { label: "En préparation", variant: "secondary" },
  ready: { label: "Prête", variant: "default" },
  completed: { label: "Récupérée", variant: "secondary" },
  cancelled: { label: "Annulée", variant: "destructive" },
};

const STATUS_FLOW = ["pending", "paid", "preparing", "ready", "completed"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id, order_number, user_id, total, status, delivery_type,
        shipping_cost, delivery_address, created_at, updated_at,
        pickup_locations(name),
        user_profiles!orders_user_id_fkey(full_name, email, phone),
        order_items(id, product_name, quantity, unit_price, total_price, product_unit)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data as unknown as Order[]);
    }
    setLoading(false);
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdating(orderId);
    const supabase = createClient();

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o))
      );

      // Send push notification when order is marked as ready
      if (newStatus === "ready") {
        const order = orders.find((o) => o.id === orderId);
        if (order) {
          try {
            await fetch(
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-notification`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                },
                body: JSON.stringify({
                  type: "order_ready",
                  data: {
                    userId: order.user_id,
                    orderId: order.id,
                    orderNumber: order.order_number,
                    pickupLocation: order.pickup_locations?.name || "le point de retrait",
                  },
                }),
              }
            );
          } catch (e) {
            console.error("Failed to send notification:", e);
          }
        }
      }

      // Update selected order if open
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus as Order["status"] } : null);
      }

      const statusLabel = STATUS_BADGE[newStatus as keyof typeof STATUS_BADGE]?.label || newStatus;
      toast.success(`Commande pass\u00e9e en "${statusLabel}"`);
    } else {
      toast.error("Erreur lors de la mise \u00e0 jour du statut");
    }

    setUpdating(null);
  }

  function getNextStatus(current: string): string | null {
    const idx = STATUS_FLOW.indexOf(current);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  }

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5a3c]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a2a]">Commandes</h1>
          <p className="text-muted-foreground">{filteredOrders.length} commande{filteredOrders.length > 1 ? "s" : ""}</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Livraison</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune commande
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const statusConf = STATUS_BADGE[order.status] || STATUS_BADGE.pending;
                  const nextStatus = getNextStatus(order.status);
                  const nextLabel = nextStatus ? STATUS_BADGE[nextStatus]?.label : null;

                  return (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{order.user_profiles?.full_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{order.user_profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          {order.delivery_type === "chronofresh" ? (
                            <><Truck className="h-3 w-3" /> Livraison</>
                          ) : (
                            <><MapPin className="h-3 w-3" /> {order.pickup_locations?.name || "Retrait"}</>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{order.total.toFixed(2)} &euro;</TableCell>
                      <TableCell>
                        <Badge variant={statusConf.variant}>{statusConf.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {nextStatus && order.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant={nextStatus === "ready" ? "default" : "outline"}
                            disabled={updating === order.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, nextStatus);
                            }}
                            className={nextStatus === "ready" ? "bg-[#2d5a3c] hover:bg-[#1a3a2a]" : ""}
                          >
                            {updating === order.id ? "..." : `→ ${nextLabel}`}
                            {nextStatus === "ready" && <Bell className="h-3 w-3 ml-1" />}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {selectedOrder.order_number}
                </DialogTitle>
                <DialogDescription>{formatDate(selectedOrder.created_at)}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Client Info */}
                <div className="rounded-lg border p-3 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client</p>
                  <p className="font-medium">{selectedOrder.user_profiles?.full_name || "—"}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.user_profiles?.email}</p>
                  {selectedOrder.user_profiles?.phone && (
                    <p className="text-sm text-muted-foreground">{selectedOrder.user_profiles.phone}</p>
                  )}
                </div>

                {/* Delivery Info */}
                <div className="rounded-lg border p-3 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Livraison</p>
                  {selectedOrder.delivery_type === "chronofresh" ? (
                    <>
                      <p className="font-medium flex items-center gap-1"><Truck className="h-4 w-4" /> Chronofresh</p>
                      {selectedOrder.delivery_address && (
                        <p className="text-sm text-muted-foreground">
                          {selectedOrder.delivery_address.street}, {selectedOrder.delivery_address.postalCode} {selectedOrder.delivery_address.city}
                        </p>
                      )}
                      {selectedOrder.shipping_cost && (
                        <p className="text-sm">Frais : {selectedOrder.shipping_cost.toFixed(2)} &euro;</p>
                      )}
                    </>
                  ) : (
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {selectedOrder.pickup_locations?.name || "Point de retrait"}
                    </p>
                  )}
                </div>

                {/* Items */}
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Produits</p>
                  <div className="space-y-2">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.product_name} &times; {item.quantity} {item.product_unit}</span>
                        <span className="font-medium">{item.total_price.toFixed(2)} &euro;</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span>{selectedOrder.total.toFixed(2)} &euro;</span>
                  </div>
                </div>

                {/* Status Update */}
                <div className="flex items-center justify-between">
                  <Badge variant={STATUS_BADGE[selectedOrder.status]?.variant || "outline"} className="text-sm">
                    {STATUS_BADGE[selectedOrder.status]?.label || selectedOrder.status}
                  </Badge>
                  {(() => {
                    const next = getNextStatus(selectedOrder.status);
                    if (!next || selectedOrder.status === "cancelled") return null;
                    const nextLabel = STATUS_BADGE[next]?.label;
                    return (
                      <Button
                        onClick={() => updateOrderStatus(selectedOrder.id, next)}
                        disabled={updating === selectedOrder.id}
                        className="bg-[#2d5a3c] hover:bg-[#1a3a2a]"
                      >
                        {updating === selectedOrder.id ? "Mise à jour..." : `Passer à "${nextLabel}"`}
                        {next === "ready" && <Bell className="h-4 w-4 ml-2" />}
                      </Button>
                    );
                  })()}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
