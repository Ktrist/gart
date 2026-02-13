/**
 * Invoice Service
 *
 * Generates PDF invoices for completed orders.
 * Uses expo-print for HTML-to-PDF conversion and expo-sharing for sharing.
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';

export interface InvoiceOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  status: string;
  deliveryType?: 'pickup' | 'chronofresh';
  shippingCost?: number;
  pickupLocationName?: string;
  deliveryAddress?: {
    name?: string;
    street?: string;
    postalCode?: string;
    city?: string;
  };
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productUnit: string;
  }>;
  userName?: string;
  userEmail?: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',') + ' \u20AC';
}

function generateInvoiceHTML(order: InvoiceOrder): string {
  const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const shipping = order.shippingCost || 0;

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e8e5de;">${item.productName}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e8e5de; text-align: center;">${item.quantity} ${item.productUnit}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e8e5de; text-align: right;">${formatPrice(item.unitPrice)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e8e5de; text-align: right; font-weight: 600;">${formatPrice(item.totalPrice)}</td>
      </tr>`
    )
    .join('');

  const deliveryInfo =
    order.deliveryType === 'chronofresh' && order.deliveryAddress
      ? `<p style="margin: 4px 0;"><strong>Livraison Chronofresh</strong></p>
         <p style="margin: 4px 0;">${order.deliveryAddress.name || ''}</p>
         <p style="margin: 4px 0;">${order.deliveryAddress.street || ''}</p>
         <p style="margin: 4px 0;">${order.deliveryAddress.postalCode || ''} ${order.deliveryAddress.city || ''}</p>`
      : order.pickupLocationName
        ? `<p style="margin: 4px 0;"><strong>Retrait</strong> : ${order.pickupLocationName}</p>`
        : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif; color: #1a3a2a; padding: 40px; font-size: 13px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #2d5a3c; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: 800; color: #2d5a3c; letter-spacing: -0.5px; }
        .logo-sub { font-size: 11px; color: #768d5d; margin-top: 4px; }
        .invoice-meta { text-align: right; }
        .invoice-title { font-size: 20px; font-weight: 700; color: #2d5a3c; }
        .invoice-number { font-size: 14px; color: #768d5d; margin-top: 4px; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .info-block { flex: 1; }
        .info-block h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #768d5d; margin-bottom: 8px; }
        .info-block p { margin: 4px 0; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background: #2d5a3c; color: white; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; }
        th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: right; }
        th:nth-child(2) { text-align: center; }
        .totals { margin-left: auto; width: 280px; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
        .total-row.grand { border-top: 2px solid #2d5a3c; margin-top: 8px; padding-top: 12px; font-size: 16px; font-weight: 700; color: #2d5a3c; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e8e5de; text-align: center; color: #768d5d; font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">GART</div>
          <div class="logo-sub">Le Jardin du Bon \u2022 Batilly-en-Puisaye</div>
        </div>
        <div class="invoice-meta">
          <div class="invoice-title">FACTURE</div>
          <div class="invoice-number">${order.orderNumber}</div>
          <div style="margin-top: 8px; font-size: 13px;">${formatDate(order.createdAt)}</div>
        </div>
      </div>

      <div class="info-section">
        <div class="info-block">
          <h3>Vendeur</h3>
          <p><strong>GART - Le Jardin du Bon</strong></p>
          <p>Lieu-dit Le Potager</p>
          <p>45420 Batilly-en-Puisaye</p>
        </div>
        <div class="info-block" style="text-align: right;">
          <h3>Client</h3>
          ${order.userName ? `<p><strong>${order.userName}</strong></p>` : ''}
          ${order.userEmail ? `<p>${order.userEmail}</p>` : ''}
          ${deliveryInfo}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Produit</th>
            <th style="text-align: center;">Quantit\u00E9</th>
            <th style="text-align: right;">Prix unitaire</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Sous-total</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        ${shipping > 0 ? `
        <div class="total-row">
          <span>Frais de livraison</span>
          <span>${formatPrice(shipping)}</span>
        </div>` : ''}
        <div class="total-row grand">
          <span>TOTAL TTC</span>
          <span>${formatPrice(order.total)}</span>
        </div>
      </div>

      <div class="footer">
        <p>GART - Le Jardin du Bon \u2022 AMAP Batilly-en-Puisaye 45420</p>
        <p style="margin-top: 4px;">Merci pour votre commande et votre soutien \u00E0 l'agriculture locale !</p>
      </div>
    </body>
    </html>
  `;
}

export const invoiceService = {
  /**
   * Generate and share a PDF invoice for an order
   */
  async generateAndShare(order: InvoiceOrder): Promise<void> {
    try {
      const html = generateInvoiceHTML(order);

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      if (Platform.OS === 'web') {
        // On web, use print preview
        await Print.printAsync({ html });
        return;
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Facture ${order.orderNumber}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        // Fallback: print
        await Print.printAsync({ html });
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      Alert.alert('Erreur', 'Impossible de g\u00E9n\u00E9rer la facture');
    }
  },

  /**
   * Preview (print) an invoice without saving
   */
  async preview(order: InvoiceOrder): Promise<void> {
    try {
      const html = generateInvoiceHTML(order);
      await Print.printAsync({ html });
    } catch (error) {
      console.error('Error previewing invoice:', error);
      Alert.alert('Erreur', 'Impossible d\'afficher la facture');
    }
  },
};
