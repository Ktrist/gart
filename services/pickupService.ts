/**
 * Service de gestion des points de retrait
 *
 * US-3.2 : Choix du Retrait
 * Ce service gère les différents points de retrait disponibles
 */

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
  availableDays?: string[]; // Jours de retrait disponibles
}

/**
 * Points de retrait disponibles pour Gart - Le jardin du bon
 */
const PICKUP_LOCATIONS: PickupLocation[] = [
  {
    id: 'farm',
    name: 'La Ferme',
    type: 'farm',
    address: 'Lieu-dit Le Potager',
    city: 'Batilly-en-puisaye',
    postalCode: '45420',
    coordinates: {
      latitude: 47.6667,
      longitude: 3.1667,
    },
    openingHours: [
      { day: 'Vendredi', hours: '16h00 - 19h00' },
      { day: 'Samedi', hours: '09h00 - 12h00' },
    ],
    description: 'Retrait directement à la ferme. Venez découvrir notre exploitation et rencontrer les producteurs !',
    icon: '🚜',
    availableDays: ['Vendredi', 'Samedi'],
  },
  {
    id: 'depot-centre',
    name: 'Dépôt Centre-Ville',
    type: 'depot',
    address: '12 Place de la Mairie',
    city: 'Batilly-en-puisaye',
    postalCode: '45420',
    coordinates: {
      latitude: 47.6700,
      longitude: 3.1650,
    },
    openingHours: [
      { day: 'Mercredi', hours: '17h00 - 19h00' },
      { day: 'Vendredi', hours: '17h00 - 19h00' },
      { day: 'Samedi', hours: '10h00 - 12h00' },
    ],
    description: 'Point de retrait en centre-ville, proche de tous les commerces.',
    icon: '🏪',
    availableDays: ['Mercredi', 'Vendredi', 'Samedi'],
  },
  {
    id: 'depot-gare',
    name: 'Dépôt Gare SNCF',
    type: 'depot',
    address: 'Parvis de la Gare',
    city: 'Batilly-en-puisaye',
    postalCode: '45420',
    coordinates: {
      latitude: 47.6650,
      longitude: 3.1680,
    },
    openingHours: [
      { day: 'Mardi', hours: '18h00 - 20h00' },
      { day: 'Jeudi', hours: '18h00 - 20h00' },
      { day: 'Samedi', hours: '09h00 - 13h00' },
    ],
    description: 'Point de retrait pratique à la gare, idéal pour les navetteurs.',
    icon: '🚉',
    availableDays: ['Mardi', 'Jeudi', 'Samedi'],
  },
];

class PickupService {
  private locations: PickupLocation[];

  constructor(locations?: PickupLocation[]) {
    this.locations = locations || PICKUP_LOCATIONS;
  }

  /**
   * Obtient tous les points de retrait
   */
  getAllLocations(): PickupLocation[] {
    return this.locations;
  }

  /**
   * Obtient un point de retrait par ID
   */
  getLocationById(id: string): PickupLocation | undefined {
    return this.locations.find((loc) => loc.id === id);
  }

  /**
   * Obtient les points de retrait par type
   */
  getLocationsByType(type: 'farm' | 'depot'): PickupLocation[] {
    return this.locations.filter((loc) => loc.type === type);
  }

  /**
   * Vérifie si un point de retrait est disponible un jour donné
   */
  isAvailableOnDay(locationId: string, day: string): boolean {
    const location = this.getLocationById(locationId);
    if (!location || !location.availableDays) return false;

    return location.availableDays.includes(day);
  }

  /**
   * Obtient les horaires d'un point de retrait pour un jour donné
   */
  getHoursForDay(locationId: string, day: string): string | null {
    const location = this.getLocationById(locationId);
    if (!location) return null;

    const schedule = location.openingHours.find((oh) => oh.day === day);
    return schedule ? schedule.hours : null;
  }

  /**
   * Formate l'adresse complète
   */
  getFullAddress(locationId: string): string {
    const location = this.getLocationById(locationId);
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
  sortByDistance(
    userLatitude: number,
    userLongitude: number
  ): PickupLocation[] {
    return [...this.locations].sort((a, b) => {
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
}

// Instance singleton
export const pickupService = new PickupService();

export default PickupService;
