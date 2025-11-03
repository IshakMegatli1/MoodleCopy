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
    this._router.get('/', this.demanderListe.bind(this));
    this._router.post('/login', this.login.bind(this));
    this._router.get('/fromtoken', this.fromToken.bind(this));
    this._router.get('/questionnaires', this.mesQuestionnaires.bind(this)); // 🆕
  }

  // GET /api/v1/etudiant
  private async demanderListe(req: Request, res: Response, next: NextFunction) {
    try {
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

      // ✅ CORRECTION : etu.id est partiel (first_name_7), on utilise l'email du formulaire
      req.session.user = {
        id: email,  // 🔑 Utiliser l'email envoyé au login (complet)
        partialId: etu.id, // garder l'id partiel pour référence
        nom: etu.nom,
        prenom: etu.prenom,
        hasPrivileges: false,
        isAnonymous: false,
        isEtudiant: true,
        userType: 'etudiant',
        role: 'etudiant'
      };
      req.session.token = token;

      console.log('✅ [LOGIN] Session créée');
      console.log('   Email (complet) :', email);
      console.log('   ID partiel (SGB):', etu.id);
      console.log('   Nom/Prénom      :', etu.prenom, etu.nom);

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

  /**
   * 🆕 GET /api/v1/etudiant/questionnaires
   * Affiche tous les questionnaires des groupes-cours de l'étudiant
   */
  private async mesQuestionnaires(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionUser = (req.session && req.session.user) || null;
      if (!sessionUser || !sessionUser.id) {
        return res.redirect('/signin');
      }

      // 1️⃣ L'ID de l'étudiant EST son email (student_id pour SGB)
      const studentEmail = sessionUser.id;
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👤 ÉTUDIANT CONNECTÉ');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 ID (email)     :', studentEmail);
      console.log('👤 Nom complet    :', `${sessionUser.prenom} ${sessionUser.nom}`);
      console.log('🎭 Rôle           :', sessionUser.role);

      // 2️⃣ Récupérer TOUS les groupes de l'étudiant via SGB
      const groupEntries = await SGB.getGroupesPourEtudiant(studentEmail);
      const groupes = Array.from(new Set(groupEntries.map(g => g.group_id)));
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📚 COURS DE L\'ÉTUDIANT (SGB)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Nombre total de cours :', groupes.length);
      groupes.forEach((gid, index) => {
        console.log(`  ${index + 1}. ${gid}`);
      });

      // 3️⃣ Récupérer la map des cours côté serveur
      const coursMap = (req.app && (req.app.locals as any).coursMap) || new Map();
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🗂️  COURS DISPONIBLES CÔTÉ SERVEUR');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Nombre de cours en mémoire :', coursMap.size);
      const serverCourses = Array.from(coursMap.keys());
      serverCourses.forEach((key, index) => {
        console.log(`  ${index + 1}. ${key}`);
      });

      const ctlQ = new ControleurQuestionnaire(coursMap);

      // 4️⃣ Pour chaque groupe, récupérer les questionnaires ET les infos du cours
      const questionnairesByGroup: Record<string, any[]> = {};
      const groupInfos: Record<string, any> = {};

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 QUESTIONNAIRES PAR COURS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      for (const gid of groupes) {
        // Récupérer les métadonnées du cours (titre, enseignant)
        const course = coursMap.get(gid);
        groupInfos[gid] = {
          group_id: gid,
          titre: course 
            ? (course.getNom?.() || course.getTitre?.() || course.nom || course.titre || gid)
            : gid,
          enseignant: course 
            ? (course.getEnseignant?.() || course.teacher_id || '')
            : ''
        };

        // Récupérer les questionnaires du cours
        try {
          const qns = ctlQ.getQuestionnaires(gid) || [];
          questionnairesByGroup[gid] = qns.map((qn: any) => ({
            nom: qn.getNomQuestionnaire?.() || qn.nom || String(qn),
            description: qn.getDescription?.() || qn.description || '',
            actif: qn.getActif?.() || !!qn.actif,
            nombreQuestions: qn.getNombreQuestions?.() || (qn.questions ? qn.questions.length : 0),
            url: `/cours/${encodeURIComponent(gid)}/questionnaires/${encodeURIComponent(qn.getNomQuestionnaire?.() || qn.nom)}`
          }));
          console.log(`✅ ${gid}`);
          console.log(`   Titre: ${groupInfos[gid].titre}`);
          console.log(`   Enseignant: ${groupInfos[gid].enseignant || 'N/A'}`);
          console.log(`   Questionnaires: ${questionnairesByGroup[gid].length}`);
          if (questionnairesByGroup[gid].length > 0) {
            questionnairesByGroup[gid].forEach((q, i) => {
              console.log(`     ${i + 1}. ${q.nom} (${q.nombreQuestions} questions) - ${q.actif ? '✓ Actif' : '✗ Inactif'}`);
            });
          }
        } catch (err) {
          console.warn(`⚠️  ${gid}: Impossible de récupérer questionnaires - ${err?.message}`);
          questionnairesByGroup[gid] = [];
        }
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // 5️⃣ Rendu de la vue
      res.render('etudiantQuestionnaires', {
        user: sessionUser,
        groupQuestionnaires: questionnairesByGroup,
        groupInfos,
        title: 'Mes questionnaires'
      });
    } catch (e) {
      next(e);
    }
  }
}