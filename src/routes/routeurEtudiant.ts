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
        this._router.post('/login', this.login.bind(this));
        this._router.get('/fromtoken', this.fromToken.bind(this)); // GET ?token=...
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

    /** POST /api/v1/etudiant/login {email,password} */
    private async login(req: Request, res: Response, next: NextFunction) {
      try {
        const { email, password } = req.body || {};
        if (!email) throw new InvalidParameterError('Le paramètre email est absent');
        if (!password) throw new InvalidParameterError('Le paramètre password est absent');

        const token = await this._ctrl.authentifier(email, password);
        const etu = await this._ctrl.getEtudiant(token);

        // Store user info in session for navbar
        req.session.user = {
            nom: etu.nom,  // Juste le nom de famille
            hasPrivileges: false,
            isAnonymous: false,
            isEtudiant: true,
            userType: 'etudiant',
            prenom: etu.prenom
        };
        req.session.token = token;

        res.status(200).send({
          message: 'Success',
          token,
          user: { id: etu.id, firstName: etu.prenom, lastName: etu.nom }
        });
      } catch (e) {
        res.status(401).json({ message: e.message || 'Login invalide' });
      }
    }

    /** GET /api/v1/etudiant/fromtoken?token=... */
    private async fromToken(req: Request, res: Response, next: NextFunction) {
      try {
        const token = req.query.token;
        if (!token || typeof token !== 'string') {
          throw new InvalidParameterError('Le paramètre token est absent ou invalide');
        }
        const etu = await this._ctrl.getEtudiant(token);
        res.status(200).send({
          message: 'Success',
          user: { id: etu.id, firstName: etu.prenom, lastName: etu.nom }
        });
      } catch (e) {
        res.status(401).json({ message: e.message || 'Token invalide' });
      }
    } 
}