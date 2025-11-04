// routes/routeurQuestionnaire.ts
import { Router, Request, Response } from "express";
import express from "express";
import { CoursGroupe } from "../core/coursGroupe";
import { ControleurQuestionnaire } from "../core/controleurQuestionnaire";
// routes/routeurQuestionnaire.ts
import { seedQuestionsIfEmpty } from "../core/seedQuestions"; // 👈 import

export class RouteurQuestionnaire {
  private _router: Router;
  get router() { return this._router; }

  private ctl: ControleurQuestionnaire;

  constructor(private coursMap: Map<string, CoursGroupe>) {
    this._router = Router();
    this.ctl = new ControleurQuestionnaire(this.coursMap);
    this.init();
  }

  // ✅ Crée un cours minimal si inexistant (évite “Cours introuvable.”)
  private ensureCours(group_id: string): CoursGroupe {
    let cours = this.coursMap.get(group_id);
    if (!cours) {
      cours = new CoursGroupe(
        group_id,
        "N/D",
        "N/D",
        "Cours",
        "N/D",
        "N/D",
        "enseignant-nd"
      );
      this.coursMap.set(group_id, cours);
    }

    // 👇 Ajoute des questions démo si le cours est vide
    seedQuestionsIfEmpty(cours);

    return cours;
  }

  private init() {
    // 1) Gestion (liste des questionnaires)
    this._router.get(
      "/cours/:group_id/gestionQuestionnaires",
      this.afficherGestion.bind(this)
    );

    // 2) Formulaire de création
    this._router.get(
      "/cours/:group_id/questionnaires/add",
      this.afficherFormAjout.bind(this)
    );

    // 3) Traitement création → redirige vers la page des catégories
    this._router.post(
      "/cours/:group_id/questionnaires/add",
      express.urlencoded({ extended: false }),
      this.traiterAjout.bind(this)
    );

    // 4) Page qui liste les catégories de questions pour ce cours
    this._router.get(
      "/cours/:group_id/questionnaires/:nom/categories",
      this.afficherCategories.bind(this)
    );

    // 5) Page qui liste les questions d'une catégorie + compteur "utilisée X fois"
    this._router.get(
      "/cours/:group_id/questionnaires/:nom/categorie/:tag",
      this.afficherQuestionsDansCategorie.bind(this)
    );

    // 6) Traitement d'association des questions sélectionnées (depuis la page 5)
    //    → après sauvegarde, on revient à la gestion des questionnaires
    this._router.post(
      "/cours/:group_id/questionnaires/:nom/categorie/:tag/add",
      express.urlencoded({ extended: false }),
      this.traiterAjoutQuestionsDansCategorie.bind(this)
    );
  }

  // ------------------- Handlers -------------------

  // GET /cours/:group_id/gestionQuestionnaires
  private afficherGestion(req: Request, res: Response) {
    const { group_id } = req.params;
    const msg = (req.query.msg as string) || undefined;
    const err = (req.query.err as string) || undefined;

    try {
      this.ensureCours(group_id); // ✅ important
      const questionnaires = this.ctl.getQuestionnaires(group_id);
      res.render("gestionQuestionnaires", {
        user: req.session?.user ?? { isAnonymous: false },
        group_id,
        questionnaires, // [{ nom, description, actif, getNombreQuestions(), ... }]
        message: msg,
        error: err,
      });
    } catch (e: any) {
      res.status(404).render("gestionQuestionnaires", {
        user: req.session?.user ?? { isAnonymous: false },
        group_id,
        questionnaires: [],
        message: undefined,
        error: e?.message || "Cours introuvable.",
      });
    }
  }

  // GET /cours/:group_id/questionnaires/add
  private afficherFormAjout(req: Request, res: Response) {
    const { group_id } = req.params;
    // Pas de lecture domaine ici, mais on peut pré-créer le cours pour la suite du flow
    this.ensureCours(group_id); // ✅ optionnel mais pratique
    res.render("ajouterQuestionnaire", {
      user: req.session?.user ?? { isAnonymous: false },
      group_id,
    });
  }

  // POST /cours/:group_id/questionnaires/add
  // → succès: redirige vers /cours/:group_id/questionnaires/:nom/categories
  private traiterAjout(req: Request, res: Response) {
    const { group_id } = req.params;
    const nom = String(req.body.nom || "").trim();
    const description = String(req.body.description || "").trim();
    const actif = String(req.body.actif) === 'true';

    if (!nom) {
      return res.redirect(
        `/cours/${encodeURIComponent(group_id)}/gestionQuestionnaires?err=${encodeURIComponent(
          "Le nom du questionnaire est requis."
        )}`
      );
    }

    try {
      this.ensureCours(group_id); // ✅ important
      this.ctl.creerQuestionnaire(group_id, nom, description, actif);
      return res.redirect(
        `/cours/${encodeURIComponent(group_id)}/questionnaires/${encodeURIComponent(nom)}/categories`
      );
    } catch (e: any) {
      return res.redirect(
        `/cours/${encodeURIComponent(group_id)}/gestionQuestionnaires?err=${encodeURIComponent(
          e?.message || "Erreur lors de la création."
        )}`
      );
    }
  }

  // GET /cours/:group_id/questionnaires/:nom/categories
  // Affiche la liste des catégories disponibles dans le cours (dérivées des questions du cours)
  private afficherCategories(req: Request, res: Response) {
    const { group_id, nom } = req.params;

    try {
      this.ensureCours(group_id); // ✅ important
      // Valide que le questionnaire existe
      this.ctl.recupererQuestionnaire(group_id, nom);

      // Récupère toutes les questions du cours et calcule les catégories
      const cours = this.ensureCours(group_id); // (au cas où)
      const questions = cours.getQuestions();

      const categoriesMap = new Map<string, number>(); // cat -> nbQuestions
      for (const q of questions) {
        const cat = (q.categorie || "").trim() || "(sans catégorie)";
        categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1);
      }
      const categories = Array.from(categoriesMap.entries()).map(([categorie, nb]) => ({ categorie, nb }));

      res.render("categoriesDeQuestions", {
        user: req.session?.user ?? { isAnonymous: false },
        group_id,
        nomQuestionnaire: nom,
        categories, // [{ categorie, nb }]
      });
    } catch (e: any) {
      res.status(400).render("categoriesDeQuestions", {
        user: req.session?.user ?? { isAnonymous: false },
        group_id,
        nomQuestionnaire: nom,
        categories: [],
        error: e?.message || "Erreur.",
      });
    }
  }

  // GET /cours/:group_id/questionnaires/:nom/categorie/:tag
  // Affiche les questions de la catégorie + compteur "utilisée X fois"
  private afficherQuestionsDansCategorie(req: Request, res: Response) {
    const { group_id, nom, tag } = req.params;

    try {
      this.ensureCours(group_id);
      this.ctl.recupererQuestionnaire(group_id, nom);

      const lignes = this.ctl
        .questionsParTagAvecCompteur(group_id, tag === "(sans catégorie)" ? "" : tag)
        .map(({ question, nbUtilisations }) => ({
          titre: question.titre,
          categorie: question.categorie || "",
          nbUtilisations,
        }));

      // 👇 NEW: récupérer msg/err de l’URL après redirect
      const message = (req.query.msg as string) || undefined;
      const error = (req.query.err as string) || undefined;

      res.render("ajoutDeQuestionsAuQuestionnaire", {
        user: req.session?.user ?? { isAnonymous: false },
        group_id,
        nomQuestionnaire: nom,
        tag,
        lignes,
        message,   // 👈
        error,     // 👈
      });
    } catch (e: any) {
      res.status(400).render("ajoutDeQuestionsAuQuestionnaire", {
        user: req.session?.user ?? { isAnonymous: false },
        group_id,
        nomQuestionnaire: nom,
        tag,
        lignes: [],
        error: e?.message || "Erreur.",
      });
    }
  }


  private traiterAjoutQuestionsDansCategorie(req: Request, res: Response) {
    const { group_id, nom, tag } = req.params;

    // 🔑 Supporte l’ancien nom ET ton nom récent en fallback
    const raw = req.body.questionsIds ?? req.body.titres;
    const titres: string[] = Array.isArray(raw)
      ? raw.map((s: string) => s.trim()).filter(Boolean)
      : [String(raw || "").trim()].filter(Boolean);

    if (!titres.length) {
      return res.redirect(
        `/cours/${encodeURIComponent(group_id)}/questionnaires/${encodeURIComponent(nom)}/categorie/${encodeURIComponent(tag)}?err=${encodeURIComponent(
          "Aucune question sélectionnée."
        )}`
      );
    }

    try {
      this.ensureCours(group_id);
      const { added } = this.ctl.associerQuestionsAuQuestionnaire(group_id, nom, titres);

      const msg = added > 0
        ? `${added} question${added > 1 ? 's' : ''} ajoutée${added > 1 ? 's' : ''} au questionnaire.`
        : `Aucune nouvelle question ajoutée (doublons ou non trouvées).`;

      return res.redirect(
        `/cours/${encodeURIComponent(group_id)}/gestionQuestionnaires?msg=${encodeURIComponent(msg)}`
      );
    } catch (e: any) {
      return res.redirect(
        `/cours/${encodeURIComponent(group_id)}/questionnaires/${encodeURIComponent(nom)}/categorie/${encodeURIComponent(tag)}?err=${encodeURIComponent(
          e?.message || "Erreur lors de l’association."
        )}`
      );
    }
  }


}
