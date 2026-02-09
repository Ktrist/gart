/**
 * Utilitaire de test pour le service de cycles de vente
 *
 * Ce fichier permet de tester différents scénarios:
 * - Boutique ouverte dans un cycle actif
 * - Boutique fermée avec un prochain cycle
 * - Boutique fermée sans prochain cycle
 */

import SalesCycleService, { SalesCycle } from './salesCycleService';

// Fonction utilitaire pour créer une date relative à aujourd'hui
function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Scénario 1: Boutique actuellement ouverte
export function testOpenShopScenario() {
  console.log('=== TEST: Boutique Ouverte ===');

  const cycles: SalesCycle[] = [
    {
      id: 1,
      name: 'Cycle Test Ouvert',
      openingDate: daysFromNow(-2), // Ouvert depuis 2 jours
      closingDate: daysFromNow(5),  // Ferme dans 5 jours
      description: 'Cycle de test actuellement actif',
    },
  ];

  const service = new SalesCycleService(cycles);
  const status = service.getCurrentStatus();

  console.log('Status:', status.isOpen ? 'OUVERT ✅' : 'FERMÉ ❌');
  console.log('Message:', status.message);
  console.log('Cycle actuel:', status.currentCycle?.name);
  console.log('---\n');

  return status;
}

// Scénario 2: Boutique fermée avec prochain cycle proche
export function testClosedWithUpcomingCycle() {
  console.log('=== TEST: Boutique Fermée - Prochain cycle dans 3 jours ===');

  const cycles: SalesCycle[] = [
    {
      id: 1,
      name: 'Cycle Passé',
      openingDate: daysFromNow(-10),
      closingDate: daysFromNow(-5),
      description: 'Cycle terminé',
    },
    {
      id: 2,
      name: 'Prochain Cycle',
      openingDate: daysFromNow(3),  // Ouvre dans 3 jours
      closingDate: daysFromNow(10),
      description: 'Cycle à venir',
    },
  ];

  const service = new SalesCycleService(cycles);
  const status = service.getCurrentStatus();

  console.log('Status:', status.isOpen ? 'OUVERT ✅' : 'FERMÉ ❌');
  console.log('Message:', status.message);
  console.log('Prochain cycle:', status.nextCycle?.name);
  console.log('Jours avant ouverture:', status.daysUntilNextOpening);
  console.log('---\n');

  return status;
}

// Scénario 3: Boutique fermée sans prochain cycle
export function testClosedWithoutUpcomingCycle() {
  console.log('=== TEST: Boutique Fermée - Aucun prochain cycle ===');

  const cycles: SalesCycle[] = [
    {
      id: 1,
      name: 'Dernier Cycle',
      openingDate: daysFromNow(-10),
      closingDate: daysFromNow(-5),
      description: 'Cycle terminé sans suite',
    },
  ];

  const service = new SalesCycleService(cycles);
  const status = service.getCurrentStatus();

  console.log('Status:', status.isOpen ? 'OUVERT ✅' : 'FERMÉ ❌');
  console.log('Message:', status.message);
  console.log('Prochain cycle:', status.nextCycle ? status.nextCycle.name : 'Aucun');
  console.log('---\n');

  return status;
}

// Scénario 4: Boutique ouvre aujourd'hui
export function testOpeningToday() {
  console.log('=== TEST: Boutique Ouvre Aujourd\'hui ===');

  const cycles: SalesCycle[] = [
    {
      id: 1,
      name: 'Cycle Aujourd\'hui',
      openingDate: daysFromNow(0),  // Aujourd'hui
      closingDate: daysFromNow(7),
      description: 'Cycle qui commence aujourd\'hui',
    },
  ];

  const service = new SalesCycleService(cycles);
  const status = service.getCurrentStatus();

  console.log('Status:', status.isOpen ? 'OUVERT ✅' : 'FERMÉ ❌');
  console.log('Message:', status.message);
  console.log('Cycle actuel:', status.currentCycle?.name);
  console.log('---\n');

  return status;
}

// Scénario 5: Boutique ferme aujourd'hui
export function testClosingToday() {
  console.log('=== TEST: Boutique Ferme Aujourd\'hui ===');

  const cycles: SalesCycle[] = [
    {
      id: 1,
      name: 'Cycle Se Termine',
      openingDate: daysFromNow(-7),
      closingDate: daysFromNow(0),  // Aujourd'hui
      description: 'Dernier jour',
    },
    {
      id: 2,
      name: 'Prochain Cycle',
      openingDate: daysFromNow(7),
      closingDate: daysFromNow(14),
    },
  ];

  const service = new SalesCycleService(cycles);
  const status = service.getCurrentStatus();

  console.log('Status:', status.isOpen ? 'OUVERT ✅' : 'FERMÉ ❌');
  console.log('Message:', status.message);
  console.log('Cycle actuel:', status.currentCycle?.name);
  console.log('---\n');

  return status;
}

// Exécuter tous les tests
export function runAllTests() {
  console.log('\n🧪 TESTS DU SERVICE DE CYCLES DE VENTE\n');

  testOpenShopScenario();
  testClosedWithUpcomingCycle();
  testClosedWithoutUpcomingCycle();
  testOpeningToday();
  testClosingToday();

  console.log('✅ Tous les tests terminés!\n');
}

// Pour exécuter les tests depuis la console:
// import { runAllTests } from './services/salesCycleService.test';
// runAllTests();
