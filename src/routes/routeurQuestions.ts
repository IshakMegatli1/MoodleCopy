// routes/routeurQuestions.ts
import { Router, Request, Response, NextFunction } from 'express';
import express from 'express';
import { Question } from '../core/question'; // <-- ajuste ce chemin si besoin

// Stockage en mémoire par id de groupe (à remplacer par SGB plus tard)
const questionsParCours = new Map<string, Question[]>();

export class RouteurQuestions {
  private _router: Router;
  get router() { return this._router; }

  constructor() {
    this._router = Router();
    this.init();
  }

  private init() {
    // Liste
    this._router.get(
      '/cours/:group_id/gestionQuestions',
      this.afficherListe.bind(this)
    );

    // Formulaire d’ajout
    this._router.get(
      '/cours/:group_id/questions/add',
      this.afficherFormAjout.bind(this)
    );

    // Traitement d’ajout (x-www-form-urlencoded)
    this._router.post(
      '/cours/:group_id/questions/add',
      express.urlencoded({ extended: false }),
      this.traiterAjout.bind(this)
    );

    // Suppression par titre
    this._router.post(
      '/cours/:group_id/questions/delete',
      express.urlencoded({ extended: false }),
      this.traiterSuppression.bind(this)
    );
  }

  // GET /cours/:group_id/gestionQuestions
  private afficherListe(req: Request, res: Response, _next: NextFunction) {
    const { group_id } = req.params;
    const questions = questionsParCours.get(group_id) || [];
    const message = (req.query.msg as string) || undefined;
    const error = (req.query.err as string) || undefined;

    res.render('gestionQuestions', {
      user: req.session?.user ?? { isAnonymous: false },
      group_id,
      questions,   // ← objets Question (avec .titre, .description, .reponse, etc.)
      message,
      error,
    });
  }

  // GET /cours/:group_id/questions/add
  private afficherFormAjout(req: Request, res: Response) {
    const { group_id } = req.params;
    res.render('ajouterQuestion', {
      user: req.session?.user ?? { isAnonymous: false },
      group_id,
    });
  }

  // POST /cours/:group_id/questions/add
  private traiterAjout(req: Request, res: Response) {
    const { group_id } = req.params;
    // Champs attendus par TA CLASSE:
    // titre, description, reponse (string 'true'|'false' -> boolean), texteVrai, texteFaux, categorie
    const titre = (req.body.titre || '').trim();
    const description = (req.body.description || '').trim();
    const reponseBool = String(req.body.reponse) === 'true';
    const texteVrai = (req.body.texteVrai || '').trim();
    const texteFaux = (req.body.texteFaux || '').trim();
    const categorie = (req.body.categorie || '').trim();

    // Validations alignées avec le constructeur
    if (!titre) {
      return res.redirect(`/cours/${encodeURIComponent(group_id)}/gestionQuestions?err=${encodeURIComponent('Le titre de la question est requis.')}`);
    }
    if (!description) {
      return res.redirect(`/cours/${encodeURIComponent(group_id)}/gestionQuestions?err=${encodeURIComponent('Un énoncé est requis pour la question.')}`);
    }

    const liste = questionsParCours.get(group_id) || [];

    // Unicité par TITRE dans CE cours (extension 4b)
    if (liste.some(q => q.titre.trim().toLowerCase() === titre.toLowerCase())) {
      return res.redirect(`/cours/${encodeURIComponent(group_id)}/gestionQuestions?err=${encodeURIComponent('Le titre de la question n’est pas unique pour ce cours.')}`);
    }

    // Création via ton constructeur (gère aussi valeurs par défaut des textes)
    const question = new Question(
      titre,
      description,
      reponseBool,
      texteVrai,          // si vide, ton constructeur mettra "la réponse est correcte!"
      texteFaux,          // si vide, ton constructeur mettra "la réponse est fausse!"
      categorie,
      group_id            // idGroupe
    );

    liste.push(question);
    questionsParCours.set(group_id, liste);

    return res.redirect(`/cours/${encodeURIComponent(group_id)}/gestionQuestions?msg=${encodeURIComponent('Question ajoutée et associée à la banque du cours.')}`);
  }

  // POST /cours/:group_id/questions/delete
  private traiterSuppression(req: Request, res: Response) {
    const { group_id } = req.params;
    const titre = (req.body.titre || '').trim();

    if (!titre) {
      return res.redirect(`/cours/${encodeURIComponent(group_id)}/gestionQuestions?err=${encodeURIComponent('Veuillez fournir le titre de la question à supprimer.')}`);
    }

    const liste = questionsParCours.get(group_id) || [];
    const next = liste.filter(q => q.titre.trim().toLowerCase() !== titre.toLowerCase());
    questionsParCours.set(group_id, next);

    return res.redirect(`/cours/${encodeURIComponent(group_id)}/gestionQuestions?msg=${encodeURIComponent(`Question "${titre}" supprimée.`)}`);
  }
}
