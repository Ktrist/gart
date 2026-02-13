"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Package, Search, Save, AlertTriangle } from "lucide-react";
import type { Product } from "@/lib/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editStock, setEditStock] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editAvailable, setEditAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

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
    }
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
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a2a]">Produits &amp; Stock</h1>
        <p className="text-muted-foreground">{products.length} produits</p>
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
                  <TableCell className="text-sm">{product.categories?.name || "—"}</TableCell>
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
                      {product.is_available ? "Disponible" : "Masqué"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => openEdit(product)}>
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
    </div>
  );
}
