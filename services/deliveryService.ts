/**
 * Delivery Service
 *
 * Handles shipping rate calculation and delivery address management
 * for Chronofresh cold-chain delivery integration.
 */

import { supabase } from './supabase';

export interface DeliveryAddress {
  name: string;
  street: string;
  postalCode: string;
  city: string;
  phone: string;
  instructions?: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  postal_code_prefix: string;
  base_rate: number;
  rate_per_kg: number;
  min_weight_grams: number;
  max_weight_grams: number;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
}

export interface ShippingRate {
  price: number;
  zone: string;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  weightGrams: number;
}

export interface ShippingCalculationResult {
  success: boolean;
  rate?: ShippingRate;
  error?: string;
}

/**
 * Validates a French postal code format
 */
export function isValidFrenchPostalCode(postalCode: string): boolean {
  return /^[0-9]{5}$/.test(postalCode);
}

/**
 * Gets the department code from a postal code (first 2 digits)
 */
export function getDepartmentFromPostalCode(postalCode: string): string {
  if (!isValidFrenchPostalCode(postalCode)) {
    return '';
  }
  // Handle Corsica (20XXX -> 2A or 2B)
  if (postalCode.startsWith('20')) {
    const num = parseInt(postalCode.substring(2, 3));
    return num >= 0 && num <= 1 ? '2A' : '2B';
  }
  return postalCode.substring(0, 2);
}

/**
 * Finds the matching shipping zone for a postal code
 */
async function findShippingZone(postalCode: string): Promise<ShippingZone | null> {
  const department = postalCode.substring(0, 2);

  // Fetch all active shipping zones
  const { data: zones, error } = await supabase
    .from('shipping_zones')
    .select('*')
    .eq('is_active', true);

  if (error || !zones) {
    console.error('Error fetching shipping zones:', error);
    return null;
  }

  // Find a zone that matches the postal code prefix
  for (const zone of zones) {
    if (zone.postal_code_prefix === '') {
      continue; // Skip catch-all zone for now
    }

    const prefixes = zone.postal_code_prefix.split(',').map((p: string) => p.trim());
    if (prefixes.includes(department)) {
      return zone;
    }
  }

  // Return the catch-all zone (empty prefix)
  return zones.find((z: ShippingZone) => z.postal_code_prefix === '') || null;
}

/**
 * Calculates the shipping rate based on postal code and weight
 */
export async function calculateShippingRate(
  postalCode: string,
  weightGrams: number
): Promise<ShippingCalculationResult> {
  // Validate postal code
  if (!isValidFrenchPostalCode(postalCode)) {
    return {
      success: false,
      error: 'Code postal invalide. Format attendu: 5 chiffres.',
    };
  }

  // Validate weight
  if (weightGrams <= 0) {
    return {
      success: false,
      error: 'Le poids doit être supérieur à 0.',
    };
  }

  // Find the shipping zone
  const zone = await findShippingZone(postalCode);

  if (!zone) {
    return {
      success: false,
      error: 'Zone de livraison non couverte.',
    };
  }

  // Check weight limits
  if (weightGrams < zone.min_weight_grams) {
    return {
      success: false,
      error: `Poids minimum pour la livraison: ${zone.min_weight_grams}g.`,
    };
  }

  if (weightGrams > zone.max_weight_grams) {
    return {
      success: false,
      error: `Poids maximum pour la livraison: ${zone.max_weight_grams / 1000}kg.`,
    };
  }

  // Calculate the price: base_rate + (rate_per_kg * weight_in_kg)
  const weightKg = weightGrams / 1000;
  const price = zone.base_rate + (zone.rate_per_kg * weightKg);

  // Round to 2 decimal places
  const roundedPrice = Math.round(price * 100) / 100;

  return {
    success: true,
    rate: {
      price: roundedPrice,
      zone: zone.name,
      estimatedDaysMin: zone.estimated_days_min,
      estimatedDaysMax: zone.estimated_days_max,
      weightGrams,
    },
  };
}

/**
 * Validates a delivery address
 */
export function validateDeliveryAddress(address: Partial<DeliveryAddress>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!address.name || address.name.trim().length < 2) {
    errors.push('Le nom est requis (minimum 2 caractères).');
  }

  if (!address.street || address.street.trim().length < 5) {
    errors.push('L\'adresse est requise (minimum 5 caractères).');
  }

  if (!address.postalCode || !isValidFrenchPostalCode(address.postalCode)) {
    errors.push('Le code postal doit contenir 5 chiffres.');
  }

  if (!address.city || address.city.trim().length < 2) {
    errors.push('La ville est requise (minimum 2 caractères).');
  }

  if (!address.phone || !/^(\+33|0)[1-9][0-9]{8}$/.test(address.phone.replace(/\s/g, ''))) {
    errors.push('Le numéro de téléphone est invalide.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Formats phone number to French standard
 */
export function formatFrenchPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s/g, '').replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+33')) {
    return cleaned;
  }

  if (cleaned.startsWith('0')) {
    return `+33${cleaned.substring(1)}`;
  }

  return cleaned;
}

/**
 * Formats a delivery address for display
 */
export function formatDeliveryAddress(address: DeliveryAddress): string {
  const lines = [
    address.name,
    address.street,
    `${address.postalCode} ${address.city}`,
  ];

  if (address.instructions) {
    lines.push(`Instructions: ${address.instructions}`);
  }

  return lines.join('\n');
}

export const deliveryService = {
  calculateShippingRate,
  validateDeliveryAddress,
  isValidFrenchPostalCode,
  formatDeliveryAddress,
  formatFrenchPhoneNumber,
  getDepartmentFromPostalCode,
};

export default deliveryService;
