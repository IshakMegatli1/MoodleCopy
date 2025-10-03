import { SGB } from './SGB';
import { Enseignant } from './enseignant';
import { CoursGroupe } from './coursGroupe';

export class ControleurCours {
    /** Retourne la liste des cours du groupe pour un enseignant */ 
    async demanderListe(enseignant: Enseignant, groupeId: string): Promise<Map<String, CoursGroupe>> {
        const listeCours = new Map<String, CoursGroupe>()
        const response = await SGB.getListeCours(enseignant.token)
        for (const course of response) {
            const cours = new CoursGroupe(course.group_id, groupeId, course.activity, enseignant)
            listeCours.set(cours.id, cours)
        }
        return listeCours
    }   

    /** ajoute un cours à un groupe pour un enseignant */
    // async ajouterCours(enseignant: Enseignant, groupeId: string, titre: string): Promise<CoursGroupe> {
    //     const response = await SGB.ajouterCours(enseignant.token, groupeId, titre)
    //     const cours = new CoursGroupe(response.id, groupeId, response.title, enseignant)
    //     return cours
    // }   
}