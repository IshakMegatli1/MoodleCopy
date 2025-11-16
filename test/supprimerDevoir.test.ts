/** @jest-environment node */
import express from 'express';
import request from 'supertest';
import path from 'path';
import session from 'express-session';

// Importer le routeur et les classes
import { RouteurDevoir } from '../src/routes/routeurDevoir';
import { CoursGroupe } from '../src/core/coursGroupe';

// Helper pour créer une app de test
function createTestApp() {
  const app = express();
  app.set('views', path.join(__dirname, '../views'));
  app.set('view engine', 'pug');
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  
  app.use(
    session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }
    })
  );

  // Initialiser coursMap (comme dans app.ts)
  const coursMap = new Map<string, CoursGroupe>();
  const routeurDevoir = new RouteurDevoir(coursMap);
  
  app.use('/', routeurDevoir.router);
  
  // Exposer coursMap pour les tests
  (app as any).coursMap = coursMap;
  
  return app;
}

describe('Supprimer Devoir - Tests de suppression', () => {
  const app = createTestApp();
  
  const COURS_A = 'S20213-LOG210-01';

  // Helper : ajouter un devoir via POST
  const ajouterDevoir = (groupId: string, data: Record<string, any>) =>
    request(app)
      .post(`/cours/${encodeURIComponent(groupId)}/devoirs/add`)
      .type('form')
      .send(data);

  // Helper : supprimer un devoir via POST
  const supprimerDevoir = (groupId: string, titre: string) =>
    request(app)
      .post(`/cours/${encodeURIComponent(groupId)}/devoirs/delete`)
      .type('form')
      .send({ titre });

  // Helper : récupérer la page de gestion des devoirs
  const getGestionDevoirs = (groupId: string) =>
    request(app).get(`/cours/${encodeURIComponent(groupId)}/gestionDevoirs`);

  // Helper : récupérer coursMap
  const getCoursMap = () => (app as any).coursMap as Map<string, CoursGroupe>;

  beforeEach(() => {
    // Nettoyer coursMap avant chaque test
    const coursMap = getCoursMap();
    coursMap.clear();
  });

  it('1) Il est possible de supprimer au moins deux devoirs distincts et ils ne sont plus associés au cours', async () => {
    // ARRANGE - Créer 4 devoirs dans COURS_A
    await ajouterDevoir(COURS_A, {
      titre: 'Devoir A',
      description: 'Premier devoir à supprimer',
      noteMax: '100',
      dateDebut: '2025-01-01T08:00',
      dateFin: '2025-01-15T23:59',
      etat: 'true'
    });

    await ajouterDevoir(COURS_A, {
      titre: 'Devoir B',
      description: 'Deuxième devoir à supprimer',
      noteMax: '50',
      dateDebut: '2025-02-01T08:00',
      dateFin: '2025-02-15T23:59',
      etat: 'true'
    });

    await ajouterDevoir(COURS_A, {
      titre: 'Devoir C',
      description: 'Devoir à conserver',
      noteMax: '75',
      dateDebut: '2025-03-01T08:00',
      dateFin: '2025-03-15T23:59',
      etat: 'true'
    });

    await ajouterDevoir(COURS_A, {
      titre: 'Devoir D',
      description: 'Autre devoir à conserver',
      noteMax: '60',
      dateDebut: '2025-04-01T08:00',
      dateFin: '2025-04-15T23:59',
      etat: 'false'
    });

    // Vérifier l'état initial (4 devoirs)
    const coursMap = getCoursMap();
    let cours = coursMap.get(COURS_A);
    expect(cours).toBeDefined();
    let devoirs = cours!.getDevoirs();
    expect(devoirs.length).toBe(4);

    // ACT - Supprimer "Devoir A"
    const res1 = await supprimerDevoir(COURS_A, 'Devoir A');

    // ASSERT - Vérifier la suppression de "Devoir A"
    expect([200, 302]).toContain(res1.status);
    
    cours = coursMap.get(COURS_A);
    devoirs = cours!.getDevoirs();
    expect(devoirs.length).toBe(3); // 4 - 1 = 3
    expect(devoirs.some(d => d.titre === 'Devoir A')).toBe(false); // ❌ Disparu
    expect(devoirs.some(d => d.titre === 'Devoir B')).toBe(true);  // ✅ Présent
    expect(devoirs.some(d => d.titre === 'Devoir C')).toBe(true);  // ✅ Présent
    expect(devoirs.some(d => d.titre === 'Devoir D')).toBe(true);  // ✅ Présent

    // Vérifier dans le HTML
    let page = await getGestionDevoirs(COURS_A);
    expect(page.text).not.toContain('Devoir A');
    expect(page.text).not.toContain('Premier devoir à supprimer');
    expect(page.text).toContain('Devoir B');
    expect(page.text).toContain('Devoir C');
    expect(page.text).toContain('Devoir D');

    // ACT - Supprimer "Devoir B"
    const res2 = await supprimerDevoir(COURS_A, 'Devoir B');

    // ASSERT - Vérifier la suppression de "Devoir B"
    expect([200, 302]).toContain(res2.status);
    
    cours = coursMap.get(COURS_A);
    devoirs = cours!.getDevoirs();
    expect(devoirs.length).toBe(2); // 3 - 1 = 2
    expect(devoirs.some(d => d.titre === 'Devoir A')).toBe(false); // ❌ Disparu
    expect(devoirs.some(d => d.titre === 'Devoir B')).toBe(false); // ❌ Disparu
    expect(devoirs.some(d => d.titre === 'Devoir C')).toBe(true);  // ✅ Présent
    expect(devoirs.some(d => d.titre === 'Devoir D')).toBe(true);  // ✅ Présent

    // Vérifier dans le HTML
    page = await getGestionDevoirs(COURS_A);
    expect(page.text).not.toContain('Devoir A');
    expect(page.text).not.toContain('Devoir B');
    expect(page.text).not.toContain('Deuxième devoir à supprimer');
    expect(page.text).toContain('Devoir C');
    expect(page.text).toContain('Devoir à conserver');
    expect(page.text).toContain('Devoir D');
    expect(page.text).toContain('Autre devoir à conserver');

    // ASSERT FINAL - Seulement 2 devoirs restants
    expect(devoirs.length).toBe(2);
    expect(devoirs[0].titre).toMatch(/Devoir [CD]/);
    expect(devoirs[1].titre).toMatch(/Devoir [CD]/);
  });

  it('2) Impossible de supprimer un devoir utilisé par des étudiants', async () => {
    // ARRANGE - Créer 2 devoirs
    await ajouterDevoir(COURS_A, {
      titre: 'Devoir Utilisé',
      description: 'Ce devoir a des soumissions d\'étudiants',
      noteMax: '100',
      dateDebut: '2025-01-01T08:00',
      dateFin: '2025-01-15T23:59',
      etat: 'true'
    });

    await ajouterDevoir(COURS_A, {
      titre: 'Devoir Non Utilisé',
      description: 'Ce devoir n\'a pas de soumissions',
      noteMax: '50',
      dateDebut: '2025-02-01T08:00',
      dateFin: '2025-02-15T23:59',
      etat: 'true'
    });

    // Simuler des soumissions d'étudiants pour "Devoir Utilisé"
    const coursMap = getCoursMap();
    const cours = coursMap.get(COURS_A);
    expect(cours).toBeDefined();
    
    const devoirUtilise = cours!.getDevoir('Devoir Utilisé');
    expect(devoirUtilise).toBeDefined();
    
    // Marquer le devoir comme utilisé (simuler des soumissions)
    // Option 1 : Ajouter une propriété 'soumissions' ou 'utilisations'
    (devoirUtilise as any).soumissions = [
      { etudiant: 'etu1@etsmtl.ca', note: 85, date: new Date('2025-01-10') },
      { etudiant: 'etu2@etsmtl.ca', note: 92, date: new Date('2025-01-12') },
      { etudiant: 'etu3@etsmtl.ca', note: 78, date: new Date('2025-01-14') }
    ];

    // Vérifier l'état initial (2 devoirs)
    let devoirs = cours!.getDevoirs();
    expect(devoirs.length).toBe(2);

    // ACT - Tenter de supprimer le devoir utilisé
    const resUtilise = await supprimerDevoir(COURS_A, 'Devoir Utilisé');

    // ASSERT - La suppression doit être refusée
    expect([200, 302, 400, 403]).toContain(resUtilise.status);
    
    // Vérifier que le message d'erreur est présent
    const location = resUtilise.header.location || resUtilise.text;
    expect(location).toMatch(/err=/i);
    const decodedLocation = decodeURIComponent(location);
    expect(decodedLocation).toMatch(/utilisé|soumission|étudiant|impossible/i);

    // Vérifier que le devoir est toujours présent côté serveur
    devoirs = cours!.getDevoirs();
    expect(devoirs.length).toBe(2); // ✅ Aucune suppression
    expect(devoirs.some(d => d.titre === 'Devoir Utilisé')).toBe(true); // ✅ Toujours là
    expect(devoirs.some(d => d.titre === 'Devoir Non Utilisé')).toBe(true);

    // Vérifier dans le HTML
    let page = await getGestionDevoirs(COURS_A);
    expect(page.text).toContain('Devoir Utilisé');
    expect(page.text).toContain('Ce devoir a des soumissions d\'étudiants');
    expect(page.text).toContain('Devoir Non Utilisé');

    // ACT - Supprimer le devoir non utilisé (devrait réussir)
    const resNonUtilise = await supprimerDevoir(COURS_A, 'Devoir Non Utilisé');

    // ASSERT - La suppression doit réussir
    expect([200, 302]).toContain(resNonUtilise.status);
    
    devoirs = cours!.getDevoirs();
    expect(devoirs.length).toBe(1); // 2 - 1 = 1
    expect(devoirs[0].titre).toBe('Devoir Utilisé'); // ✅ Seul restant
    expect(devoirs.some(d => d.titre === 'Devoir Non Utilisé')).toBe(false); // ❌ Supprimé

    // Vérifier dans le HTML
    page = await getGestionDevoirs(COURS_A);
    expect(page.text).toContain('Devoir Utilisé');
    expect(page.text).not.toContain('Devoir Non Utilisé');
    expect(page.text).not.toContain('Ce devoir n\'a pas de soumissions');
  });
});