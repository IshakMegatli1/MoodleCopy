import { Router, Request, Response, NextFunction } from 'express';
import { InvalidParameterError } from '../core/errors/invalidParameterError';
import { ControleurEtudiant } from '../core/controleurEtudiant';
import { SGB } from '../core/SGB';
import { ControleurQuestionnaire } from '../core/controleurQuestionnaire';

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
        // page front pour l'étudiant: ses questionnaires
        this._router.get('/questionnaires', this.mesQuestionnaires.bind(this));
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

        // Store user info in session for navbar and later use (include id)
        req.session.user = {
            id: etu.id,                       // <-- ajouter l'id ici
            nom: etu.nom,
            prenom: etu.prenom,
            hasPrivileges: false,
            isAnonymous: false,
            isEtudiant: true,
            userType: 'etudiant',
            role: 'etudiant'
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

    // GET /api/v1/etudiant/questionnaires  (rend la vue pour l'étudiant)
    private async mesQuestionnaires(req: Request, res: Response, next: NextFunction) {
      try {
        const sessionUser = (req.session && req.session.user) || null;
        if (!sessionUser || !sessionUser.id) {
          // rediriger vers la page de connexion/inscription publique
          return res.redirect('/login');
        }
        const studentId = sessionUser.id;
        console.log('[mesQuestionnaires] studentId =', studentId);

        // récupérer les groupes auxquels l'étudiant est rattaché
        const groupEntries = await SGB.getGroupesPourEtudiant(studentId);
        const groupes = Array.from(new Set((groupEntries || []).map(g => g.group_id)));
        console.log('[mesQuestionnaires] groupes from SGB =', groupes);

        const coursMap = (req.app && (req.app.locals as any).coursMap) || new Map();
        console.log('[mesQuestionnaires] coursMap keys =', Array.from(coursMap.keys()));

        const ctlQ = new ControleurQuestionnaire(coursMap);
        const questionnairesByGroup: Record<string, any[]> = {};
        const ignoredGroups: string[] = [];

        // Ne traiter que les groupes auxquels l'étudiant est inscrit ET connus côté serveur
        for (const gid of groupes) {
          if (!coursMap.has(gid)) {
            // debug : on ignore ce groupe car le server n'a pas le cours
            ignoredGroups.push(gid);
            continue;
          }

          try {
            const maybe = ctlQ.getQuestionnaires(gid);
            const qns = maybe instanceof Promise ? await maybe : maybe || [];
            questionnairesByGroup[gid] = (qns || []).map((qn: any) => {
              const qName =
                typeof qn.getNomQuestionnaire === 'function'
                  ? qn.getNomQuestionnaire()
                  : qn.nom || String(qn);
              return {
                nom: qName,
                description:
                  typeof qn.getDescription === 'function' ? qn.getDescription() : qn.description || '',
                actif: typeof qn.getActif === 'function' ? qn.getActif() : !!qn.actif,
                url: `/cours/${encodeURIComponent(gid)}/questionnaires/${encodeURIComponent(qName)}`
              };
            });
          } catch (err) {
            console.warn(`[mesQuestionnaires] impossible de récupérer questionnaires pour ${gid}:`, err?.message || err);
            questionnairesByGroup[gid] = [];
          }
        }

        if (Object.keys(questionnairesByGroup).length === 0) {
          console.log('[mesQuestionnaires] aucun questionnaire trouvé pour les groupes connus. ignoredGroups =', ignoredGroups);
        }

        res.render('etudiantQuestionnaires', {
          user: sessionUser,
          groupQuestionnaires: questionnairesByGroup,
          title: 'Mes questionnaires'
        });
      } catch (e) {
        next(e);
      }
    }
}