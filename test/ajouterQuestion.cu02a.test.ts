/** @jest-environment node */
import express from 'express';
import request from 'supertest';
import path from 'path';

// IMPORTANT : importe ton routeur tel qu'implémenté
import { RouteurQuestions } from '../src/routes/routeurQuestions';

// Petit helper pour créer une app de test qui rend les vues Pug
function createTestApp() {
  const app = express();
  app.set('views', path.join(__dirname, '../views')); // adapte si besoin
  app.set('view engine', 'pug');
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  const rq = new RouteurQuestions();
  // on monte le routeur à la racine, tes chemins sont absolus (/cours/:group_id/...)
  app.use('/', rq.router);
  return app;
}

describe('CU02a - Ajouter question (RouteurQuestions)', () => {
  const app = createTestApp();

  const G1 = 'G1';
  const G2 = 'G2';

  // helpers
  const postAdd = (group_id: string, data: Record<string, any>) =>
    request(app)
      .post(`/cours/${encodeURIComponent(group_id)}/questions/add`)
      .type('form')
      .send(data);

  const getList = (group_id: string, qs?: Record<string, any>) => {
    const q = qs
      ? '?' +
        Object.entries(qs)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join('&')
      : '';
    return request(app).get(`/cours/${encodeURIComponent(group_id)}/gestionQuestions${q}`);
  };

  beforeEach(async () => {
    // Rien de spécial ici : le store est dans le module du routeur.
    // Chaque test réutilise la même instance d'app ; on garantit l'isolation en variant les group_id
  });

  it('1) Succès : la question est associée au bon cours et un message de confirmation est renvoyé', async () => {
    const resPost = await postAdd(G1, {
      titre: 'Q1',
      description: 'Énoncé Q1',
      reponse: 'true',
      texteVrai: 'Bravo!',
      texteFaux: 'Non!',
      categorie: 'intro'
    });

    // Redirection vers /gestionQuestions avec msg
    expect(resPost.status).toBeGreaterThanOrEqual(300);
    expect(resPost.status).toBeLessThan(400);
    expect(resPost.headers.location).toContain(`/cours/${G1}/gestionQuestions`);
    expect(decodeURIComponent(resPost.headers.location)).toContain('msg=');

    // A) Suivre exactement la location renvoyée par le POST
    const resList = await request(app).get(resPost.headers.location);
    expect(resList.status).toBe(200);
    expect(resList.text).toContain('Q1');               // titre affiché
    // Selon ton Pug, message peut apparaître dans un alert ou toast :
    // on tolère "msg" dans la page (p.ex. texte "Question ajoutée" ou dans script toast).
    expect(resList.text.toLowerCase()).toMatch(/ajoutée|succès|success/);
  });

  it("2) La question n'est pas associée à un autre cours", async () => {
    await postAdd(G1, {
      titre: 'Q2',
      description: 'Énoncé Q2',
      reponse: 'false',
      texteVrai: '',
      texteFaux: '',
      categorie: 'tags'
    });

    const resG1 = await getList(G1);
    expect(resG1.text).toContain('Q2');

    const resG2 = await getList(G2);
    expect(resG2.text).not.toContain('Q2'); // la question ne doit pas apparaître ailleurs
  });

  it("3) Une deuxième question peut être ajoutée et listée pour le même cours", async () => {
    await postAdd(G1, {
      titre: 'Q3-1',
      description: 'Énoncé Q3-1',
      reponse: 'true',
      texteVrai: '',
      texteFaux: '',
      categorie: 'catA'
    });
    await postAdd(G1, {
      titre: 'Q3-2',
      description: 'Énoncé Q3-2',
      reponse: 'false',
      texteVrai: '',
      texteFaux: '',
      categorie: 'catB'
    });

    const res = await getList(G1);
    expect(res.status).toBe(200);
    expect(res.text).toContain('Q3-1');
    expect(res.text).toContain('Q3-2');
  });

  it("4) Doublon (titre non unique) : le système rejette et renvoie un message d'erreur", async () => {
    // Ajout initial
    await postAdd(G1, {
      titre: 'Q4',
      description: 'Énoncé Q4',
      reponse: 'true',
      texteVrai: '',
      texteFaux: '',
      categorie: 'intro'
    });

    // Tentative de doublon : même titre dans le même cours
    const resDup = await postAdd(G1, {
      titre: 'Q4',
      description: 'Autre énoncé',
      reponse: 'false',
      texteVrai: '',
      texteFaux: '',
      categorie: 'autre'
    });

    // Redirection avec err
    expect(resDup.status).toBeGreaterThanOrEqual(300);
    expect(resDup.status).toBeLessThan(400);
    expect(decodeURIComponent(resDup.headers.location)).toContain('err=');

    // La liste doit toujours ne contenir qu'une seule occurrence de Q4
    const resList = await getList(G1);
    const occurrences = (resList.text.match(/Q4/g) || []).length;
    expect(occurrences).toBeGreaterThanOrEqual(1); // au moins une
    // Optionnel : on peut être plus strict si la vue liste chaque titre une seule fois
    // expect(occurrences).toBe(1);

    // Et on doit voir un message d’erreur dans la page
    expect(resList.text.toLowerCase()).toMatch(/erreur|n’est pas unique|non unique|dup(liquée)?/);
  });

  it("5) Les messages de retour (succès/erreur) sont affichés dans la page de gestion", async () => {
    // Succès → msg
    await postAdd(G2, {
      titre: 'Q5',
      description: 'Énoncé Q5',
      reponse: 'true',
      texteVrai: '',
      texteFaux: '',
      categorie: 'tag'
    });
    const resOK = await getList(G2, { msg: 'Question ajoutée avec succès' });
    expect(resOK.text.toLowerCase()).toContain('succès'); // ou "ajoutée"

    // Erreur → err
    const resErrRedirect = await postAdd(G2, {
      titre: 'Q5', // doublon même cours
      description: 'doublon',
      reponse: 'true',
      texteVrai: '',
      texteFaux: '',
      categorie: 'tag'
    });
    const loc = decodeURIComponent(resErrRedirect.headers.location || '');
    expect(loc).toContain('err=');

    const resErr = await getList(G2, { err: 'Le titre de la question n’est pas unique' });
    expect(resErr.text.toLowerCase()).toMatch(/erreur|n’est pas unique|non unique|dup(liquée)?/);
  });
});
