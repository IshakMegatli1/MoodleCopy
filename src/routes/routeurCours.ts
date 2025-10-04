import { Router, Request, Response, NextFunction } from 'express';
import { ControleurCours } from '../core/controleurCours';
import { SGB } from '../core/SGB';

export class RouteurCours {
  private _router: Router;
  private _ctrl: ControleurCours;   

  get router() { return this._router; }

  constructor() {
    this._ctrl = new ControleurCours();
    this._router = Router();
    this.init();
  }   

  private init() {
    this._router.get('/', this.demanderListe.bind(this)); // GET /api/v1/cours
    this._router.get('/:group_id/students', this.demanderEtudiantsDuCours.bind(this)); // GET /api/v1/cours/:group_id/students
  }

  // GET /api/v1/cours
  private async demanderListe(req: Request, res: Response, next: NextFunction) {
    try {
      // Get email de la session en cours
      let email = req.session?.user?.email || req.query.email;
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: 'Email du professeur requis.' });
      }
      // Appel à SGB.getListeCours(email) pour obtenir tous les horaires du professeur
      const cours = await SGB.getListeCours(email);
      // Retourner tout les horaires (en objets)
      res.json(cours);
    } catch (e) {
      next(e);
    }
  }

  // GET /api/v1/cours/:group_id/students
  private async demanderEtudiantsDuCours(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = req.params.group_id;
      const [allStudents, rawGroupStudents] = await Promise.all([
        SGB.getListeEtudiants(),
        SGB.getEtudiantsDuGroupe(groupId)
      ]);

      // debug logs
      console.log('--- groupId demandé :', groupId);
      console.log('--- rawGroupStudents sample :', rawGroupStudents && rawGroupStudents.length ? rawGroupStudents.slice(0,10) : rawGroupStudents);
      console.log('--- allStudents sample :', allStudents && allStudents.length ? allStudents.slice(0,10) : allStudents);

      // Ensure we only keep entries for the requested group_id (defensive)
      const groupStudents = (rawGroupStudents || []).filter((gs: any) => {
        const gid = gs.group_id ?? gs.groupId ?? gs.group ?? null;
        return gid === groupId;
      });

      // Build set of student IDs accepting both formats:
      // groupStudents may be [{ student_id: 'x' }, ...] or [{ id: 'x', first_name... }, ...]
      const ids = groupStudents
        .map((gs: any) => gs.student_id ?? gs.id ?? gs.studentId ?? null)
        .filter((v: any) => v);
      const studentIdSet = new Set(ids);

      console.log('--- studentIds du groupe :', Array.from(studentIdSet).slice(0,20));

      const studentsInGroup = allStudents.filter(student => studentIdSet.has(student.id));

      console.log('--- studentsInGroup (filtrés) count:', studentsInGroup.length);

      res.json(studentsInGroup);
    } catch (e) {
      next(e);
    }
  }
}