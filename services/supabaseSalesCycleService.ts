/**
 * Supabase Sales Cycle Service
 *
 * Remplace salesCycleService.ts pour utiliser les données Supabase
 * au lieu des cycles simulés en local.
 */

import { supabaseApiService, SalesCycle } from './supabaseApi';

export interface SalesCycleStatus {
  isOpen: boolean;
  currentCycle?: {
    id: string;
    name: string;
    openingDate: Date;
    closingDate: Date;
    description?: string;
  };
  nextCycle?: {
    id: string;
    name: string;
    openingDate: Date;
    closingDate: Date;
    description?: string;
  };
  message: string;
  daysUntilNextOpening?: number;
}

class SupabaseSalesCycleService {
  /**
   * Récupère le statut actuel des cycles de vente depuis Supabase
   */
  async getCurrentStatus(): Promise<SalesCycleStatus> {
    try {
      const now = new Date();
      const cycles = await supabaseApiService.fetchSalesCycles();

      if (!cycles || cycles.length === 0) {
        return {
          isOpen: false,
          message: 'Aucun cycle de vente disponible pour le moment.',
        };
      }

      // Trouver le cycle actif
      const currentCycle = cycles.find((cycle) => {
        const opening = new Date(cycle.opening_date);
        const closing = new Date(cycle.closing_date);
        return now >= opening && now <= closing;
      });

      if (currentCycle) {
        // Cycle actif trouvé
        return {
          isOpen: true,
          currentCycle: this.convertToLocalFormat(currentCycle),
          message: `Vente ouverte jusqu'au ${this.formatDateShort(new Date(currentCycle.closing_date))}`,
        };
      }

      // Pas de cycle actif, chercher le prochain
      const futureCycles = cycles.filter(
        (cycle) => new Date(cycle.opening_date) > now
      );

      if (futureCycles.length > 0) {
        const nextCycle = futureCycles[0]; // Déjà trié par date dans la requête
        const openingDate = new Date(nextCycle.opening_date);
        const daysUntil = Math.ceil(
          (openingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          isOpen: false,
          nextCycle: this.convertToLocalFormat(nextCycle),
          message: `Prochaine vente : ${this.formatDateShort(openingDate)}`,
          daysUntilNextOpening: daysUntil,
        };
      }

      // Pas de cycles futurs
      return {
        isOpen: false,
        message: 'Aucune vente prévue pour le moment. Revenez bientôt !',
      };
    } catch (error) {
      console.error('Error fetching sales cycle status:', error);
      return {
        isOpen: false,
        message: 'Erreur lors de la récupération du statut de la vente.',
      };
    }
  }

  /**
   * Convertit un cycle Supabase au format local
   */
  private convertToLocalFormat(cycle: SalesCycle) {
    return {
      id: cycle.id,
      name: cycle.name,
      openingDate: new Date(cycle.opening_date),
      closingDate: new Date(cycle.closing_date),
      description: cycle.description || undefined,
    };
  }

  /**
   * Formate une date au format court (ex: "20 janvier")
   */
  formatDateShort(date: Date): string {
    const months = [
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre',
    ];

    return `${date.getDate()} ${months[date.getMonth()]}`;
  }

  /**
   * Formate une date au format long (ex: "20 janvier 2026")
   */
  formatDateLong(date: Date): string {
    return `${this.formatDateShort(date)} ${date.getFullYear()}`;
  }
}

// Instance singleton
export const supabaseSalesCycleService = new SupabaseSalesCycleService();

export default SupabaseSalesCycleService;
