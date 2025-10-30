import express, { NextFunction } from 'express';
import ExpressSession from 'express-session';
import logger from 'morgan';
import flash from 'express-flash-plus';

// Extend express-session to include 'user' property
declare module 'express-session' {
  interface SessionData {
    user?: any;
  }
}

import { jeuRoutes } from './routes/jeuRouter';
import { RouteurEnseignant } from './routes/routeurEnseignant';
import { RouteurCours } from './routes/routeurCours';
import { RouteurEtudiant } from './routes/routeurEtudiant';
import { RouteurQuestions } from './routes/routeurQuestions';
import { RouteurQuestionnaire } from './routes/routeurQuestionnaire';
import { CoursGroupe } from './core/coursGroupe'; // <-- ✅ AJOUT

// Creates and configures an ExpressJS web server.
class App {

  // ref to Express instance
  public expressApp: express.Application;

  //Run configuration methods on the Express instance.
  constructor() {
    this.expressApp = express();
    this.middleware();
    this.routes();
    this.expressApp.use(this.handleErrors);
    this.expressApp.set('view engine', 'pug');
    this.expressApp.use(express.static(__dirname + '/public') as express.RequestHandler); // https://expressjs.com/en/starter/static-files.html
  }

  // Configure Express middleware.
  private middleware(): void {
    this.expressApp.use(logger('dev') as express.RequestHandler);
    this.expressApp.use(express.json() as express.RequestHandler);
    this.expressApp.use(express.urlencoded({ extended: false }) as express.RequestHandler);
    this.expressApp.use(ExpressSession(
      {
        secret: 'My Secret Key',
        resave: false,
        saveUninitialized: true
      }));
    this.expressApp.use(flash());
  }

  // Configure API endpoints.
  private routes(): void {
    const titreBase = 'Moodle';
    let router = express.Router();
    // Le squelette ne traite pas la gestion des connexions d'utilisateur, mais
    // les gabarits Pug (navbar) supportent l'affichage selon l'état de connexion 
    // dans l'objet user, qui peut avoir deux valeurs (p.ex. admin ou normal)
    let user;
    // Si l'utilisateur est connecté, le gabarit Pug peut afficher des options, 
    // le nom de l'utilisateur et une option pour se déconnecter.
    //user = { nom: 'Pierre Trudeau', hasPrivileges: true, isAnonymous: false };
    // Si user.isAnonymous est vrai, le gabarit Pug affiche une option pour se connecter.
    // user = { isAnonymous: true }; // utilisateur quand personne n'est connecté

    //Route pour jouer (index)
    router.get('/home', (req, res, next) => {
      const user = req.session?.user || { isAnonymous: true };
      res.render('index', {
        title: `${titreBase}`,
        user,
        joueurs: JSON.parse(jeuRoutes.controleurJeu.joueurs)
      });
    });

    //Pour mettre la page de connexion par défaut
    router.get('/', (req, res) => {
      res.render('signin', {
        title: `${titreBase}`
      });
    });

    // Route pour classement (stats)
    router.get('/stats', (req, res, next) => {
      const user = req.session?.user || { isAnonymous: true };
      res.render('stats', {
        title: `${titreBase}`,
        user,
        // créer nouveau tableau de joueurs qui est trié par ratio
        joueurs: JSON.parse(jeuRoutes.controleurJeu.joueurs)
      });
    });

    // Route to login
    router.get('/signin', async function (req, res) {
      if (user.isAnonymous) {
        // simuler un login
        res.render('signin', {
          title: `${titreBase}`
        })
      } else {
        return res.redirect('/');
      }
    });

    // Route to logout
    router.get('/signout', async function (req, res) {
      // simuler une déconnexion
      user = { isAnonymous: true };
      return res.redirect('/');
    });

    // Route pour créer un cours
    router.get('/ajouterCours', (req, res, next) => {
      const user = req.session?.user || { isAnonymous: true };
      if (user.isAnonymous || !user.hasPrivileges) {
        return res.status(403).render('error', { message: 'Accès refusé', error: { status: 403, stack: '' } });
      }
      res.render('ajouterCours', {
        title: `${titreBase}`,
        user
      });
    });

    // Route pour gérer mes cours
    router.get('/mesCours', (req, res, next) => {
      const user = req.session?.user || { isAnonymous: true };
      if (user.isAnonymous || !user.hasPrivileges) {
        return res.status(403).render('error', { message: 'Accès refusé', error: { status: 403, stack: '' } });
      }
      res.render('mesCours', {
        title: `${titreBase}`,
        user
      });
    });

    this.expressApp.use('/', router);  // routage de base

    this.expressApp.use('/api/v1/jeu', jeuRoutes.router);  // tous les URI pour le scénario jeu (DSS) commencent ainsi

    const enseignantRoutes = new RouteurEnseignant();
    const routeurCours = new RouteurCours();
    const routeurEtudiant = new RouteurEtudiant();
    this.expressApp.use('/api/v1/enseignant', enseignantRoutes.router);
    this.expressApp.use('/api/v1/cours', routeurCours.router);
    this.expressApp.use('/api/v1/etudiant', routeurEtudiant.router);

    // Routes Questions (CU02a)
    // const routeurQuestions = new RouteurQuestions();
    // this.expressApp.use("/", routeurQuestions.router);

    // ================================
    // Routes Questionnaires (CU05a)
    // ================================

    // ✅ Map partagée des cours pour les questionnaires
    const coursMap = new Map<string, CoursGroupe>(); // <-- ✅ AJOUT

    const routeurQuestionnaires = new RouteurQuestionnaire(coursMap); // <-- ✅ utilise la map
    this.expressApp.use("/", routeurQuestionnaires.router);           // <-- ✅ monté à la racine


    const routeurQuestions = new RouteurQuestions(coursMap);
    this.expressApp.use("/", routeurQuestions.router);
  }

  private handleErrors(err: any, req: any, res: any, next: NextFunction) {
  const status =
    (typeof err?.status === 'number' && err.status) ||
    (typeof err?.statusCode === 'number' && err.statusCode) ||
    (typeof err?.code === 'number' && err.code) ||
    500;

  const message = err?.message || 'Internal Server Error';
  if (res.headersSent) return next(err);

  try { req.flash?.('error', message); } catch {}
  res.status(status).json({ error: message, status });
}

}

export default new App().expressApp;
