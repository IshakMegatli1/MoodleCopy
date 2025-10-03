import { Router, Request, Response, NextFunction } from 'express';
import { InvalidParameterError } from '../core/errors/invalidParameterError';
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
}