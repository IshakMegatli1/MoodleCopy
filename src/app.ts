import express, { NextFunction } from 'express';
import ExpressSession from 'express-session';
import logger from 'morgan';
import flash from 'express-flash-plus';

import { jeuRoutes } from './routes/jeuRouter';
import { RouteurEnseignant } from './routes/routeurEnseignant';

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
    const titreBase = 'Jeu de dés';
    let router = express.Router();
    // Le squelette ne traite pas la gestion des connexions d'utilisateur, mais
    // les gabarits Pug (navbar) supportent l'affichage selon l'état de connexion 
    // dans l'objet user, qui peut avoir deux valeurs (p.ex. admin ou normal)
    let user;
    // Si l'utilisateur est connecté, le gabarit Pug peut afficher des options, 
    // le nom de l'utilisateur et une option pour se déconnecter.
    user = { nom: 'Pierre Trudeau', hasPrivileges: true, isAnonymous: false };
    // Si user.isAnonymous est vrai, le gabarit Pug affiche une option pour se connecter.
    // user = { isAnonymous: true }; // utilisateur quand personne n'est connecté

    //Route pour jouer (index)
    router.get('/', (req, res, next) => {
      res.render('index',
        // passer objet au gabarit (template) Pug
        {
          title: `${titreBase}`,
          user: user,
          joueurs: JSON.parse(jeuRoutes.controleurJeu.joueurs)
      });
    });

    //Pour mettre la page de connexion par défaut
  //   router.get('/', (req, res) => {
  //     res.render('signin', {
  //       title: `${titreBase}`
  //     });
  // });


  //Peut etre la route selon si la personne est connectée ou pas
//   router.get('/', (req, res) => {
//   // Vérifie si l'utilisateur est connecté via la session
//   const user = req.session?.user;
//   if (user && !user.isAnonymous) {
//     // Si connecté, affiche la page principale
//     res.render('index', {
//       title: 'Jeu de dés',
//       user,
//       // ...autres variables nécessaires
//     });
//   } else {
//     // Sinon, affiche la page de connexion
//     res.render('signin', {
//       title: 'Jeu de dés'
//     });
//   }
// });


    // Route pour classement (stats)
    router.get('/stats', (req, res, next) => {
      res.render('stats',
        // passer objet au gabarit (template) Pug
        {
          title: `${titreBase}`,
          user: user,
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

    // Route to login
    router.get('/signout', async function (req, res) {
      // simuler une déconnexion
      user = { isAnonymous: true };
      return res.redirect('/');
    });


    this.expressApp.use('/', router);  // routage de base

    this.expressApp.use('/api/v1/jeu', jeuRoutes.router);  // tous les URI pour le scénario jeu (DSS) commencent ainsi


    
    const enseignantRoutes = new RouteurEnseignant();
    this.expressApp.use('/api/v1/enseignant', enseignantRoutes.router);

  }

  private handleErrors(error: any, req: any, res: any, next: NextFunction) {
    req.flash('error', error.message);
    res.status(error.code).json({ error: error.toString() });
  }
}

export default new App().expressApp;
