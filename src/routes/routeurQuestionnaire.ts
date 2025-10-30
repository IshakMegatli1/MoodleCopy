// routes/routeurQuestionnaire.ts
import { Router, Request, Response } from "express";
import express from "express";
import { CoursGroupe } from "../core/coursGroupe";
import { ControleurQuestionnaire } from "../core/controleurQuestionnaire";

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
        "N/D",      // day
        "N/D",      // hours
        "Cours",    // activity
        "N/D",      // mode
        "N/D",      // local
        "enseignant-nd" // teacher_id dummy
      );
      this.coursMap.set(group_id, cours);
    }
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
      this.ensureCours(group_id); // ✅ important
      // Vérifie que le questionnaire existe
      this.ctl.recupererQuestionnaire(group_id, nom);

      const lignes = this.ctl
        .questionsParTagAvecCompteur(group_id, tag === "(sans catégorie)" ? "" : tag)
        .map(({ question, nbUtilisations }) => ({
          titre: question.titre,
          categorie: question.categorie || "",
          nbUtilisations,
        }));

      res.render("ajoutDeQuestionsAuQuestionnaire", {
        user: req.session?.user ?? { isAnonymous: false },
        group_id,
        nomQuestionnaire: nom,
        tag,
        lignes, // [{ titre, categorie, nbUtilisations }]
        // La vue pourra générer un <form> POST vers .../:tag/add avec des checkboxes name="titres"
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

  // POST /cours/:group_id/questionnaires/:nom/categorie/:tag/add
  // Associe les questions sélectionnées et retourne à la gestion
  // private traiterAjoutQuestionsDansCategorie(req: Request, res: Response) {
  //   const { group_id, nom, tag } = req.params;

  //   // name="titres" peut être un tableau (checkboxes) ou une chaîne CSV
  //   const titres: string[] = Array.isArray(req.body.titres)
  //     ? (req.body.titres as string[])
  //     : String(req.body.titres || "")
  //         .split(",")
  //         .map(s => s.trim())
  //         .filter(Boolean);

  //   if (!titres.length) {
  //     return res.redirect(
  //       `/cours/${encodeURIComponent(group_id)}/questionnaires/${encodeURIComponent(nom)}/categorie/${encodeURIComponent(tag)}?err=${encodeURIComponent(
  //         "Aucune question sélectionnée."
  //       )}`
  //     );
  //   }

  //   try {
  //     this.ensureCours(group_id); // ✅ important
  //     this.ctl.associerQuestionsAuQuestionnaire(group_id, nom, titres);

  //     // Comportement demandé: retour à la page de gestion des questionnaires
  //     return res.redirect(
  //       `/cours/${encodeURIComponent(group_id)}/gestionQuestionnaires?msg=${encodeURIComponent(
  //         "Questionnaire sauvegardé."
  //       )}`
  //     );
  //   } catch (e: any) {
  //     return res.redirect(
  //       `/cours/${encodeURIComponent(group_id)}/questionnaires/${encodeURIComponent(nom)}/categorie/${encodeURIComponent(tag)}?err=${encodeURIComponent(
  //         e?.message || "Erreur lors de l’association."
  //       )}`
  //     );
  //   }
  // }


  private traiterAjoutQuestionsDansCategorie(req: Request, res: Response) {
    const { group_id, nom, tag } = req.params;

    // Toujours récupérer un tableau (grâce à name="titres[]", ce sera déjà un array)
    const titresRaw = req.body.titres;
    const titres: string[] = Array.isArray(titresRaw)
      ? titresRaw.map((s: string) => s.trim()).filter(Boolean)
      : String(titresRaw || "").split(",").map(s => s.trim()).filter(Boolean);

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

      // Toujours retourner à la gestion, même si certaines n'ont pas matché
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
