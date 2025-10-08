import { SGB } from './SGB';
import { Etudiant } from './etudiant';

export class ControleurEtudiant {
    /** Retourne la liste des étudiants inscrits à un cours pour un enseignant */ 
    async demanderListe(token: string, coursId: string): Promise<Map<String, Etudiant>> {
        const listeEtudiants = new Map<String, Etudiant>()
        const response = await SGB.getListeEtudiants()    
        for (const student of response) {
            const etudiant = new Etudiant(student.id, student.last_name, student.first_name)
            listeEtudiants.set(etudiant.id, etudiant)
        }
        return listeEtudiants
    }   
}