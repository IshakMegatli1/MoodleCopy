import { Enseignant } from './enseignant';
import { Etudiant } from './etudiant';

export class CoursGroupe {
	private _id: string;
	private _groupeId: string;
	private _titre: string;
	private _enseignant: Enseignant;
	private _listeEtudiants: Map<String, Etudiant>;

	constructor(id: string, groupeId: string, titre: string, enseignant: Enseignant, listeEtudiants?: Map<String, Etudiant>) {
		this._id = id;
		this._groupeId = groupeId;
		this._titre = titre;
		this._enseignant = enseignant;
		this._listeEtudiants = listeEtudiants || new Map<String, Etudiant>();
	}

	get id(): string {
		return this._id;
	}
	set id(value: string) {
		this._id = value;
	}

	get groupeId(): string {
		return this._groupeId;
	}
	set groupeId(value: string) {
		this._groupeId = value;
	}

	get titre(): string {
		return this._titre;
	}
	set titre(value: string) {
		this._titre = value;
	}

	get enseignant(): Enseignant {
		return this._enseignant;
	}
	set enseignant(value: Enseignant) {
		this._enseignant = value;
	}

	get listeEtudiants(): Map<String, Etudiant> {
		return this._listeEtudiants;
	}
	set listeEtudiants(value: Map<String, Etudiant>) {
		this._listeEtudiants = value;
	}

	ajouterEtudiant(etudiant: Etudiant) {
		this._listeEtudiants.set(etudiant.id, etudiant)
	}


}