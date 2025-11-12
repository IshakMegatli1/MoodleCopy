// src/core/controleurDevoir.ts
import { Devoir } from "../core/devoir";
import { CoursGroupe } from "../core/coursGroupe";

export class ControleurDevoir {
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

  /** Vérifie si un titre de devoir est déjà utilisé dans le groupe. */
  private isDevoirDuplicated(cours: CoursGroupe, titre: string): boolean {
    const t = (titre || "").trim().toLowerCase();
    // Préférence: méthode dédiée côté CoursGroupe
    if (typeof (cours as any).isDevoirDuplicated === "function") {
      return (cours as any).isDevoirDuplicated(titre);
    }
    // Fallback: via la liste exposée
    const liste: Devoir[] = (cours as any).getDevoirs?.() ?? [];
    return liste.some(d => (d.titre || "").trim().toLowerCase() === t);
  }

  /** Récupérer un devoir par titre (renvoie null si absent). */
  private tryGetDevoir(cours: CoursGroupe, titre: string): Devoir | null {
    if (typeof (cours as any).getDevoir === "function") {
      return (cours as any).getDevoir(titre) ?? null;
    }
    const liste: Devoir[] = (cours as any).getDevoirs?.() ?? [];
    const t = (titre || "").trim().toLowerCase();
    return liste.find(d => (d.titre || "").trim().toLowerCase() === t) ?? null;
  }

  // --- API publique ---

  /** Créer un devoir (doublon par titre dans le même groupe interdit). */
  public async ajouterDevoir(
    idGroupe: string,
    titre: string,
    description: string,
    noteMax: number,
    dateDebut: Date,
    dateFin: Date,
    etat: boolean
  ) {
    const cours = this.getCoursOrThrow(idGroupe);

    // Validations métier
    if (!titre || !titre.trim()) {
      throw new Error("Le titre du devoir est requis.");
    }
    if (!description || !description.trim()) {
      throw new Error("La description du devoir est requise.");
    }
    if (!Number.isFinite(noteMax) || noteMax <= 0) {
      throw new Error("La note maximale doit être un nombre positif.");
    }
    if (!(dateDebut instanceof Date) || isNaN(dateDebut.getTime())
      || !(dateFin instanceof Date) || isNaN(dateFin.getTime())) {
      throw new Error("Les dates fournies sont invalides.");
    }
    if (dateFin <= dateDebut) {
      throw new Error("La date de fin doit être postérieure à la date de début.");
    }

    if (this.isDevoirDuplicated(cours, titre)) {
      throw new Error("Un devoir avec ce titre existe déjà.");
    }

    const devoir = new Devoir(
      titre,
      description,
      noteMax,
      dateDebut,
      dateFin,
      etat,
      idGroupe
    );

    // Ajout dans la source de vérité du cours
    if (typeof (cours as any).addDevoir === "function") {
      (cours as any).addDevoir(devoir);
    } else {
      // Fallback si l’API n’existe pas encore
      ((cours as any)._devoirs ??= new Map<string, Devoir>())
        .set(devoir.titre, devoir);
    }

    return devoir;
  }

  /** Récupérer un devoir par titre. */
  public recupererDevoir(idGroupe: string, titre: string) {
    const cours = this.getCoursOrThrow(idGroupe);
    const d = this.tryGetDevoir(cours, titre);
    if (!d) throw new Error("Devoir introuvable.");
    return d;
  }

  /** Lister tous les devoirs d’un groupe. */
  public async getDevoirs(idGroupe: string) {
    const cours = this.getCoursOrThrow(idGroupe);
    if (typeof (cours as any).getDevoirs === "function") {
      return (cours as any).getDevoirs();
    }
    // Fallback: convertir la Map interne en tableau
    const map: Map<string, Devoir> = (cours as any)._devoirs ?? new Map();
    return Array.from(map.values());
  }

  /** Supprimer un devoir par titre. */
  public async supprimerDevoir(idGroupe: string, titre: string) {
    const cours = this.getCoursOrThrow(idGroupe);

    if (typeof (cours as any).removeDevoir === "function") {
      const ok = (cours as any).removeDevoir(titre);
      if (!ok) throw new Error("Devoir introuvable.");
      return this.getDevoirs(idGroupe);
    }

    // Fallback: suppression dans la Map interne
    const existed: boolean = (cours as any)._devoirs?.delete(titre) ?? false;
    if (!existed) throw new Error("Devoir introuvable.");

    return this.getDevoirs(idGroupe);
  }
}

// export default ControleurDevoir;
