import { SGB } from './SGB';
import { Enseignant } from './enseignant';
import { CoursGroupe } from './coursGroupe';

export class ControleurCours {
    /** Retourne la liste des cours du groupe pour un enseignant */ 
    async demanderListe(enseignant: Enseignant): Promise<Map<String, CoursGroupe>> {
        const listeCours = new Map<String, CoursGroupe>()
        const response = await SGB.getListeCours(enseignant.id)
        for (const course of response) {
            const cours = new CoursGroupe(
                course.group_id,
                course.day,
                course.hours,
                course.activity,
                course.mode,
                course.local,
                course.teacher_id
            );
            listeCours.set(cours.group_id, cours)
        }
        return listeCours
    }   

    /** ajoute un cours à la listeCours de l'enseignant */
    ajouterCours(enseignant: Enseignant, courseData: {
        group_id: string,
        day: string,
        hours: string,
        activity: string,
        mode: string,
        local: string,
        teacher_id: string
    }) {
        const cours = new CoursGroupe(
            courseData.group_id,
            courseData.day,
            courseData.hours,
            courseData.activity,
            courseData.mode,
            courseData.local,
            courseData.teacher_id
        );
        enseignant.listeCours.set(cours.group_id, cours);
        return cours;
    }
}