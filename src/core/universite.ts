
import { Etudiant } from './etudiant';
import { Enseignant } from './enseignant';

export class Universite {
    private listeEtudiants: Map<String, Etudiant>
    private listeEnseignants: Map<String, Enseignant>

    constructor() {
        this.listeEtudiants = new Map<String, Etudiant>()
        this.listeEnseignants = new Map<String, Enseignant>()
    }
    getListeEtudiants(): Map<String, Etudiant> {
        return this.listeEtudiants
    }
    getListeEnseignants(): Map<String, Enseignant> {
        return this.listeEnseignants
    }
    ajouterEtudiant(etudiant: Etudiant) {
        this.listeEtudiants.set(etudiant.id, etudiant)
    }
    ajouterEnseignant(enseignant: Enseignant) {
        this.listeEnseignants.set(enseignant.id, enseignant)
    }
}