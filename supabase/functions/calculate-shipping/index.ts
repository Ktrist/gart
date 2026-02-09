// Supabase Edge Function: calculate-shipping
// Calculates shipping rates for Chronofresh cold-chain delivery
// Phase 1: Uses shipping_zones table for simulated rates
// Phase 2: Will integrate with Chronofresh SOAP API

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShippingZone {
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

interface ShippingRequest {
  postalCode: string;
  weightGrams: number;
}

interface ShippingResponse {
  success: boolean;
  price?: number;
  zone?: string;
  estimatedDaysMin?: number;
  estimatedDaysMax?: number;
  weightGrams?: number;
  error?: string;
}

/**
 * Validates French postal code format
 */
function isValidFrenchPostalCode(postalCode: string): boolean {
  return /^[0-9]{5}$/.test(postalCode);
}

/**
 * Finds matching shipping zone for a postal code
 */
function findShippingZone(postalCode: string, zones: ShippingZone[]): ShippingZone | null {
  const department = postalCode.substring(0, 2);

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
  return zones.find((z) => z.postal_code_prefix === '') || null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { postalCode, weightGrams }: ShippingRequest = await req.json();

    // Validate postal code
    if (!postalCode || !isValidFrenchPostalCode(postalCode)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Code postal invalide. Format attendu: 5 chiffres.',
        } as ShippingResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate weight
    if (!weightGrams || weightGrams <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Le poids doit être supérieur à 0.',
        } as ShippingResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch active shipping zones
    const { data: zones, error: zonesError } = await supabase
      .from('shipping_zones')
      .select('*')
      .eq('is_active', true);

    if (zonesError || !zones) {
      console.error('Error fetching shipping zones:', zonesError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Impossible de récupérer les zones de livraison.',
        } as ShippingResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Find matching zone
    const zone = findShippingZone(postalCode, zones);

    if (!zone) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Zone de livraison non couverte.',
        } as ShippingResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check weight limits
    if (weightGrams < zone.min_weight_grams) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Poids minimum pour la livraison: ${zone.min_weight_grams}g.`,
        } as ShippingResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (weightGrams > zone.max_weight_grams) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Poids maximum pour la livraison: ${zone.max_weight_grams / 1000}kg.`,
        } as ShippingResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Calculate price: base_rate + (rate_per_kg * weight_in_kg)
    const weightKg = weightGrams / 1000;
    const price = zone.base_rate + (zone.rate_per_kg * weightKg);
    const roundedPrice = Math.round(price * 100) / 100;

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        price: roundedPrice,
        zone: zone.name,
        estimatedDaysMin: zone.estimated_days_min,
        estimatedDaysMax: zone.estimated_days_max,
        weightGrams,
      } as ShippingResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erreur lors du calcul des frais de port.',
      } as ShippingResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
