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

describe('Ajouter Devoir - Tests de validation', () => {
  const app = createTestApp();
  
  const COURS_A = 'S20213-LOG210-01';
  const COURS_B = 'S20213-LOG121-01';

  // Helper : ajouter un devoir via POST
  const ajouterDevoir = (groupId: string, data: Record<string, any>) =>
    request(app)
      .post(`/cours/${encodeURIComponent(groupId)}/devoirs/add`)
      .type('form')
      .send(data);

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

  it('1) Le devoir créé est associé au cours', async () => {
    // ARRANGE - Données du devoir
    const devoirData = {
      titre: 'Devoir 1',
      description: 'Premier devoir du cours',
      noteMax: '100',
      dateDebut: '2025-01-01T08:00',
      dateFin: '2025-01-15T23:59',
      etat: 'true'
    };

    // ACT - Créer le devoir
    const res = await ajouterDevoir(COURS_A, devoirData);

    // ASSERT - Vérifier la redirection avec message de succès
    expect([200, 302]).toContain(res.status);

    // Vérifier côté serveur (coursMap)
    const coursMap = getCoursMap();
    const cours = coursMap.get(COURS_A);
    expect(cours).toBeDefined();
    
    const devoirs = cours!.getDevoirs();
    expect(devoirs.length).toBe(1);
    expect(devoirs[0].titre).toBe('Devoir 1');
    expect(devoirs[0].description).toBe('Premier devoir du cours');
    expect(devoirs[0].noteMax).toBe(100);
    expect(devoirs[0].groupId).toBe(COURS_A);

    // Vérifier côté client (HTML)
    const pageRes = await getGestionDevoirs(COURS_A);
    expect(pageRes.text).toContain('Devoir 1');
    expect(pageRes.text).toContain('Premier devoir du cours');
  });

  it('2) Le devoir créé n\'est pas associé à un autre cours', async () => {
    // ARRANGE - Créer un devoir dans COURS_A
    await ajouterDevoir(COURS_A, {
      titre: 'Devoir Cours A',
      description: 'Devoir exclusif au cours A',
      noteMax: '100',
      dateDebut: '2025-01-01T08:00',
      dateFin: '2025-01-15T23:59',
      etat: 'true'
    });

    // Créer un devoir dans COURS_B
    await ajouterDevoir(COURS_B, {
      titre: 'Devoir Cours B',
      description: 'Devoir exclusif au cours B',
      noteMax: '50',
      dateDebut: '2025-02-01T08:00',
      dateFin: '2025-02-15T23:59',
      etat: 'true'
    });

    // ACT - Vérifier l'isolation
    const coursMap = getCoursMap();
    const coursA = coursMap.get(COURS_A);
    const coursB = coursMap.get(COURS_B);

    // ASSERT - COURS_A contient uniquement son devoir
    expect(coursA).toBeDefined();
    const devoirsA = coursA!.getDevoirs();
    expect(devoirsA.length).toBe(1);
    expect(devoirsA[0].titre).toBe('Devoir Cours A');
    expect(devoirsA[0].groupId).toBe(COURS_A);
    expect(devoirsA.some(d => d.titre === 'Devoir Cours B')).toBe(false);

    // ASSERT - COURS_B contient uniquement son devoir
    expect(coursB).toBeDefined();
    const devoirsB = coursB!.getDevoirs();
    expect(devoirsB.length).toBe(1);
    expect(devoirsB[0].titre).toBe('Devoir Cours B');
    expect(devoirsB[0].groupId).toBe(COURS_B);
    expect(devoirsB.some(d => d.titre === 'Devoir Cours A')).toBe(false);

    // Vérifier côté client (HTML) - COURS_A ne voit pas le devoir de COURS_B
    const pageA = await getGestionDevoirs(COURS_A);
    expect(pageA.text).toContain('Devoir Cours A');
    expect(pageA.text).not.toContain('Devoir Cours B');

    // Vérifier côté client (HTML) - COURS_B ne voit pas le devoir de COURS_A
    const pageB = await getGestionDevoirs(COURS_B);
    expect(pageB.text).toContain('Devoir Cours B');
    expect(pageB.text).not.toContain('Devoir Cours A');
  });

  it('3) Un deuxième devoir peut être créé et associé au cours', async () => {
    // ARRANGE - Créer le premier devoir
    await ajouterDevoir(COURS_A, {
      titre: 'Devoir 1',
      description: 'Premier devoir',
      noteMax: '100',
      dateDebut: '2025-01-01T08:00',
      dateFin: '2025-01-15T23:59',
      etat: 'true'
    });

    // ACT - Créer le deuxième devoir
    await ajouterDevoir(COURS_A, {
      titre: 'Devoir 2',
      description: 'Deuxième devoir',
      noteMax: '50',
      dateDebut: '2025-02-01T08:00',
      dateFin: '2025-02-15T23:59',
      etat: 'true'
    });

    // ASSERT - Vérifier que les 2 devoirs sont présents
    const coursMap = getCoursMap();
    const cours = coursMap.get(COURS_A);
    expect(cours).toBeDefined();

    const devoirs = cours!.getDevoirs();
    expect(devoirs.length).toBe(2);

    // Vérifier les propriétés du premier devoir
    const devoir1 = devoirs.find(d => d.titre === 'Devoir 1');
    expect(devoir1).toBeDefined();
    expect(devoir1!.description).toBe('Premier devoir');
    expect(devoir1!.noteMax).toBe(100);

    // Vérifier les propriétés du deuxième devoir
    const devoir2 = devoirs.find(d => d.titre === 'Devoir 2');
    expect(devoir2).toBeDefined();
    expect(devoir2!.description).toBe('Deuxième devoir');
    expect(devoir2!.noteMax).toBe(50);

    // Vérifier côté client (HTML)
    const page = await getGestionDevoirs(COURS_A);
    expect(page.text).toContain('Devoir 1');
    expect(page.text).toContain('Premier devoir');
    expect(page.text).toContain('Devoir 2');
    expect(page.text).toContain('Deuxième devoir');
  });

  it('4) Impossible de créer un devoir avec un nom qui existe déjà', async () => {
    // ARRANGE - Créer un premier devoir
    await ajouterDevoir(COURS_A, {
      titre: 'Devoir Unique',
      description: 'Description originale',
      noteMax: '100',
      dateDebut: '2025-01-01T08:00',
      dateFin: '2025-01-15T23:59',
      etat: 'true'
    });

    // ACT - Tenter de créer un devoir avec le même titre
    const res = await ajouterDevoir(COURS_A, {
      titre: 'Devoir Unique',
      description: 'Description différente',
      noteMax: '50',
      dateDebut: '2025-02-01T08:00',
      dateFin: '2025-02-15T23:59',
      etat: 'false'
    });

    // ASSERT - Vérifier la redirection avec message d'erreur
    expect([200, 302]).toContain(res.status);
    expect(res.header.location || res.text).toMatch(/err=/i);
    expect(res.header.location || res.text).toMatch(/unique|existe/i);

    // Vérifier que seulement 1 devoir existe
    const coursMap = getCoursMap();
    const cours = coursMap.get(COURS_A);
    const devoirs = cours!.getDevoirs();
    expect(devoirs.length).toBe(1);

    // Vérifier que c'est le premier devoir qui a été conservé
    expect(devoirs[0].titre).toBe('Devoir Unique');
    expect(devoirs[0].description).toBe('Description originale');
    expect(devoirs[0].noteMax).toBe(100);
  });

  it('5) Impossible de créer un devoir si la date de début n\'est pas avant la date de fin', async () => {
    // ARRANGE & ACT - Tenter de créer un devoir avec dateFin <= dateDebut

    // Cas 1 : dateFin = dateDebut
    const res1 = await ajouterDevoir(COURS_A, {
      titre: 'Devoir Dates Égales',
      description: 'Test dates égales',
      noteMax: '100',
      dateDebut: '2025-01-15T08:00',
      dateFin: '2025-01-15T08:00', // ❌ Même date/heure
      etat: 'true'
    });

    // ASSERT - Erreur attendue
    expect([200, 302]).toContain(res1.status);
    const location1 = res1.header.location || '';
    expect(location1).toMatch(/err=/i);
    // Décoder l'URL pour vérifier le message d'erreur
    const decodedLocation1 = decodeURIComponent(location1);
    expect(decodedLocation1).toMatch(/postérieure|après|fin.*début/i);

    // Cas 2 : dateFin < dateDebut
    const res2 = await ajouterDevoir(COURS_A, {
      titre: 'Devoir Dates Inversées',
      description: 'Test dates inversées',
      noteMax: '100',
      dateDebut: '2025-01-15T08:00',
      dateFin: '2025-01-10T08:00', // ❌ Fin avant début
      etat: 'true'
    });

    // ASSERT - Erreur attendue
    expect([200, 302]).toContain(res2.status);
    const location2 = res2.header.location || '';
    expect(location2).toMatch(/err=/i);
    const decodedLocation2 = decodeURIComponent(location2);
    expect(decodedLocation2).toMatch(/postérieure|après|fin.*début/i);

    // Vérifier qu'aucun devoir n'a été créé
    const coursMap = getCoursMap();
    let cours = coursMap.get(COURS_A);
    const devoirs = cours ? cours.getDevoirs() : [];
    expect(devoirs.length).toBe(0);

    // Cas 3 (BONUS) : Dates valides (dateFin > dateDebut) ✅
    const res3 = await ajouterDevoir(COURS_A, {
      titre: 'Devoir Dates Valides',
      description: 'Test dates valides',
      noteMax: '100',
      dateDebut: '2025-01-01T08:00',
      dateFin: '2025-01-15T23:59', // ✅ Fin après début
      etat: 'true'
    });

    // ASSERT - Succès attendu
    expect([200, 302]).toContain(res3.status);
    
    // ✅ Récupérer à nouveau le cours APRÈS la création réussie
    cours = coursMap.get(COURS_A);
    expect(cours).toBeDefined(); // Vérifier que le cours existe maintenant
    
    const devoirsApres = cours?.getDevoirs() || [];
    expect(devoirsApres.length).toBe(1);
    expect(devoirsApres[0].titre).toBe('Devoir Dates Valides');
  });
});