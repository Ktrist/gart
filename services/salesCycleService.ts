/**
 * Service de gestion des Cycles de Vente
 *
 * Ce service détermine si la boutique est ouverte ou fermée
 * en fonction de cycles de vente définis (dates d'ouverture/fermeture).
 *
 * Implémente US-1.1 et US-1.2 de l'Épic 1
 */

export interface SalesCycle {
  id: number;
  openingDate: Date;
  closingDate: Date;
  name: string;
  description?: string;
}

export interface SalesCycleStatus {
  isOpen: boolean;
  currentCycle?: SalesCycle;
  nextCycle?: SalesCycle;
  message: string;
  daysUntilNextOpening?: number;
}

/**
 * Cycles de vente simulés pour les tests
 * Dans une vraie application, ces données viendraient de l'API
 */
const SIMULATED_SALES_CYCLES: SalesCycle[] = [
  {
    id: 1,
    name: 'Cycle Janvier #1',
    openingDate: new Date('2026-01-20T00:00:00'),
    closingDate: new Date('2026-01-26T23:59:59'),
    description: 'Première vente de janvier 2026',
  },
  {
    id: 2,
    name: 'Cycle Février #1',
    openingDate: new Date('2026-02-03T00:00:00'),
    closingDate: new Date('2026-02-09T23:59:59'),
    description: 'Première vente de février 2026',
  },
  {
    id: 3,
    name: 'Cycle Février #2',
    openingDate: new Date('2026-02-17T00:00:00'),
    closingDate: new Date('2026-02-23T23:59:59'),
    description: 'Deuxième vente de février 2026',
  },
  {
    id: 4,
    name: 'Cycle Mars #1',
    openingDate: new Date('2026-03-02T00:00:00'),
    closingDate: new Date('2026-03-08T23:59:59'),
    description: 'Première vente de mars 2026',
  },
];

class SalesCycleService {
  private cycles: SalesCycle[];

  constructor(cycles?: SalesCycle[]) {
    this.cycles = cycles || SIMULATED_SALES_CYCLES;
    // Trier les cycles par date d'ouverture
    this.cycles.sort((a, b) => a.openingDate.getTime() - b.openingDate.getTime());
  }

  /**
   * Obtient le status actuel de la boutique
   */
  getCurrentStatus(): SalesCycleStatus {
    const now = new Date();

    // Trouver le cycle actif (si on est dans une période d'ouverture)
    const currentCycle = this.cycles.find(
      (cycle) => now >= cycle.openingDate && now <= cycle.closingDate
    );

    if (currentCycle) {
      // La boutique est ouverte
      const closingDate = this.formatDate(currentCycle.closingDate);
      return {
        isOpen: true,
        currentCycle,
        message: `Vente ouverte jusqu'au ${closingDate}`,
      };
    }

    // La boutique est fermée, trouver le prochain cycle
    const nextCycle = this.cycles.find((cycle) => cycle.openingDate > now);

    if (nextCycle) {
      const openingDate = this.formatDate(nextCycle.openingDate);
      const daysUntilNextOpening = this.calculateDaysUntil(nextCycle.openingDate);

      return {
        isOpen: false,
        nextCycle,
        message: `Vente fermée. Prochaine ouverture le ${openingDate}`,
        daysUntilNextOpening,
      };
    }

    // Aucun cycle futur trouvé
    return {
      isOpen: false,
      message: 'Vente fermée. Aucune date d\'ouverture prévue pour le moment.',
    };
  }

  /**
   * Obtient tous les cycles de vente
   */
  getAllCycles(): SalesCycle[] {
    return this.cycles;
  }

  /**
   * Obtient les cycles futurs (non commencés)
   */
  getUpcomingCycles(): SalesCycle[] {
    const now = new Date();
    return this.cycles.filter((cycle) => cycle.openingDate > now);
  }

  /**
   * Obtient les cycles passés
   */
  getPastCycles(): SalesCycle[] {
    const now = new Date();
    return this.cycles.filter((cycle) => cycle.closingDate < now);
  }

  /**
   * Vérifie si un cycle spécifique est actif
   */
  isCycleActive(cycleId: number): boolean {
    const now = new Date();
    const cycle = this.cycles.find((c) => c.id === cycleId);

    if (!cycle) return false;

    return now >= cycle.openingDate && now <= cycle.closingDate;
  }

  /**
   * Calcule le nombre de jours jusqu'à une date
   */
  private calculateDaysUntil(date: Date): number {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Formate une date au format français lisible
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  /**
   * Formate une date au format court (DD/MM/YYYY)
   */
  formatDateShort(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  /**
   * Ajoute un nouveau cycle (pour l'administration future)
   */
  addCycle(cycle: Omit<SalesCycle, 'id'>): SalesCycle {
    const newCycle: SalesCycle = {
      ...cycle,
      id: Math.max(...this.cycles.map((c) => c.id), 0) + 1,
    };

    this.cycles.push(newCycle);
    this.cycles.sort((a, b) => a.openingDate.getTime() - b.openingDate.getTime());

    return newCycle;
  }

  /**
   * Met à jour les cycles (pour simuler des changements)
   */
  setCycles(cycles: SalesCycle[]): void {
    this.cycles = cycles;
    this.cycles.sort((a, b) => a.openingDate.getTime() - b.openingDate.getTime());
  }
}

// Instance singleton du service
export const salesCycleService = new SalesCycleService();

// Export de la classe pour les tests
export default SalesCycleService;
