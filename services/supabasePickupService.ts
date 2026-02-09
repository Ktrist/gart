/**
 * Supabase Pickup Service
 *
 * Remplace pickupService.ts pour utiliser les données Supabase
 */

import { supabaseApiService, PickupLocation as SupabasePickupLocation } from './supabaseApi';

// Ré-exporter l'interface pour compatibilité
export interface PickupLocation {
  id: string;
  name: string;
  type: 'farm' | 'depot';
  address: string;
  city: string;
  postalCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  openingHours: {
    day: string;
    hours: string;
  }[];
  description: string;
  icon: string;
  availableDays?: string[];
}

class SupabasePickupService {
  private cachedLocations: PickupLocation[] | null = null;

  /**
   * Obtient tous les points de retrait depuis Supabase
   */
  async getAllLocations(): Promise<PickupLocation[]> {
    // Utiliser le cache si disponible
    if (this.cachedLocations) {
      return this.cachedLocations;
    }

    try {
      const data = await supabaseApiService.fetchPickupLocations();
      this.cachedLocations = this.convertToLocalFormat(data);
      return this.cachedLocations;
    } catch (error) {
      console.error('Error fetching pickup locations:', error);
      return [];
    }
  }

  /**
   * Obtient un point de retrait par ID
   */
  async getLocationById(id: string): Promise<PickupLocation | undefined> {
    const locations = await this.getAllLocations();
    return locations.find((loc) => loc.id === id);
  }

  /**
   * Obtient les points de retrait par type
   */
  async getLocationsByType(type: 'farm' | 'depot'): Promise<PickupLocation[]> {
    const locations = await this.getAllLocations();
    return locations.filter((loc) => loc.type === type);
  }

  /**
   * Vérifie si un point de retrait est disponible un jour donné
   */
  async isAvailableOnDay(locationId: string, day: string): Promise<boolean> {
    const location = await this.getLocationById(locationId);
    if (!location || !location.availableDays) return false;

    return location.availableDays.includes(day);
  }

  /**
   * Obtient les horaires d'un point de retrait pour un jour donné
   */
  async getHoursForDay(locationId: string, day: string): Promise<string | null> {
    const location = await this.getLocationById(locationId);
    if (!location) return null;

    const schedule = location.openingHours.find((oh) => oh.day === day);
    return schedule ? schedule.hours : null;
  }

  /**
   * Formate l'adresse complète
   */
  async getFullAddress(locationId: string): Promise<string> {
    const location = await this.getLocationById(locationId);
    if (!location) return '';

    return `${location.address}, ${location.postalCode} ${location.city}`;
  }

  /**
   * Calcule la distance approximative entre deux coordonnées (en km)
   * Formule de Haversine simplifiée
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Trie les points de retrait par distance (nécessite la position de l'utilisateur)
   */
  async sortByDistance(
    userLatitude: number,
    userLongitude: number
  ): Promise<PickupLocation[]> {
    const locations = await this.getAllLocations();

    return [...locations].sort((a, b) => {
      if (!a.coordinates || !b.coordinates) return 0;

      const distA = this.calculateDistance(
        userLatitude,
        userLongitude,
        a.coordinates.latitude,
        a.coordinates.longitude
      );

      const distB = this.calculateDistance(
        userLatitude,
        userLongitude,
        b.coordinates.latitude,
        b.coordinates.longitude
      );

      return distA - distB;
    });
  }

  /**
   * Convertit le format Supabase en format local
   */
  private convertToLocalFormat(data: SupabasePickupLocation[]): PickupLocation[] {
    return data.map((location) => ({
      id: location.id,
      name: location.name,
      type: location.type,
      address: location.address,
      city: location.city,
      postalCode: location.postal_code,
      coordinates:
        location.latitude && location.longitude
          ? {
              latitude: location.latitude,
              longitude: location.longitude,
            }
          : undefined,
      openingHours: location.opening_hours,
      description: location.description,
      icon: location.icon,
      availableDays: location.available_days,
    }));
  }

  /**
   * Invalide le cache (utile après une mise à jour)
   */
  invalidateCache() {
    this.cachedLocations = null;
  }
}

// Instance singleton
export const supabasePickupService = new SupabasePickupService();

export default SupabasePickupService;
