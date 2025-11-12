export class Devoir {
  private _titre: string;
  private _description: string;
  private _noteMax: number;
  private _dateDebut: Date;
  private _dateFin: Date;
  private _etat: boolean;
  private _groupId: string;

  constructor(
    titre: string,
    description: string,
    noteMax: number,
    dateDebut: Date,
    dateFin: Date,
    etat: boolean,
    groupId: string
  ) {
    this._titre = titre;
    this._description = description;
    this._noteMax = noteMax;
    this._dateDebut = dateDebut;
    this._dateFin = dateFin;
    this._etat = etat;
    this._groupId = groupId;
  }

  // ----- Getters -----
  get titre(): string {
    return this._titre;
  }

  get description(): string {
    return this._description;
  }

  get noteMax(): number {
    return this._noteMax;
  }

  get dateDebut(): Date {
    return this._dateDebut;
  }

  get dateFin(): Date {
    return this._dateFin;
  }

  get etat(): boolean {
    return this._etat;
  }

  get groupId(): string {
    return this._groupId;
  }

  // ----- Setters -----
  set titre(value: string) {
    this._titre = value;
  }

  set description(value: string) {
    this._description = value;
  }

  set noteMax(value: number) {
    this._noteMax = value;
  }

  set dateDebut(value: Date) {
    this._dateDebut = value;
  }

  set dateFin(value: Date) {
    this._dateFin = value;
  }

  set etat(value: boolean) {
    this._etat = value;
  }

  set groupId(value: string) {
    this._groupId = value;
  }

  // ----- Méthodes utilitaires -----

  /** 
   * Vérifie si le devoir est actif en fonction de la date actuelle.
   */
  estActif(): boolean {
    const maintenant = new Date();
    return this._etat && maintenant >= this._dateDebut && maintenant <= this._dateFin;
  }

  /** 
   * Retourne une représentation lisible du devoir (utile pour debug ou affichage).
   */
  toString(): string {
    return `${this._titre} (${this._noteMax} pts) — du ${this._dateDebut.toLocaleDateString()} au ${this._dateFin.toLocaleDateString()}`;
  }
}
