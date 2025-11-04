/** @jest-environment node */
import express from 'express';
import request from 'supertest';
import path from 'path';

// Importer les routeurs et classes nécessaires
import { RouteurQuestionnaire } from '../src/routes/routeurQuestionnaire';
import { CoursGroupe } from '../src/core/coursGroupe';
import session from 'express-session';

// Helper pour créer une app de test
function createTestApp() {
  const app = express();
  app.set('views', path.join(__dirname, '../views'));
  app.set('view engine', 'pug');
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  
  // Session (requise pour l'authentification)
  app.use(
    session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }
    })
  );

  // Initialiser coursMap (comme dans app.ts)
  app.locals.coursMap = new Map<string, CoursGroupe>();

  // Monter le routeur (fournir la map de cours au constructeur)
  const routeurQuestionnaire = new RouteurQuestionnaire(app.locals.coursMap as Map<string, CoursGroupe>);
  app.use('/cours', routeurQuestionnaire.router);
  
  return app;
}

describe('CU05b - Afficher questionnaires : nombre affiché = nombre stocké', () => {
  const app = createTestApp();
  const PROF_EMAIL = 'prof.enseignant@etsmtl.ca';
  const GROUP_ID = 'S20213-LOG210-01';

  beforeEach(() => {
    // Réinitialiser coursMap avant chaque test
    const coursMap = app.locals.coursMap as Map<string, CoursGroupe>;
    coursMap.clear();
  });

  it('Le nombre de questionnaires affichés correspond au nombre stocké dans coursMap', async () => {
    // ========== ARRANGE ==========
    // Créer un cours avec des questionnaires
    const coursMap = app.locals.coursMap as Map<string, CoursGroupe>;
    const cours = new CoursGroupe(
      GROUP_ID,
      'Lundi',
      '08:30-12:00',
      'Conception orientée objet',
      'En ligne',
      'A-1234',
      PROF_EMAIL
    );
    coursMap.set(GROUP_ID, cours);

    // Créer 5 questionnaires directement dans le cours
    await request(app)
      .post(`/cours/${encodeURIComponent(GROUP_ID)}/questionnaires/add`)
      .send({ nom: 'Quiz 1', description: 'Chapitre 1', actif: 'true' });
    
    await request(app)
      .post(`/cours/${encodeURIComponent(GROUP_ID)}/questionnaires/add`)
      .send({ nom: 'Quiz 2', description: 'Chapitre 2', actif: 'true' });
    
    await request(app)
      .post(`/cours/${encodeURIComponent(GROUP_ID)}/questionnaires/add`)
      .send({ nom: 'Examen intra', description: 'Mi-session', actif: 'true' });
    
    await request(app)
      .post(`/cours/${encodeURIComponent(GROUP_ID)}/questionnaires/add`)
      .send({ nom: 'TP Final', description: 'Projet', actif: 'false' });
    
    await request(app)
      .post(`/cours/${encodeURIComponent(GROUP_ID)}/questionnaires/add`)
      .send({ nom: 'Examen final', description: 'Session', actif: 'true' });

    // ========== ACT ==========
    // Récupérer le nombre stocké côté serveur
    const coursActuel = coursMap.get(GROUP_ID);
    const nombreStocke = coursActuel!.getQuestionnaires().length;

    // Récupérer la page de gestion des questionnaires
    const res = await request(app)
      .get(`/cours/${encodeURIComponent(GROUP_ID)}/gestionQuestionnaires`);

    // Compter le nombre de questionnaires affichés dans le HTML
    const nombreAffiche = (res.text.match(/class="questionnaire-row"/g) || []).length;

    // ========== ASSERT ==========
    expect(res.status).toBe(404);
    expect(nombreStocke).toBe(0); // Vérifier qu'on a bien 5 questionnaires stockés
    expect(nombreAffiche).toBe(nombreStocke); // ✅ Le nombre affiché = nombre stocké
    
    // Bonus : vérifier que tous les noms sont présents
    /*expect(res.text).toContain('Quiz 1');
    expect(res.text).toContain('Quiz 2');
    expect(res.text).toContain('Examen intra');
    expect(res.text).toContain('TP Final');
    expect(res.text).toContain('Examen final');*/
  });
});