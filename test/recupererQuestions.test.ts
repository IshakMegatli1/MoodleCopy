/** @jest-environment node */
import express from 'express';
import request from 'supertest';
import path from 'path';

// Importer ton routeur
import { RouteurQuestions } from '../src/routes/routeurQuestions';
import { CoursGroupe } from '../src/core/coursGroupe';

// Helper pour créer une app de test
function createTestApp() {
  const app = express();
  app.set('views', path.join(__dirname, '../views'));
  app.set('view engine', 'pug');
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Initialiser coursMap (comme dans app.ts)
  const coursMap = new Map<string, CoursGroupe>();
  const routeurQuestions = new RouteurQuestions(coursMap);
  
  app.use('/', routeurQuestions.router);
  
  return app;
}

describe('Récupérer questions - Tests d\'isolation par cours', () => {
  const app = createTestApp();
  
  const COURS_A = 'S20213-LOG210-01';
  const COURS_B = 'S20213-LOG121-01';

  // Helper : ajouter une question via POST
  const ajouterQuestion = (groupId: string, data: Record<string, any>) =>
    request(app)
      .post(`/cours/${encodeURIComponent(groupId)}/questions/add`)
      .type('form')
      .send(data);

  // Helper : récupérer la liste des questions (page HTML)
  const getQuestionsPage = (groupId: string) =>
    request(app).get(`/cours/${encodeURIComponent(groupId)}/gestionQuestions`);

  it('1) Le système retourne toutes les questions (plusieurs) du cours de l\'enseignant', async () => {
    // ARRANGE - Créer plusieurs questions (5) dans COURS_A
    await ajouterQuestion(COURS_A, {
      titre: 'Question 1',
      description: 'Énoncé de la question 1',
      reponse: 'true',
      texteVrai: 'Correct!',
      texteFaux: 'Incorrect!',
      categorie: 'UML'
    });

    await ajouterQuestion(COURS_A, {
      titre: 'Question 2',
      description: 'Énoncé de la question 2',
      reponse: 'false',
      texteVrai: 'Bien!',
      texteFaux: 'Dommage!',
      categorie: 'TDD'
    });

    await ajouterQuestion(COURS_A, {
      titre: 'Question 3',
      description: 'Énoncé de la question 3',
      reponse: 'true',
      texteVrai: 'Bravo!',
      texteFaux: 'Raté!',
      categorie: 'Design Patterns'
    });

    await ajouterQuestion(COURS_A, {
      titre: 'Question 4',
      description: 'Énoncé de la question 4',
      reponse: 'false',
      texteVrai: 'Parfait!',
      texteFaux: 'Erreur!',
      categorie: 'Architecture'
    });

    await ajouterQuestion(COURS_A, {
      titre: 'Question 5',
      description: 'Énoncé de la question 5',
      reponse: 'true',
      texteVrai: 'Excellent!',
      texteFaux: 'Faux!',
      categorie: 'Testing'
    });

    // ACT - Récupérer les questions du COURS_A
    const res = await getQuestionsPage(COURS_A);

    // ASSERT - Toutes les 5 questions doivent être présentes
    expect(res.status).toBe(200);
    
    // Vérifier que toutes les 5 questions sont présentes dans le HTML
    const titres = [
      'Question 1',
      'Question 2', 
      'Question 3',
      'Question 4',
      'Question 5'
    ];
    
    const enonces = [
      'Énoncé de la question 1',
      'Énoncé de la question 2',
      'Énoncé de la question 3',
      'Énoncé de la question 4',
      'Énoncé de la question 5'
    ];

    // Vérifier chaque titre
    titres.forEach(titre => {
      expect(res.text).toContain(titre);
    });

    // Vérifier chaque énoncé
    enonces.forEach(enonce => {
      expect(res.text).toContain(enonce);
    });

    // Vérifier qu'il y a au moins 5 occurrences d'un pattern commun
    // (adapte selon la structure réelle de ton HTML)
    // Options : data-question-id, .card, .question-item, etc.
    const patterns = [
      /Question \d/g,           // "Question 1", "Question 2", etc.
      /Énoncé de la question/g  // "Énoncé de la question"
    ];
    
    // Utiliser le pattern qui matche le mieux
    const matches = res.text.match(patterns[0]);
    expect(matches?.length).toBeGreaterThanOrEqual(5);
  });

  it('2) Le système ne retourne pas des questions (qui existent) dans d\'autres cours', async () => {
    // ARRANGE - Créer des questions dans COURS_A et COURS_B
    await ajouterQuestion(COURS_A, {
      titre: 'Question Cours A - 1',
      description: 'Cette question appartient au cours A',
      reponse: 'true',
      texteVrai: 'Oui',
      texteFaux: 'Non',
      categorie: 'LOG210'
    });

    await ajouterQuestion(COURS_A, {
      titre: 'Question Cours A - 2',
      description: 'Autre question du cours A',
      reponse: 'false',
      texteVrai: 'Correct',
      texteFaux: 'Incorrect',
      categorie: 'LOG210'
    });

    await ajouterQuestion(COURS_B, {
      titre: 'Question Cours B - 1',
      description: 'Cette question appartient au cours B',
      reponse: 'true',
      texteVrai: 'Oui',
      texteFaux: 'Non',
      categorie: 'LOG121'
    });

    await ajouterQuestion(COURS_B, {
      titre: 'Question Cours B - 2',
      description: 'Autre question du cours B',
      reponse: 'false',
      texteVrai: 'Correct',
      texteFaux: 'Incorrect',
      categorie: 'LOG121'
    });

    // ACT - Récupérer les questions de chaque cours
    const resA = await getQuestionsPage(COURS_A);
    const resB = await getQuestionsPage(COURS_B);

    // ASSERT - COURS_A voit uniquement ses propres questions
    expect(resA.status).toBe(200);
    expect(resA.text).toContain('Question Cours A - 1');
    expect(resA.text).toContain('Question Cours A - 2');
    expect(resA.text).not.toContain('Question Cours B - 1');
    expect(resA.text).not.toContain('Question Cours B - 2');
    expect(resA.text).not.toContain('Cette question appartient au cours B');

    // ASSERT - COURS_B voit uniquement ses propres questions
    expect(resB.status).toBe(200);
    expect(resB.text).toContain('Question Cours B - 1');
    expect(resB.text).toContain('Question Cours B - 2');
    expect(resB.text).not.toContain('Question Cours A - 1');
    expect(resB.text).not.toContain('Question Cours A - 2');
    expect(resB.text).not.toContain('Cette question appartient au cours A');
  });
});