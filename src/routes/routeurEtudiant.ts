import { Router, Request, Response, NextFunction } from 'express';
import { InvalidParameterError } from '../core/errors/invalidParameterError';
import { ControleurEtudiant } from '../core/controleurEtudiant';
import { SGB } from '../core/SGB';

export class RouteurEtudiant {
  private _router: Router;
  private _ctrl: ControleurEtudiant;    
    get router() { return this._router; }

    constructor() {
        this._ctrl = new ControleurEtudiant();
        this._router = Router();
        this.init();
    }
    private init() {
        this._router.get('/', this.demanderListe.bind(this)); // GET /api/v1/etudiant
    }
    // GET /api/v1/etudiant
    private async demanderListe(req: Request, res: Response, next: NextFunction) {
      try {
        // On veut juste retourner tous les étudiants
        const etudiants = await SGB.getListeEtudiants();
        res.json(etudiants);
      } catch (e) {
        next(e);
      }
    }
}