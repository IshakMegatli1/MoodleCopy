// src/core/controleurQuestionnaire.ts
import { Questionnaire } from "../core/questionnaire";
import { Question } from "../core/question";
import { CoursGroupe } from "../core/coursGroupe";

export class ControleurQuestionnaire {
  // Map<idGroupe, CoursGroupe>
  private _coursMap: Map<string, CoursGroupe>;

  constructor(coursMap: Map<string, CoursGroupe>) {
    this._coursMap = coursMap;
  }

  // -- Helpers --
  private getCoursOrThrow(idGroupe: string): CoursGroupe {
    const cours = this._coursMap.get(idGroupe);
    if (!cours) throw new Error("Cours introuvable.");
    return cours;
  }

  private getQuestionnaireOrThrow(cours: CoursGroupe, nom: string): Questionnaire {
    const qn = cours.getQuestionnaire(nom);
    if (!qn) throw new Error("Questionnaire introuvable.");
    return qn;
  }

  // --- API publique ---

  /** Lister tous les questionnaires d’un groupe. */
  public getQuestionnaires(idGroupe: string): Questionnaire[] {
    const cours = this.getCoursOrThrow(idGroupe);
    return cours.getQuestionnaires();
  }

  /** Créer un questionnaire (doublon de nom interdit dans le même cours). */
  public creerQuestionnaire(
    idGroupe: string,
    nom: string,
    description: string,
    actif: boolean
  ): Questionnaire {
    const cours = this.getCoursOrThrow(idGroupe);
    if (cours.isQuestionnaireDuplicated(nom)) {
      throw new Error("Un questionnaire avec ce nom existe déjà.");
    }
    const qn = new Questionnaire(nom, description, actif, idGroupe);
    cours.addQuestionnaire(qn);
    return qn;
  }

  /** Récupérer un questionnaire par nom. */
  public recupererQuestionnaire(idGroupe: string, nom: string): Questionnaire {
    const cours = this.getCoursOrThrow(idGroupe);
    return this.getQuestionnaireOrThrow(cours, nom);
  }

  /**
   * Associer une ou plusieurs questions existantes au questionnaire (par titres).
   * Ex: titres = ["Q1","Q2"].
   */
  // public associerQuestionsAuQuestionnaire(
  //   idGroupe: string,
  //   nom: string,
  //   titres: string[]
  // ): Questionnaire {
  //   const cours = this.getCoursOrThrow(idGroupe);
  //   const qn = this.getQuestionnaireOrThrow(cours, nom);

  //   const toutes = cours.getQuestions(); // même source que ton ControleurQuestion
  //   const normalise = (s: string) => (s || "").trim().toLowerCase();
  //   const titresSet = new Set((titres || []).map(normalise));

  //   const aAssocier: Question[] = toutes.filter(q => titresSet.has(normalise(q.titre)));

  //   // Ta classe Questionnaire n'a pas ajouterQuestions => on boucle
  //   aAssocier.forEach(q => qn.ajouterQuestion(q));
  //   return qn;
  // }


  associerQuestionsAuQuestionnaire(idGroupe: string, nom: string, titres: string[]) {
    const cours = this.getCoursOrThrow(idGroupe);
    const qn = this.recupererQuestionnaire(idGroupe, nom);

    const byTitle = new Map<string, Question>();
    for (const q of cours.getQuestions()) {
      byTitle.set(q.titre.trim().toLowerCase(), q);
    }

    let added = 0;
    for (const t of titres) {
      const key = String(t || "").trim().toLowerCase();
      const found = byTitle.get(key);
      if (found) {
        const before = qn.getNombreQuestions();
        qn.ajouterQuestion(found);
        if (qn.getNombreQuestions() > before) added++;
      }
    }
    return { questionnaire: qn, added };
  }


  /**
   * Lister les questions d’un tag + compteur "nombre de questionnaires" (dans le même cours).
   * Sert à afficher "utilisée X fois".
   */
  public questionsParTagAvecCompteur(
    idGroupe: string,
    tag: string
  ): { question: Question; nbUtilisations: number }[] {
    const cours = this.getCoursOrThrow(idGroupe);
    const tagNorm = (tag || "").trim().toLowerCase();
    const toutes = cours.getQuestions();
    const filtrées = !tagNorm
      ? toutes
      : toutes.filter(q => (q.categorie || "").trim().toLowerCase() === tagNorm);

    const questionnaires = cours.getQuestionnaires();
    const compter = (question: Question) =>
      questionnaires.reduce((acc, qn) => acc + (qn.getQuestions().includes(question) ? 1 : 0), 0);

    return filtrées.map(q => ({ question: q, nbUtilisations: compter(q) }));
  }
}
