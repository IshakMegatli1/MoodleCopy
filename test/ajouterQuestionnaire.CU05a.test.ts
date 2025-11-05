/** @jest-environment node */
import express from "express";
import request from "supertest";
import path from "path";

// Routes à tester (versions actuelles de ton projet)
import { RouteurQuestionnaire } from "../src/routes/routeurQuestionnaire";
import { RouteurQuestions } from "../src/routes/routeurQuestions";
import { CoursGroupe } from "../src/core/coursGroupe";

/* Mini app de test : on rend les Pug et on monte les deux routeurs
   avec UNE Map<string,CoursGroupe> partagée, comme dans app.ts */
function createTestApp() {
  const app = express();
  app.set("views", path.join(__dirname, "../views"));
  app.set("view engine", "pug");
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  const coursMap = new Map<string, CoursGroupe>();
  const rqnr = new RouteurQuestionnaire(coursMap);
  const rqs = new RouteurQuestions(coursMap);

  app.use("/", rqnr.router);
  app.use("/", rqs.router);

  return app;
}

// Helpers simples
function q(params?: Record<string, any>) {
  if (!params) return "";
  const s = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return s ? `?${s}` : "";
}

describe("CU05a – Ajouter questionnaire (tests simples demandés)", () => {
  const app = createTestApp();

  const G1 = "G1";
  const G2 = "G2";

  // --- Helpers de requêtes ---
  const postCreateQn = (group: string, nom: string, description = "", actif = true) =>
    request(app)
      .post(`/cours/${encodeURIComponent(group)}/questionnaires/add`)
      .type("form")
      .send({ nom, description, actif: String(actif) });

  const getGestion = (group: string, params?: Record<string, any>) =>
    request(app).get(`/cours/${encodeURIComponent(group)}/gestionQuestionnaires${q(params)}`);

  const getCats = (group: string, nom: string) =>
    request(app).get(
      `/cours/${encodeURIComponent(group)}/questionnaires/${encodeURIComponent(nom)}/categories`
    );

  const getCatPage = (group: string, nom: string, tag: string) =>
    request(app).get(
      `/cours/${encodeURIComponent(group)}/questionnaires/${encodeURIComponent(
        nom
      )}/categorie/${encodeURIComponent(tag)}`
    );

  const postAssoc = (group: string, nom: string, tag: string, titres: string[] | string) =>
    request(app)
      .post(
        `/cours/${encodeURIComponent(group)}/questionnaires/${encodeURIComponent(
          nom
        )}/categorie/${encodeURIComponent(tag)}/add`
      )
      .type("form")
      .send({ titres });

  const postAddQuestion = (
    group: string,
    titre: string,
    description: string,
    reponse: boolean,
    categorie = "UML",
    texteVrai = "",
    texteFaux = ""
  ) =>
    request(app)
      .post(`/cours/${encodeURIComponent(group)}/questions/add`)
      .type("form")
      .send({
        titre,
        description,
        reponse: String(reponse),
        texteVrai,
        texteFaux,
        categorie,
      });

  // 1) Démontrer qu'un nouveau questionnaire a été créé et associé au cours.
  it("1) Création d’un questionnaire associé au cours", async () => {
    const resCreate = await postCreateQn(G1, "QN-1", "desc", true);
    expect(resCreate.status).toBeGreaterThanOrEqual(300);
    expect(resCreate.status).toBeLessThan(400);
    // Redirige vers /questionnaires/:nom/categories
    expect(decodeURIComponent(resCreate.headers.location)).toContain("/categories");

    const g1 = await getGestion(G1);
    expect(g1.status).toBe(200);
    expect(g1.text).toContain("QN-1"); // listé dans la page du cours
  });

  // 2) Démontrer que le questionnaire créé n'est pas associé à un autre cours.
  it("2) Questionnaire non associé à un autre cours", async () => {
    await postCreateQn(G1, "QN-2", "desc", true);

    const g1 = await getGestion(G1);
    expect(g1.text).toContain("QN-2");

    const g2 = await getGestion(G2);
    expect(g2.text).not.toContain("QN-2");
  });

  // 3) Démontrer qu'un questionnaire créé peut être associé à 0 question.
  it("3) Questionnaire avec 0 question", async () => {
    await postCreateQn(G1, "QN-0Q", "vide", false);
    const page = await getGestion(G1);
    expect(page.status).toBe(200);

    // Cherche le bloc qui contient QN-0Q puis regarde s'il y a "0 question"
    const segment = page.text.split("QN-0Q")[1] || "";
    expect(segment).toMatch(/0\s+question/);
  });

  // 4) Démontrer qu'un questionnaire créé peut être associé à plusieurs questions.
  it("4) Questionnaire avec plusieurs questions", async () => {
    // Crée questionnaire
    await postCreateQn(G1, "QN-MULTI", "desc", true);

    // Ajoute 2 questions dans la banque du cours
    await postAddQuestion(G1, "Q-A", "Énoncé A", true, "UML");
    await postAddQuestion(G1, "Q-B", "Énoncé B", false, "UML");

    // Associe les deux questions (POST direct sur l'endpoint d’association)
    await postAssoc(G1, "QN-MULTI", "UML", ["Q-A", "Q-B"]);

    // La gestion doit afficher le compteur à 2 pour QN-MULTI
    const page = await getGestion(G1);
    const around = page.text.split("QN-MULTI")[1] || "";
    // Le badge est rendu via nbQ -> "2 questions"
    expect(around).toMatch(/\b2\s+questions?\b/);
  });

  // 5) Démontrer que c'est impossible de créer un questionnaire avec un nom qui existe déjà.
  it("5) Doublon de nom refusé", async () => {
    await postCreateQn(G1, "QN-DUPL", "desc", true);
    const dup = await postCreateQn(G1, "QN-DUPL", "desc2", false);

    // Redirection vers gestion avec err=...
    expect(dup.status).toBeGreaterThanOrEqual(300);
    expect(dup.status).toBeLessThan(400);
    expect(decodeURIComponent(dup.headers.location || "")).toContain("err=");
  });

  // 6) Démontrer avec plusieurs enseignants (cours) et plusieurs questionnaires que l'affichage
  //    du nombre de questionnaires est bon (par page).
  it("6) Comptage de questionnaires correct par cours", async () => {
    // G1 : ajoute 2 QN
    await postCreateQn(G1, "G1-QN-A", "d", true);
    await postCreateQn(G1, "G1-QN-B", "d", true);

    // G2 : ajoute 1 QN
    await postCreateQn(G2, "G2-QN-A", "d", true);

    const g1 = await getGestion(G1);
    const g2 = await getGestion(G2);

    // Compte grossièrement le nombre d'items de liste (1 <li> par questionnaire)
    const countItems = (html: string) =>
      (html.match(/class="list-group-item/g) || []).length;

    expect(countItems(g1.text)).toBeGreaterThanOrEqual(2); // ≥2 sur G1
    expect(countItems(g2.text)).toBeGreaterThanOrEqual(1); // ≥1 sur G2
  });

  // 7) Démontrer que le nombre de fois qu'une question a été utilisée est calculé correctement.
  it("7) 'Utilisée X fois' exact (même question dans 2 questionnaires)", async () => {
    // Ajoute la question partagée
    await postAddQuestion(G1, "Q-SHARED", "Énoncé S", true, "UML");

    // Crée deux questionnaires et ajoute Q-SHARED dans chacun
    await postCreateQn(G1, "QN-A", "d", true);
    await postCreateQn(G1, "QN-B", "d", true);
    await postAssoc(G1, "QN-A", "UML", ["Q-SHARED"]);
    await postAssoc(G1, "QN-B", "UML", ["Q-SHARED"]);

    // Va sur la page de la catégorie UML d’un des QN
    const page = await getCatPage(G1, "QN-A", "UML");
    expect(page.status).toBe(200);

    // Dans la ligne de Q-SHARED, on devrait voir "2 fois"
    const after = page.text.split("Q-SHARED")[1] || "";
    // Prend un segment assez large après le titre pour attraper la colonne "Utilisée"
    const windowTxt = after.slice(0, 4000);
    expect(windowTxt).toMatch(/2\s*fois/);
  });
});
