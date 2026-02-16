"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CalendarDays, Plus, Save, Trash2, Play, Square, Clock } from "lucide-react";
import { toast } from "sonner";
import type { SalesCycle } from "@/lib/types";
import { format, isPast, isFuture, isWithinInterval, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

function getCycleStatus(cycle: SalesCycle): { label: string; color: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (!cycle.is_active) return { label: "D\u00e9sactiv\u00e9", color: "text-gray-500", variant: "secondary" };
  const now = new Date();
  const open = parseISO(cycle.opening_date);
  const close = parseISO(cycle.closing_date);
  if (isFuture(open)) return { label: "Planifi\u00e9", color: "text-blue-600", variant: "outline" };
  if (isWithinInterval(now, { start: open, end: close })) return { label: "Ouvert", color: "text-green-600", variant: "default" };
  return { label: "Termin\u00e9", color: "text-gray-500", variant: "secondary" };
}

export default function CyclesPage() {
  const [cycles, setCycles] = useState<SalesCycle[]>([]);
  const [loading, setLoading] = useState(true);

  // Create state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOpeningDate, setNewOpeningDate] = useState("");
  const [newClosingDate, setNewClosingDate] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingCycle, setEditingCycle] = useState<SalesCycle | null>(null);
  const [editName, setEditName] = useState("");
  const [editOpeningDate, setEditOpeningDate] = useState("");
  const [editClosingDate, setEditClosingDate] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deletingCycle, setDeletingCycle] = useState<SalesCycle | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCycles();
  }, []);

  async function loadCycles() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sales_cycles")
      .select("*")
      .order("opening_date", { ascending: false });

    if (!error && data) {
      setCycles(data as SalesCycle[]);
    }
    setLoading(false);
  }

  async function createCycle() {
    if (!newName.trim() || !newOpeningDate || !newClosingDate) return;
    setCreating(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("sales_cycles")
      .insert({
        name: newName.trim(),
        opening_date: new Date(newOpeningDate).toISOString(),
        closing_date: new Date(newClosingDate).toISOString(),
        is_active: true,
      })
      .select("*")
      .single();

    if (!error && data) {
      setCycles((prev) => [data as SalesCycle, ...prev]);
      resetCreateForm();
      toast.success("Cycle cr\u00e9\u00e9 avec succ\u00e8s");
    } else {
      toast.error("Erreur lors de la cr\u00e9ation du cycle");
    }

    setCreating(false);
  }

  function resetCreateForm() {
    setShowCreate(false);
    setNewName("");
    setNewOpeningDate("");
    setNewClosingDate("");
  }

  function openEdit(cycle: SalesCycle) {
    setEditingCycle(cycle);
    setEditName(cycle.name);
    setEditOpeningDate(cycle.opening_date.slice(0, 16));
    setEditClosingDate(cycle.closing_date.slice(0, 16));
  }

  async function saveCycle() {
    if (!editingCycle) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("sales_cycles")
      .update({
        name: editName.trim(),
        opening_date: new Date(editOpeningDate).toISOString(),
        closing_date: new Date(editClosingDate).toISOString(),
      })
      .eq("id", editingCycle.id);

    if (!error) {
      setCycles((prev) =>
        prev.map((c) =>
          c.id === editingCycle.id
            ? { ...c, name: editName.trim(), opening_date: new Date(editOpeningDate).toISOString(), closing_date: new Date(editClosingDate).toISOString() }
            : c
        )
      );
      setEditingCycle(null);
      toast.success("Cycle mis \u00e0 jour");
    } else {
      toast.error("Erreur lors de la mise \u00e0 jour");
    }

    setSaving(false);
  }

  async function toggleActive(cycle: SalesCycle) {
    const supabase = createClient();
    const newActive = !cycle.is_active;

    const { error } = await supabase
      .from("sales_cycles")
      .update({ is_active: newActive })
      .eq("id", cycle.id);

    if (!error) {
      setCycles((prev) =>
        prev.map((c) => (c.id === cycle.id ? { ...c, is_active: newActive } : c))
      );
      toast.success(`Cycle ${newActive ? "activ\u00e9" : "d\u00e9sactiv\u00e9"}`);
    } else {
      toast.error("Erreur lors du changement de statut");
    }
  }

  async function deleteCycle() {
    if (!deletingCycle) return;
    setDeleting(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("sales_cycles")
      .delete()
      .eq("id", deletingCycle.id);

    if (!error) {
      setCycles((prev) => prev.filter((c) => c.id !== deletingCycle.id));
      setDeletingCycle(null);
      toast.success("Cycle supprim\u00e9");
    } else {
      toast.error("Erreur lors de la suppression");
    }

    setDeleting(false);
  }

  const activeCycles = cycles.filter((c) => {
    const status = getCycleStatus(c);
    return status.label === "Ouvert";
  });

  const upcomingCycles = cycles.filter((c) => {
    const status = getCycleStatus(c);
    return status.label === "Planifi\u00e9";
  });

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
          <h1 className="text-2xl font-bold text-[#1a3a2a]">Cycles de vente</h1>
          <p className="text-muted-foreground">{cycles.length} cycle{cycles.length > 1 ? "s" : ""}</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-[#2d5a3c] hover:bg-[#1a3a2a]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau cycle
        </Button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={activeCycles.length > 0 ? "border-green-200 bg-green-50" : "border-gray-200"}>
          <CardContent className="flex items-center gap-3 pt-6">
            <Play className={`h-5 w-5 ${activeCycles.length > 0 ? "text-green-600" : "text-gray-400"}`} />
            <div>
              <p className={`font-semibold ${activeCycles.length > 0 ? "text-green-900" : "text-gray-600"}`}>
                {activeCycles.length > 0 ? `${activeCycles.length} cycle${activeCycles.length > 1 ? "s" : ""} ouvert${activeCycles.length > 1 ? "s" : ""}` : "Aucun cycle ouvert"}
              </p>
              {activeCycles.length > 0 && (
                <p className="text-sm text-green-700">{activeCycles.map((c) => c.name).join(", ")}</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className={upcomingCycles.length > 0 ? "border-blue-200 bg-blue-50" : "border-gray-200"}>
          <CardContent className="flex items-center gap-3 pt-6">
            <Clock className={`h-5 w-5 ${upcomingCycles.length > 0 ? "text-blue-600" : "text-gray-400"}`} />
            <div>
              <p className={`font-semibold ${upcomingCycles.length > 0 ? "text-blue-900" : "text-gray-600"}`}>
                {upcomingCycles.length > 0 ? `${upcomingCycles.length} cycle${upcomingCycles.length > 1 ? "s" : ""} planifi\u00e9${upcomingCycles.length > 1 ? "s" : ""}` : "Aucun cycle planifi\u00e9"}
              </p>
              {upcomingCycles.length > 0 && (
                <p className="text-sm text-blue-700">{upcomingCycles.map((c) => c.name).join(", ")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cycles Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cycle</TableHead>
                <TableHead>Ouverture</TableHead>
                <TableHead>Fermeture</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cycles.map((cycle) => {
                const status = getCycleStatus(cycle);
                return (
                  <TableRow key={cycle.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#faf8f5] flex items-center justify-center">
                          <CalendarDays className="h-4 w-4 text-[#2d5a3c]" />
                        </div>
                        <p className="font-medium text-sm">{cycle.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(parseISO(cycle.opening_date), "dd MMM yyyy HH:mm", { locale: fr })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(parseISO(cycle.closing_date), "dd MMM yyyy HH:mm", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleActive(cycle)}
                          title={cycle.is_active ? "D\u00e9sactiver" : "Activer"}
                        >
                          {cycle.is_active ? (
                            <Square className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEdit(cycle)}>
                          Modifier
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeletingCycle(cycle)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {cycles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Aucun cycle de vente. Cr\u00e9ez votre premier cycle pour commencer.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Cycle Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) resetCreateForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau cycle de vente</DialogTitle>
            <DialogDescription>D\u00e9finir les dates d&apos;ouverture et de fermeture de la boutique</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nom du cycle *</label>
              <Input
                placeholder="Ex: Cycle Mars #1"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Date d&apos;ouverture *</label>
              <Input
                type="datetime-local"
                value={newOpeningDate}
                onChange={(e) => setNewOpeningDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Date de fermeture *</label>
              <Input
                type="datetime-local"
                value={newClosingDate}
                onChange={(e) => setNewClosingDate(e.target.value)}
              />
            </div>
            <Button
              onClick={createCycle}
              disabled={creating || !newName.trim() || !newOpeningDate || !newClosingDate}
              className="w-full bg-[#2d5a3c] hover:bg-[#1a3a2a]"
            >
              <Plus className="h-4 w-4 mr-2" />
              {creating ? "Cr\u00e9ation..." : "Cr\u00e9er le cycle"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Cycle Dialog */}
      <Dialog open={!!editingCycle} onOpenChange={() => setEditingCycle(null)}>
        <DialogContent className="max-w-md">
          {editingCycle && (
            <>
              <DialogHeader>
                <DialogTitle>Modifier le cycle</DialogTitle>
                <DialogDescription>Modifier les d\u00e9tails du cycle de vente</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nom du cycle</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Date d&apos;ouverture</label>
                  <Input
                    type="datetime-local"
                    value={editOpeningDate}
                    onChange={(e) => setEditOpeningDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Date de fermeture</label>
                  <Input
                    type="datetime-local"
                    value={editClosingDate}
                    onChange={(e) => setEditClosingDate(e.target.value)}
                  />
                </div>
                <Button
                  onClick={saveCycle}
                  disabled={saving}
                  className="w-full bg-[#2d5a3c] hover:bg-[#1a3a2a]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingCycle} onOpenChange={() => setDeletingCycle(null)}>
        <DialogContent className="max-w-sm">
          {deletingCycle && (
            <>
              <DialogHeader>
                <DialogTitle>Supprimer le cycle</DialogTitle>
                <DialogDescription>
                  &Ecirc;tes-vous s&ucirc;r de vouloir supprimer &laquo;&nbsp;{deletingCycle.name}&nbsp;&raquo; ? Les commandes li&eacute;es ne seront pas supprim&eacute;es.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setDeletingCycle(null)}>
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={deleteCycle}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? "Suppression..." : "Supprimer"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
