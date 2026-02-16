"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Package, Search, Save, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editStock, setEditStock] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editAvailable, setEditAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  // Create product state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newUnit, setNewUnit] = useState("kg");
  const [newStock, setNewStock] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [creating, setCreating] = useState(false);

  // Delete state
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadCategories() {
    const supabase = createClient();
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("display_order", { ascending: true });
    if (data) setCategories(data);
  }

  async function loadProducts() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, price, unit, image_url, stock, is_available, weight_grams, created_at, categories(name)")
      .order("name", { ascending: true });

    if (!error && data) {
      setProducts(data as unknown as Product[]);
    }
    setLoading(false);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setEditStock(product.stock.toString());
    setEditPrice(product.price.toString());
    setEditAvailable(product.is_available);
  }

  async function saveProduct() {
    if (!editingProduct) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .update({
        stock: parseInt(editStock, 10),
        price: parseFloat(editPrice),
        is_available: editAvailable,
      })
      .eq("id", editingProduct.id);

    if (!error) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, stock: parseInt(editStock, 10), price: parseFloat(editPrice), is_available: editAvailable }
            : p
        )
      );
      setEditingProduct(null);
      toast.success(`${editingProduct.name} mis \u00e0 jour`);
    } else {
      toast.error("Erreur lors de la mise \u00e0 jour");
    }

    setSaving(false);
  }

  async function toggleAvailability(product: Product) {
    const supabase = createClient();
    const newAvailable = !product.is_available;

    const { error } = await supabase
      .from("products")
      .update({ is_available: newAvailable })
      .eq("id", product.id);

    if (!error) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_available: newAvailable } : p))
      );
      toast.success(`${product.name} ${newAvailable ? "rendu visible" : "masqu\u00e9"}`);
    } else {
      toast.error("Erreur lors du changement de statut");
    }
  }

  async function createProduct() {
    if (!newName.trim() || !newPrice || !newStock) return;
    setCreating(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: newName.trim(),
        description: newDescription.trim(),
        price: parseFloat(newPrice),
        unit: newUnit,
        stock: parseInt(newStock, 10),
        category_id: newCategory || null,
        image_url: newImageUrl.trim() || null,
        is_available: true,
      })
      .select("id, name, description, price, unit, image_url, stock, is_available, weight_grams, created_at, categories(name)")
      .single();

    if (!error && data) {
      setProducts((prev) => [...prev, data as unknown as Product].sort((a, b) => a.name.localeCompare(b.name)));
      resetCreateForm();
      toast.success(`${newName.trim()} cr\u00e9\u00e9 avec succ\u00e8s`);
    } else {
      toast.error("Erreur lors de la cr\u00e9ation du produit");
    }

    setCreating(false);
  }

  function resetCreateForm() {
    setShowCreate(false);
    setNewName("");
    setNewDescription("");
    setNewPrice("");
    setNewUnit("kg");
    setNewStock("");
    setNewCategory("");
    setNewImageUrl("");
  }

  async function deleteProduct() {
    if (!deletingProduct) return;
    setDeleting(true);

    const supabase = createClient();
    const name = deletingProduct.name;

    // Try hard delete first
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", deletingProduct.id);

    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      setDeletingProduct(null);
      toast.success(`${name} supprim\u00e9`);
    } else if (error.code === "23503") {
      // FK constraint: product is linked to orders, soft-delete instead
      const { error: updateError } = await supabase
        .from("products")
        .update({ is_available: false, stock: 0 })
        .eq("id", deletingProduct.id);

      if (!updateError) {
        setProducts((prev) =>
          prev.map((p) => (p.id === deletingProduct.id ? { ...p, is_available: false, stock: 0 } : p))
        );
        setDeletingProduct(null);
        toast.success(`${name} masqu\u00e9 (li\u00e9 \u00e0 des commandes, suppression impossible)`);
      } else {
        toast.error("Erreur lors de la d\u00e9sactivation du produit");
      }
    } else {
      toast.error("Erreur lors de la suppression");
    }

    setDeleting(false);
  }

  const filtered = search.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.categories?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5 && p.is_available);
  const outOfStockProducts = products.filter((p) => p.stock === 0 && p.is_available);

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
          <h1 className="text-2xl font-bold text-[#1a3a2a]">Produits &amp; Stock</h1>
          <p className="text-muted-foreground">{products.length} produits</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-[#2d5a3c] hover:bg-[#1a3a2a]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau produit
        </Button>
      </div>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outOfStockProducts.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-center gap-3 pt-6">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">{outOfStockProducts.length} produit{outOfStockProducts.length > 1 ? "s" : ""} en rupture</p>
                  <p className="text-sm text-red-700">{outOfStockProducts.map((p) => p.name).join(", ")}</p>
                </div>
              </CardContent>
            </Card>
          )}
          {lowStockProducts.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="flex items-center gap-3 pt-6">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">{lowStockProducts.length} produit{lowStockProducts.length > 1 ? "s" : ""} stock faible</p>
                  <p className="text-sm text-amber-700">{lowStockProducts.map((p) => `${p.name} (${p.stock})`).join(", ")}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Cat&eacute;gorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#faf8f5] flex items-center justify-center">
                        {product.image_url ? (
                          <span className="text-lg">{product.image_url}</span>
                        ) : (
                          <Package className="h-4 w-4 text-[#2d5a3c]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{product.categories?.name || "\u2014"}</TableCell>
                  <TableCell className="font-medium">{product.price.toFixed(2)} &euro;/{product.unit}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      product.stock === 0 ? "text-red-600" :
                      product.stock <= 5 ? "text-amber-600" : "text-[#2d5a3c]"
                    }`}>
                      {product.stock} {product.unit}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.is_available ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleAvailability(product)}
                    >
                      {product.is_available ? "Disponible" : "Masqu\u00e9"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(product)}>
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeletingProduct(product)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Product Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) resetCreateForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau produit</DialogTitle>
            <DialogDescription>Ajouter un produit au catalogue</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nom *</label>
              <Input
                placeholder="Ex: Carottes Bio"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Input
                placeholder="Ex: Carottes bio fra\u00eechement r\u00e9colt\u00e9es"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Prix (&euro;) *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="2.50"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Unit&eacute;</label>
                <Select value={newUnit} onValueChange={setNewUnit}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="pi\u00e8ce">pi\u00e8ce</SelectItem>
                    <SelectItem value="botte">botte</SelectItem>
                    <SelectItem value="lot">lot</SelectItem>
                    <SelectItem value="litre">litre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Stock *</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="25"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Cat&eacute;gorie</label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Emoji / Ic&ocirc;ne</label>
              <Input
                placeholder="Ex: \ud83e\udd55"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
            </div>
            <Button
              onClick={createProduct}
              disabled={creating || !newName.trim() || !newPrice || !newStock}
              className="w-full bg-[#2d5a3c] hover:bg-[#1a3a2a]"
            >
              <Plus className="h-4 w-4 mr-2" />
              {creating ? "Cr\u00e9ation..." : "Cr\u00e9er le produit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-sm">
          {editingProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{editingProduct.name}</DialogTitle>
                <DialogDescription>Modifier le stock et le prix</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Stock ({editingProduct.unit})</label>
                  <Input
                    type="number"
                    min="0"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Prix (&euro;/{editingProduct.unit})</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={editAvailable}
                    onChange={(e) => setEditAvailable(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="available" className="text-sm">Disponible dans la boutique</label>
                </div>
                <Button
                  onClick={saveProduct}
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
      <Dialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <DialogContent className="max-w-sm">
          {deletingProduct && (
            <>
              <DialogHeader>
                <DialogTitle>Supprimer le produit</DialogTitle>
                <DialogDescription>
                  &Ecirc;tes-vous s&ucirc;r de vouloir supprimer &laquo;&nbsp;{deletingProduct.name}&nbsp;&raquo; ? Si le produit est li&eacute; &agrave; des commandes, il sera masqu&eacute; au lieu d&apos;&ecirc;tre supprim&eacute;.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setDeletingProduct(null)}>
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={deleteProduct}
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
