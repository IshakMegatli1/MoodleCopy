import { CoursGroupe } from './coursGroupe';

export class Enseignant {
  private _prenom: string 
  private _nom: string
  private _id: string
  private _token: string
  private _listeCours: Map<String, CoursGroupe>

  constructor(prenom: string, nom: string, id: string, token: string, listeCours: Map<String, CoursGroupe>) {
    this._prenom = prenom
    this._nom = nom
    this._id = id
    this._token = token
    this._listeCours = new Map<String, CoursGroupe>()
  }

  get prenom(): string {
    return this._prenom;
  }
  set prenom(value: string) {
    this._prenom = value;
  }

  get nom(): string {
    return this._nom;
  }
  set nom(value: string) {
    this._nom = value;
  }

  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value;
  }

  get token(): string {
    return this._token;
  }
  set token(value: string) {
    this._token = value;
  }

  get listeCours(): Map<String, CoursGroupe> {
    return this._listeCours;
  }
  set listeCours(value: Map<String, CoursGroupe>) {
    this._listeCours = value;
  }


}