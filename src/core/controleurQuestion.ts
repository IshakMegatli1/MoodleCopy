// src/core/controleurQuestion.ts
import { Question } from "../core/question";
import { CoursGroupe } from "../core/coursGroupe";

export class ControleurQuestion {
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

  // --- API publique ---

  /** Créer une question (doublon par titre dans le même groupe interdit). */
  public async ajouterQuestion(
    idGroupe: string,
    titre: string, // -> Question.titre
    description: string,      // -> Question.description
    reponse: boolean,    // -> Question.reponse
    texteVrai: string,
    texteFaux: string,
    categorie: string
  ) {
    const cours = this.getCoursOrThrow(idGroupe);

    if (cours.isQuestionDuplicated(titre)) {
      throw new Error("Une question avec ce nom existe déjà.");
    }

    const question = new Question(
      titre,
      description,
      reponse,
      texteVrai,
      texteFaux,
      categorie,
      idGroupe
    );

    cours.addQuestion(question);
    return question;
  }

  /** Récupérer une question par titre. */
  public recupererQuestion(idGroupe: string, titre: string) {
    const cours = this.getCoursOrThrow(idGroupe);
    const q = cours.getQuestion(titre);
    if (!q) throw new Error("Question introuvable.");
    return q;
  }

  /** Lister toutes les questions d’un groupe. */
  public async getQuestions(idGroupe: string) {
    const cours = this.getCoursOrThrow(idGroupe);
    return cours.getQuestions();
  }

  /** Modifier une question (peut changer le titre ; vérifie le doublon si le titre change). */
  public async modifierQuestion(
    nom: string,          // nouveau titre
    description: string,       // nouvelle description
    reponse: boolean,
    texteVrai: string,
    texteFaux: string,
    categorie: string,
    idGroupe: string,
    ancienNom: string
  ) {
    const cours = this.getCoursOrThrow(idGroupe);

    const existante = cours.getQuestion(ancienNom);
    if (!existante) throw new Error("Question introuvable.");

    const nouveauNom = nom.trim();
    if (nouveauNom !== ancienNom && cours.isQuestionDuplicated(nouveauNom)) {
      throw new Error("Erreur durant la modification. Il y a déjà une question avec ce nom.");
    }

    // Recréer l’objet pour respecter les validations du constructeur
    const maj = new Question(
      nouveauNom,
      description,
      reponse,
      texteVrai,
      texteFaux,
      categorie,
      idGroupe
    );

    // Mise à jour dans la Map interne du cours
    // ⚠️ Ta classe n’expose pas encore remove/replace → on fait un petit contournement.
    // Idéal: ajouter dans CoursGroupe: removeQuestion(titre) et replaceQuestion(ancienTitre, nouvelle).
    (cours as any)._questions?.delete(ancienNom);
    cours.addQuestion(maj);

    return maj;
  }

  public supprimerQuestion(idGroupe: string, titre: string) {
    const cours = this.getCoursOrThrow(idGroupe);
    const questionnaires = cours.getQuestionnaires?.() ?? [];
    const utilise = questionnaires.some(q =>
      (q.questions || []).some(qu => qu.titre === titre)
    );
    if (utilise) {
      throw new Error('Impossible de supprimer: utilisée dans un questionnaire.');
    }
    const ok = cours.supprimerQuestion(titre);
    if (!ok) throw new Error('Question introuvable.');
    return cours.getQuestions();
  }
}
