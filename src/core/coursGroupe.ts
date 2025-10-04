import { Enseignant } from './enseignant';
import { Etudiant } from './etudiant';

export class CoursGroupe {
	private _group_id: string;
	private _day: string;
	private _hours: string;
	private _activity: string;
	private _mode: string;
	private _local: string;
	private _teacher_id: string;
	private _listeEtudiants: Map<String, Etudiant>;

	constructor(
		group_id: string,
		day: string,
		hours: string,
		activity: string,
		mode: string,
		local: string,
		teacher_id: string,
		listeEtudiants?: Map<String, Etudiant>
	) {
		this._group_id = group_id;
		this._day = day;
		this._hours = hours;
		this._activity = activity;
		this._mode = mode;
		this._local = local;
		this._teacher_id = teacher_id;
		this._listeEtudiants = listeEtudiants || new Map<String, Etudiant>();
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
	set listeEtudiants(value: Map<String, Etudiant>) {
		this._listeEtudiants = value;
	}

	ajouterEtudiant(etudiant: Etudiant) {
		this._listeEtudiants.set(etudiant.id, etudiant)
	}
}