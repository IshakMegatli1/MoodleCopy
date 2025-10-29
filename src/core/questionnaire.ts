import { Question } from "./question";

export class Questionnaire {
    nom: string;
    description: string;
    actif: boolean;
    questions: Question[];
    _aCommence: boolean;
    idCours: string;

    constructor(
        nom: string,
        description: string,
        actif: boolean,
        idCours: string
    ) {
        if (!nom || nom.trim() === "") {
            throw new Error("Le nom du questionnaire est requis.");
        }

        if (!description || description.trim() === "") {
            this.description = "Sans description.";
        } else {
            this.description = description;
        }

        this.nom = nom;
        this.actif = actif;
        this.idCours = idCours;
        this.questions = [];
    }

    public getNomQuestionnaire(): string {
        return this.nom;
    }

    public getDescription(): string {
        return this.description;
    }

    public getActif(): boolean {
        return this.actif;
    }

    public getIdCours(): string {
        return this.idCours;
    }

    public getQuestions(): Question[] {
        return this.questions;
    }

    public ajouterQuestion(question: Question): void {
        if (!question.estAssocie(this)) {
            this.questions.push(question);
            question.associerQuestionnaire(this);
        }
    }

    public retirerQuestion(titre: string): void {
        this.questions = this.questions.filter(q => q.titre !== titre);
    }

    public estVide(): boolean {
        return this.questions.length === 0;
    }

    public getNombreQuestions(): number {
        return this.questions.length;
    }

    public supprimerQuestions() {
        this.questions.forEach(question => {
            question.dissocierQuestionnaire(this);
        });
        this.questions = new Array();
    }
}
