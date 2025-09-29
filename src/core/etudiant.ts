export class Etudiant {
    private _id: string;
    private _nom: string;
    private _prenom: string;

    constructor(id: string, nom: string, prenom: string) {
        this._id = id;
        this._nom = nom;
        this._prenom = prenom;
    }

    get id() {
        return this._id;
    }

    get nom() {
        return this._nom;
    }

    get prenom() {
        return this._prenom;
    }
}