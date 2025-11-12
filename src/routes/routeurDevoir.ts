import { Router, Request, Response, NextFunction } from 'express';
import express from 'express';
import { Devoir } from '../core/devoir';
import { CoursGroupe } from '../core/coursGroupe';

// Stockage en mémoire par id de groupe (héritage de ta version actuelle)
const devoirsParCours = new Map<string, Devoir[]>();

export class RouteurDevoir {    
    private _router: Router;
    get router() { return this._router; }

    // ✅ AJOUT : garder une référence vers coursMap pour synchroniser
    constructor(private coursMap?: Map<string, CoursGroupe>) {
      this._router = Router();
      this.init();
    }   

    // ✅ helper minimal pour avoir un CoursGroupe dans la map
    private ensureCours(group_id: string): CoursGroupe | undefined {
      if (!this.coursMap) return undefined;
      let cours = this.coursMap.get(group_id);
      if (!cours) {
        cours = new CoursGroupe(
          group_id, 'N/D', 'N/D', 'Cours', 'N/D', 'N/D', 'enseignant-nd'
        );
        this.coursMap.set(group_id, cours);
      }
      return cours;
    }
    private init() {
      this._router.get('/cours/:group_id/gestionDevoirs', this.afficherListe.bind(this));
      this._router.get('/cours/:group_id/devoirs/add', this.afficherFormAjout.bind(this));
        this._router.post(  
        '/cours/:group_id/devoirs/add',
        express.urlencoded({ extended: false }),
        this.traiterAjout.bind(this)    
        );
    }

    private afficherListe(req: Request, res: Response, _next: NextFunction) {
      const { group_id } = req.params;  
        // ✅ si on a coursMap, on affiche ce qui est dans CoursGroupe (source unique)
        let devoirs: Devoir[];
        if (this.coursMap) {
            const cours = this.coursMap.get(group_id);
            devoirs = cours ? cours.getDevoirs() : [];
        } else {
            devoirs = devoirsParCours.get(group_id) || [];
        }   
        const message = (req.query.msg as string) || undefined;
        const error = (req.query.err as string) || undefined;   
        res.render('gestionDevoirs', {  
        user: req.session?.user ?? { isAnonymous: false },
        group_id,
        devoirs,    
        message,
        error
      });
    }       
    private afficherFormAjout(req: Request, res: Response, _next: NextFunction) {
      const { group_id } = req.params;   
      res.render('ajouterDevoir', {
        user: req.session?.user ?? { isAnonymous: false },
        group_id
      });
    }   

    private traiterAjout(req: Request, res: Response) {
        const { group_id } = req.params;

        const titre = (req.body.titre || '').trim();
        const description = (req.body.description || '').trim();
        const noteMaxStr = (req.body.noteMax || '').toString().trim();
        const dateDebutStr = (req.body.dateDebut || '').toString().trim();
        const dateFinStr = (req.body.dateFin || '').toString().trim();
        const etatBool = String(req.body.etat) === 'true';

        // ---- Validations de base ----
        if (!titre) {
            return res.redirect(
            `/cours/${encodeURIComponent(group_id)}/gestionDevoirs?err=${encodeURIComponent(
                'Le titre du devoir est requis.'
            )}`
            );
        }

        if (!description) {
            return res.redirect(
            `/cours/${encodeURIComponent(group_id)}/gestionDevoirs?err=${encodeURIComponent(
                'Une description est requise pour le devoir.'
            )}`
            );
        }

        // noteMax
        const noteMax = parseFloat(noteMaxStr.replace(',', '.'));
        if (!Number.isFinite(noteMax) || noteMax <= 0) {
            return res.redirect(
            `/cours/${encodeURIComponent(group_id)}/gestionDevoirs?err=${encodeURIComponent(
                'La note maximale doit être un nombre positif.'
            )}`
            );
        }

        // dates
        const dateDebut = new Date(dateDebutStr);
        const dateFin = new Date(dateFinStr);
        const invalideDebut = isNaN(dateDebut.getTime());
        const invalideFin = isNaN(dateFin.getTime());

        if (invalideDebut || invalideFin) {
            return res.redirect(
            `/cours/${encodeURIComponent(group_id)}/gestionDevoirs?err=${encodeURIComponent(
                'Les dates fournies sont invalides.'
            )}`
            );
        }

        // Règle DSS: dateFin > dateDebut
        if (dateFin <= dateDebut) {
            return res.redirect(
            `/cours/${encodeURIComponent(group_id)}/gestionDevoirs?err=${encodeURIComponent(
                'La date de fin doit être postérieure à la date de début.'
            )}`
            );
        }

        // ---- Unicité par titre (par cours) ----
        let deja: boolean;
        if (this.coursMap) {
            const cours = this.coursMap.get(group_id);
            const existants: Devoir[] = cours ? cours.getDevoirs?.() ?? [] : [];
            deja = existants.some(d => (d.titre || '').trim().toLowerCase() === titre.toLowerCase());
        } else {
            const liste = devoirsParCours.get(group_id) || [];
            deja = liste.some(d => (d.titre || '').trim().toLowerCase() === titre.toLowerCase());
        }

        if (deja) {
            return res.redirect(
            `/cours/${encodeURIComponent(group_id)}/gestionDevoirs?err=${encodeURIComponent(
                'Le titre du devoir n’est pas unique pour ce cours.'
            )}`
            );
        }

        // ---- Création du devoir ----
        const devoir = new Devoir(
            titre,
            description,
            noteMax,
            dateDebut,
            dateFin,
            etatBool,
            group_id
        );

        // ✅ 1) Compatibilité avec la Map historique
        const liste = devoirsParCours.get(group_id) || [];
        liste.push(devoir);
        devoirsParCours.set(group_id, liste);

        // ✅ 2) Synchroniser dans CoursGroupe (source maître si présente)
        const cours = this.ensureCours(group_id);
        if (cours && typeof cours.addDevoir === 'function') {
            cours.addDevoir(devoir);
        }

        return res.redirect(
            `/cours/${encodeURIComponent(group_id)}/gestionDevoirs?msg=${encodeURIComponent(
            'Devoir ajouté et associé à la banque du cours.'
            )}`
        );
    }
}       