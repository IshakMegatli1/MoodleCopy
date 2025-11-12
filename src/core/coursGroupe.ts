import { De } from './de';
import { Enseignant } from './enseignant';
import { Etudiant } from './etudiant';
import { Question } from './question';
import { Questionnaire } from './questionnaire';
import { Devoir } from './devoir';

export class CoursGroupe {
	private _group_id: string;
	private _day: string;
	private _hours: string;
	private _activity: string;
	private _mode: string;
	private _local: string;
	private _teacher_id: string;
	private _listeEtudiants: Map<string, Etudiant>;
	private _questions: Map<string, Question>;
	private _questionnaires: Map<string, Questionnaire>;
	private _devoirs: Map<string, Devoir>;

	constructor(
		group_id: string,
		day: string,
		hours: string,
		activity: string,
		mode: string,
		local: string,
		teacher_id: string,
		listeEtudiants?: Map<string, Etudiant>,
		questions?: Map<string, Question>,
		questionnaires?: Map<string, Questionnaire>,
		devoirs?: Map<string, Devoir>
	) {
		this._group_id = group_id;
		this._day = day;
		this._hours = hours;
		this._activity = activity;
		this._mode = mode;
		this._local = local;
		this._teacher_id = teacher_id;
		this._listeEtudiants = listeEtudiants || new Map<string, Etudiant>();
		this._questions = questions || new Map<string, Question>();
		this._questionnaires = questionnaires || new Map<string, Questionnaire>();
		this._devoirs = devoirs || new Map<string, Devoir>();
	}

	get group_id(): string {
		return this._group_id;
	}
	set group_id(value: string) {
		this._group_id = value;
	}

	get day(): string {
		return this._day;
	}
	set day(value: string) {
		this._day = value;
	}

	get hours(): string {
		return this._hours;
	}
	set hours(value: string) {
		this._hours = value;
	}

	get activity(): string {
		return this._activity;
	}
	set activity(value: string) {
		this._activity = value;
	}

	get mode(): string {
		return this._mode;
	}
	set mode(value: string) {
		this._mode = value;
	}

	get local(): string {
		return this._local;
	}
	set local(value: string) {
		this._local = value;
	}

	get teacher_id(): string {
		return this._teacher_id;
	}
	set teacher_id(value: string) {
		this._teacher_id = value;
	}

	get listeEtudiants(): Map<String, Etudiant> {
		return this._listeEtudiants;
	}
	set listeEtudiants(value: Map<string, Etudiant>) {
		this._listeEtudiants = value;
	}

	ajouterEtudiant(etudiant: Etudiant) {
		this._listeEtudiants.set(etudiant.id, etudiant)
	}


	// Méthodes pour les questions
	public getQuestions(): Array<Question> {
        return Array.from(this._questions.values());
    }

    public getQuestion(titre: string): Question {
        console.log("questions", this._questions);
        return this._questions.get(titre);
    }

    public addQuestion(question: Question): void {
        this._questions.set(question.titre, question);
    }

    public isQuestionDuplicated(titre: string): boolean {
        return this._questions.get(titre) !== undefined;
    }

	//Méthodes pour les questionnaires

	public getQuestionnaires(): Array<Questionnaire> {
        return Array.from(this._questionnaires.values());
    }
    public getQuestionnaire(nom: string): Questionnaire {
        return this._questionnaires.get(nom);
    }

    public addQuestionnaire(questionnaire){
        this._questionnaires.set(questionnaire.nom, questionnaire)
    }

    public isQuestionnaireDuplicated(nom: string): boolean {
        return this._questionnaires.get(nom) !== undefined;
    }

    public supprimerQuestionnaire(nom: string): boolean {
        return this._questionnaires.delete(nom);
    }

	//Méthodes pour les devoirs

	public getDevoirs(): Array<Devoir> {
		return Array.from(this._devoirs.values());
	}
	public getDevoir(titre: string): Devoir {
		return this._devoirs.get(titre);
	}

	public addDevoir(devoir: Devoir): void {
		this._devoirs.set(devoir.titre, devoir);
	}

	public isDevoirDuplicated(titre: string): boolean {
		return this._devoirs.get(titre) !== undefined;
	}	
}