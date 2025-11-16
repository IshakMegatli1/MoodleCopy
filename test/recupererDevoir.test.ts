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

describe('Récupérer Devoir - Tests de récupération', () => {
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

  it('1) Il est possible de récupérer au moins deux devoirs distincts', async () => {
    // ARRANGE - Créer 3 devoirs distincts dans COURS_A
    await ajouterDevoir(COURS_A, {
      titre: 'Devoir 1 - UML',
      description: 'Diagramme de classes',
      noteMax: '100',
      dateDebut: '2025-01-01T08:00',
      dateFin: '2025-01-15T23:59',
      etat: 'true'
    });

    await ajouterDevoir(COURS_A, {
      titre: 'Devoir 2 - TDD',
      description: 'Tests unitaires avec Jest',
      noteMax: '50',
      dateDebut: '2025-02-01T08:00',
      dateFin: '2025-02-15T23:59',
      etat: 'true'
    });

    await ajouterDevoir(COURS_A, {
      titre: 'Devoir 3 - Projet',
      description: 'Projet de session complet',
      noteMax: '200',
      dateDebut: '2025-03-01T08:00',
      dateFin: '2025-04-30T23:59',
      etat: 'false'
    });

    // ACT - Récupérer tous les devoirs du cours
    const coursMap = getCoursMap();
    const cours = coursMap.get(COURS_A);
    expect(cours).toBeDefined();
    
    const devoirs = cours!.getDevoirs();

    // ASSERT - Vérifier qu'on peut récupérer les 3 devoirs distincts
    expect(devoirs.length).toBe(3);

    // Vérifier la récupération du Devoir 1
    const devoir1 = devoirs.find(d => d.titre === 'Devoir 1 - UML');
    expect(devoir1).toBeDefined();
    expect(devoir1!.titre).toBe('Devoir 1 - UML');
    expect(devoir1!.description).toBe('Diagramme de classes');
    expect(devoir1!.noteMax).toBe(100);
    expect(devoir1!.etat).toBe(true);

    // Vérifier la récupération du Devoir 2
    const devoir2 = devoirs.find(d => d.titre === 'Devoir 2 - TDD');
    expect(devoir2).toBeDefined();
    expect(devoir2!.titre).toBe('Devoir 2 - TDD');
    expect(devoir2!.description).toBe('Tests unitaires avec Jest');
    expect(devoir2!.noteMax).toBe(50);
    expect(devoir2!.etat).toBe(true);

    // Vérifier la récupération du Devoir 3
    const devoir3 = devoirs.find(d => d.titre === 'Devoir 3 - Projet');
    expect(devoir3).toBeDefined();
    expect(devoir3!.titre).toBe('Devoir 3 - Projet');
    expect(devoir3!.description).toBe('Projet de session complet');
    expect(devoir3!.noteMax).toBe(200);
    expect(devoir3!.etat).toBe(false);

    // BONUS : Vérifier aussi via l'API HTTP (HTML)
    const res = await getGestionDevoirs(COURS_A);
    expect(res.status).toBe(200);
    expect(res.text).toContain('Devoir 1 - UML');
    expect(res.text).toContain('Diagramme de classes');
    expect(res.text).toContain('Devoir 2 - TDD');
    expect(res.text).toContain('Tests unitaires avec Jest');
    expect(res.text).toContain('Devoir 3 - Projet');
    expect(res.text).toContain('Projet de session complet');
  });

  it('2) Le devoir récupéré appartient au cours (et pas à un autre cours)', async () => {
    // ARRANGE - Créer des devoirs dans 2 cours différents
    
    // Devoirs du COURS_A (LOG210)
    await ajouterDevoir(COURS_A, {
      titre: 'Devoir LOG210 - A',
      description: 'Devoir exclusif au cours LOG210',
      noteMax: '100',
      dateDebut: '2025-01-01T08:00',
      dateFin: '2025-01-15T23:59',
      etat: 'true'
    });

    await ajouterDevoir(COURS_A, {
      titre: 'Devoir LOG210 - B',
      description: 'Autre devoir du cours LOG210',
      noteMax: '75',
      dateDebut: '2025-02-01T08:00',
      dateFin: '2025-02-15T23:59',
      etat: 'true'
    });

    // Devoirs du COURS_B (LOG121)
    await ajouterDevoir(COURS_B, {
      titre: 'Devoir LOG121 - A',
      description: 'Devoir exclusif au cours LOG121',
      noteMax: '50',
      dateDebut: '2025-01-10T08:00',
      dateFin: '2025-01-25T23:59',
      etat: 'true'
    });

    await ajouterDevoir(COURS_B, {
      titre: 'Devoir LOG121 - B',
      description: 'Autre devoir du cours LOG121',
      noteMax: '60',
      dateDebut: '2025-02-10T08:00',
      dateFin: '2025-02-25T23:59',
      etat: 'false'
    });

    // ACT - Récupérer les devoirs de chaque cours
    const coursMap = getCoursMap();
    const coursA = coursMap.get(COURS_A);
    const coursB = coursMap.get(COURS_B);

    expect(coursA).toBeDefined();
    expect(coursB).toBeDefined();

    const devoirsA = coursA!.getDevoirs();
    const devoirsB = coursB!.getDevoirs();

    // ASSERT - COURS_A contient uniquement ses devoirs
    expect(devoirsA.length).toBe(2);
    
    // Vérifier que les devoirs récupérés appartiennent bien au COURS_A
    devoirsA.forEach(devoir => {
      expect(devoir.groupId).toBe(COURS_A);
    });

    // Vérifier la présence des devoirs du COURS_A
    expect(devoirsA.some(d => d.titre === 'Devoir LOG210 - A')).toBe(true);
    expect(devoirsA.some(d => d.titre === 'Devoir LOG210 - B')).toBe(true);

    // Vérifier l'absence des devoirs du COURS_B dans COURS_A
    expect(devoirsA.some(d => d.titre === 'Devoir LOG121 - A')).toBe(false);
    expect(devoirsA.some(d => d.titre === 'Devoir LOG121 - B')).toBe(false);

    // ASSERT - COURS_B contient uniquement ses devoirs
    expect(devoirsB.length).toBe(2);
    
    // Vérifier que les devoirs récupérés appartiennent bien au COURS_B
    devoirsB.forEach(devoir => {
      expect(devoir.groupId).toBe(COURS_B);
    });

    // Vérifier la présence des devoirs du COURS_B
    expect(devoirsB.some(d => d.titre === 'Devoir LOG121 - A')).toBe(true);
    expect(devoirsB.some(d => d.titre === 'Devoir LOG121 - B')).toBe(true);

    // Vérifier l'absence des devoirs du COURS_A dans COURS_B
    expect(devoirsB.some(d => d.titre === 'Devoir LOG210 - A')).toBe(false);
    expect(devoirsB.some(d => d.titre === 'Devoir LOG210 - B')).toBe(false);

    // BONUS : Vérifier aussi via l'API HTTP (isolation dans le HTML)
    const resA = await getGestionDevoirs(COURS_A);
    expect(resA.status).toBe(200);
    expect(resA.text).toContain('Devoir LOG210 - A');
    expect(resA.text).toContain('Devoir LOG210 - B');
    expect(resA.text).not.toContain('Devoir LOG121 - A');
    expect(resA.text).not.toContain('Devoir LOG121 - B');

    const resB = await getGestionDevoirs(COURS_B);
    expect(resB.status).toBe(200);
    expect(resB.text).toContain('Devoir LOG121 - A');
    expect(resB.text).toContain('Devoir LOG121 - B');
    expect(resB.text).not.toContain('Devoir LOG210 - A');
    expect(resB.text).not.toContain('Devoir LOG210 - B');
  });
});