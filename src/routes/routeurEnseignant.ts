import { Router, Request, Response, NextFunction } from 'express';
import { ControleurEnseignant } from '../core/controleurEnseignant';
import { InvalidParameterError } from '../core/errors/invalidParameterError';

import session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    token?: string;
    user?: any;
  }
}

export class RouteurEnseignant {
  private _router: Router;
  private _ctrl: ControleurEnseignant;

  get router() { return this._router; }

  constructor() {
    this._ctrl = new ControleurEnseignant();
    this._router = Router();
    this.init();
  }

  private init() {
    this._router.post('/login', this.login.bind(this));
    this._router.get('/fromtoken', this.fromToken.bind(this)); // GET ?token=...
  }

  /** POST /api/v1/enseignant/login {email,password} */
  private async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body || {};
      if (!email) throw new InvalidParameterError('Le paramètre email est absent');
      if (!password) throw new InvalidParameterError('Le paramètre password est absent');

      const token = await this._ctrl.authentifier(email, password);
      const ens = await this._ctrl.getEnseignant(token);

      // Store user info in session for navbar
      req.session.user = {
        nom: `${ens.prenom} ${ens.nom}`,
        hasPrivileges: true,
        isAnonymous: false,
        role: 'enseignant'
      };
      req.session.token = token;

      res.status(200).send({
        message: 'Success',
        token,
        user: { id: ens.id, firstName: ens.prenom, lastName: ens.nom }
      });
    } catch (e) {
      res.status(401).json({ message: e.message || 'Login invalide' });
    }
  }

  /** GET /api/v1/enseignant/fromtoken?token=... */
  private async fromToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = (req.query.token as string) || '';
      if (!token) throw new InvalidParameterError('Le paramètre token est absent');

      const ens = await this._ctrl.getEnseignant(token);
      res.status(200).send({
        message: 'Success',
        user: { id: ens.id, firstName: ens.prenom, lastName: ens.nom }
      });
    } catch (e) { next(e); }
  }
}
