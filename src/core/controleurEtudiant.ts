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

    /** retourne le token (utile pour le front) */
      async authentifier(email: string, password: string): Promise<string> {
        const { token } = await SGB.authentifierEtudiant(email, password);
        return token;
      }
    
      /** construit l'étudiant à partir du token (validation du token) */
      async getEtudiant(token: string): Promise<Etudiant> {
        const { user } = await SGB.getEtudiant(token);
        return new Etudiant(user.first_name, user.last_name, token);
      }
}