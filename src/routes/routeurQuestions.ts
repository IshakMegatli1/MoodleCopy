// routes/routeurQuestions.ts
import { Router, Request, Response, NextFunction } from 'express';
import express from 'express';
import { Question } from '../core/question';
import { CoursGroupe } from '../core/coursGroupe';

// Stockage en mémoire par id de groupe (héritage de ta version actuelle)
const questionsParCours = new Map<string, Question[]>();

export class RouteurQuestions {
  private _router: Router;
  get router() { return this._router; }

  // ✅ AJOUT : garder une référence vers coursMap pour synchroniser
  constructor(private coursMap?: Map<string, CoursGroupe>) {
    this._router = Router();
    this.init();
  }

  // ✅ helper minimal pour avoir un CoursGroupe dans la map
  private ensureCours(group_id: string): CoursGroupe | undefined {
    if (!this.coursMap) return undefined;
    let cours = this.coursMap.get(group_id);
    if (!cours) {
      cours = new CoursGroupe(
        group_id, 'N/D', 'N/D', 'Cours', 'N/D', 'N/D', 'enseignant-nd'
      );
      this.coursMap.set(group_id, cours);
    }
    return cours;
  }

  private init() {
    this._router.get('/cours/:group_id/gestionQuestions', this.afficherListe.bind(this));
    this._router.get('/cours/:group_id/questions/add', this.afficherFormAjout.bind(this));
    this._router.post(
      '/cours/:group_id/questions/add',
      express.urlencoded({ extended: false }),
      this.traiterAjout.bind(this)
    );
    this._router.post(
      '/cours/:group_id/questions/delete',
      express.urlencoded({ extended: false }),
      this.traiterSuppression.bind(this)
    );
  }

  private afficherListe(req: Request, res: Response, _next: NextFunction) {
    const { group_id } = req.params;

    // ✅ si on a coursMap, on affiche ce qui est dans CoursGroupe (source unique)
    let questions: Question[];
    if (this.coursMap) {
      const cours = this.coursMap.get(group_id);
      questions = cours ? cours.getQuestions() : [];
    } else {
      questions = questionsParCours.get(group_id) || [];
    }

    const message = (req.query.msg as string) || undefined;
    const error = (req.query.err as string) || undefined;

    res.render('gestionQuestions', {
      user: req.session?.user ?? { isAnonymous: false },
      group_id,
      questions,
      message,
      error,
    });
  }

  private afficherFormAjout(req: Request, res: Response) {
    const { group_id } = req.params;
    res.render('ajouterQuestion', {
      user: req.session?.user ?? { isAnonymous: false },
      group_id,
    });
  }

  private traiterAjout(req: Request, res: Response) {
    const { group_id } = req.params;
    const titre = (req.body.titre || '').trim();
    const description = (req.body.description || '').trim();
    const reponseBool = String(req.body.reponse) === 'true';
    const texteVrai = (req.body.texteVrai || '').trim();
    const texteFaux = (req.body.texteFaux || '').trim();
    const categorie = (req.body.categorie || '').trim();

    if (!titre) {
      return res.redirect(`/cours/${encodeURIComponent(group_id)}/gestionQuestions?err=${encodeURIComponent('Le titre de la question est requis.')}`);
    }
    if (!description) {
      return res.redirect(`/cours/${encodeURIComponent(group_id)}/gestionQuestions?err=${encodeURIComponent('Un énoncé est requis pour la question.')}`);
    }

    // Unicité par titre (on vérifie dans la source qui sera affichée)
    let deja: boolean;
    if (this.coursMap) {
      const cours = this.coursMap.get(group_id);
      const existantes = cours ? cours.getQuestions() : [];
      deja = existantes.some(q => q.titre.trim().toLowerCase() === titre.toLowerCase());
    } else {
      const liste = questionsParCours.get(group_id) || [];
      deja = liste.some(q => q.titre.trim().toLowerCase() === titre.toLowerCase());
    }
    if (deja) {
      return res.redirect(`/cours/${encodeURIComponent(group_id)}/gestionQuestions?err=${encodeURIComponent('Le titre de la question n’est pas unique pour ce cours.')}`);
    }

    const question = new Question(
      titre,
      description,
      reponseBool,
      texteVrai,
      texteFaux,
      categorie,
      group_id
    );

    // ✅ 1) garder compatibilité avec ta Map historique
    const liste = questionsParCours.get(group_id) || [];
    liste.push(question);
    questionsParCours.set(group_id, liste);

    // ✅ 2) synchroniser dans CoursGroupe (la source utilisée par les Questionnaires)
    const cours = this.ensureCours(group_id);
    if (cours) {
      cours.addQuestion(question);
    }

    return res.redirect(`/cours/${encodeURIComponent(group_id)}/gestionQuestions?msg=${encodeURIComponent('Question ajoutée et associée à la banque du cours.')}`);
  }

  private traiterSuppression(req: Request, res: Response) {
    const { group_id } = req.params;
    const titre = (req.body.titre || '').trim();

    if (!titre) {
      return res.redirect(`/cours/${encodeURIComponent(group_id)}/gestionQuestions?err=${encodeURIComponent('Veuillez fournir le titre de la question à supprimer.')}`);
    }

    // Map historique
    const liste = questionsParCours.get(group_id) || [];
    const next = liste.filter(q => q.titre.trim().toLowerCase() !== titre.toLowerCase());
    questionsParCours.set(group_id, next);

    // ✅ Synchroniser aussi dans CoursGroupe si dispo
    if (this.coursMap) {
      const cours = this.coursMap.get(group_id);
      if (cours) {
        // ta classe n'a pas de removeQuestion, on contourne proprement :
        // soit on ajoute une méthode, soit on fait :
        (cours as any)._questions?.delete(titre);
      }
    }

    return res.redirect(`/cours/${encodeURIComponent(group_id)}/gestionQuestions?msg=${encodeURIComponent(`Question "${titre}" supprimée.`)}`);
  }
}
