<!-- Changer le numéro de l'itération plus bas pour chaque rapport -->
# Rapport Itération numéro i

## Identification des membres de l'équipe

Veuillez éditer ce fichier afin de fournir les informations nécessaires à votre évaluation.

Assurez-vous d'utiliser toujours le même compte GitHub pour accéder à ce projet.

## Membre 1

- <nomComplet1>Philippe Bolduc</nomComplet1>
- <courriel1>philippe.bolduc.3@ens.etsmtl.ca</courriel1>
- <codeMoodle1>AP85660</codeMoodle1>
- <githubAccount1>PhilippeBolduc-hub</githubAccount1>

## Membre 2

- <nomComplet2>Ishak Megatli</nomComplet2>
- <courriel2>ishak.megatli.1@ens.etsmtl.ca</courriel2>
- <codeMoodle2>AS96830</codeMoodle2>
- <githubAccount2>IshakMegatli1</githubAccount2>

## Membre 3

- <nomComplet3>Daniel Atik</nomComplet3>
- <courriel3>daniel.atik.1@ens.etsmtl.ca</courriel3>
- <codeMoodle3>AT56880</codeMoodle3>
- <githubAccount3>DanielAtik1</githubAccount3>

## Membre 4

- <nomComplet4>Marc-Sheldon Bazelais</nomComplet4>
- <courriel4>marc-sheldon.bazelais.1@ens.etsmtl.ca</courriel4>
- <codeMoodle4>AQ00910</codeMoodle4>
- <githubAccount4>msbazelais</githubAccount4>

## Exigences

> Liste des exigences et personnes responsables de celles-ci.

| Exigence                      | Responsable               |
| ----------------------------- | ------------------------  |
| CU01 conception               | Philippe Bolduc           |
| CU01 analyse                  | Philippe Bolduc           |
| CU01 révision de modeles      | Philippe Bolduc           |
| CU01 implémentation           | Ishak / Daniel            |
| CU01 tests                    | Ishak / Daniel            |
| CU02                          | Marc-Sheldon Bazelais     |

## Modèle du domaine (MDD)

> Le MDD est cumulatif : vous devez y ajouter des éléments à chaque itération (ou corriger les erreurs), selon la portée (et votre meilleure compréhension du problème) visée par votre solution. Utilisez une légende dans le MDD pour indiquer la couleur de chaque itération afin de faire ressortir les changements (ce n'est pas toujours possible pour les associations et les attributs). Voir les stéréotypes personnalisés : <https://plantuml.com/fr/class-diagram> et [comment faire une légende avec couleurs en PlantUML](https://stackoverflow.com/questions/30999290/how-to-generate-a-legend-with-colors-in-plantuml).

![alt text](MDD.png)
## Diagramme de séquence système (DSS)

> Un seul DSS sera choisi et corrigé par l'auxiliaire d'enseignement

![dss-CU01a](dss-CU01a.png)
![alt text](dss-CU01b.png)
![alt text](dss-CU01c.png)
## Contrats

> Si vous avez choisi un cas d'utilisation nécessitant un contrat, il faut le mettre dans cette section.
> Note: même s'il y a plusieurs contrats, un seul contrat sera choisi et corrigé par l'auxiliaire d'enseignement
> Note: il n'est pas nécessaire de mettre les préconditions mais je vous suggère fortement de les ajouter dans votre rapport. 

CU01a1
Opération : getListeCours(courriel: String)

Post Conditions :

-L'enseignant courant a été associé à sa liste de cours courante
________________________________________________________________________

CU01a2
Opération : ajouterCours(e: Enseignant ; cg: CoursGroupe)

Post Conditions :

-Le cours courant a été ajouté à la liste de cours de l'enseignant courant
________________________________________________________________________

CU01b1
Opération : genererListe(courriel)

Post Conditions : 

-L'enseignant courant a été associé à sa liste de cours courante
________________________________________________________________________

CU01b2
Opération : creerBoiteCours(c: Cours)

Post Conditions :

-L'enseignant courant a été associé au controleur de cours courant.
________________________________________________________________________

CU01c1
Opération : remove(c: cours)

Post Conditions :

-Le cours courant a été supprimé à la liste de cours de l'enseignant courant
________________________________________________________________________

## Réalisation de cas d'utilisation (RDCU)

> Chaque cas d'utilisation nécessite une RDCU.
> Note: une seule RDCU sera choisie et corrigée par l'auxiliaire d'enseignement
> Suivez les directives d'implémentation dans le fichier README.md pour vous faciliter la tâche d'implémentation.

![alt text](RDCU-CU01a1.png)
![alt text](RDCU-CU01a2.png)
![alt text](RDCU-CU01b1.png)
![alt text](RDCU-CU01b2.png)
![alt text](RDCU-CU01c1.png)

## Diagramme de classe logicielle (DCL)

> Facultatif, mais fortement suggéré
> Ce diagramme vous aidera à planifier l'ordre d'implémentation des classes.  Très utile lorsqu'on utilise TDD.

### Diagramme de classe TPLANT
- Générer un diagramme de classe avec l'outil TPLANT et commenter celui-ci par rapport à votre MDD.
- https://www.npmjs.com/package/tplant
  
## Retour sur la correction du rapport précédent
Démontrer avec des preuves à l'appui que vous avez réglé les problèmes identifiés dans le rapport de l'itération précédente.
## Vérification finale

- [x] Vous avez un seul MDD
  - [x] Vous avez mis un verbe à chaque association
  - [x] Chaque association a une multiplicité
- [x] Vous avez un DSS par cas d'utilisation
  - [x] Chaque DSS a un titre
  - [x] Chaque opération synchrone a un retour d'opération
  - [x] L'utilisation d'une boucle (LOOP) est justifiée par les exigences
- [x] Vous avez autant de contrats que d'opérations système (pour les cas d'utilisation nécessitant des contrats)
  - [x] Les postconditions des contrats sont écrites au passé
- [x] Vous avez autant de RDCU que d'opérations système
  - [x] Chaque décision de conception (affectation de responsabilité) est identifiée et surtout **justifiée** (par un GRASP ou autre heuristique)
  - [x] Votre code source (implémentation) est cohérent avec la RDCU (ce n'est pas juste un diagramme)
- [ ] Vous avez un seul diagramme de classes
- [x] Vous avez remis la version PDF de ce document dans votre répertoire
- [ ] [Vous avez regardé cette petite présentation pour l'architecture en couche et avez appliqué ces concepts](https://log210-cfuhrman.github.io/log210-valider-architecture-couches/#/) 