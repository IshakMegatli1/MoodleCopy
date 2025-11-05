<!-- Changer le numéro de l'itération plus bas pour chaque rapport -->
# Rapport Itération numéro 2

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

| Exigence                       | Responsable               |
| -----------------------------  | ------------------------  |
| CU05a conception               | Philippe / Marc-Sheldon   |
| CU05a analyse                  | Philippe / Marc-Sheldon   |
| CU05a révision de modeles      | Philippe Bolduc           |
| CU05a implémentation           | Marc-Sheldon              |
| CU05a tests                    | Marc-Sheldon              |
| CU05b conception               | Daniel / Philippe         |
| CU05b analyse                  | Daniel / Philippe         |
| CU05b révision de modeles      | Daniel / Philippe         |
| CU05b implémentation           | Ishak / Daniel            |
| CU05b tests                    | Ishak / Daniel            |

## Modèle du domaine (MDD)

![alt text](MDD.png)
## Diagramme de séquence système (DSS)

![dss-CU05a](dss-CU05a.png)
![dss-CU05a](dss-CU05b.png)


## Contrats

CU05a1
Opération : addQuestionnaire()

Post Conditions :

-Un nouveau questionnaire a été crée
-Le questionnaire courant a été associé au cours courant
________________________________________________________________________

CU05a2 / CU05b1
Opération : getQuestionnaire()

Post Conditions :

-La liste de questionnaires du groupe courant a été affichés
________________________________________________________________________

CU05b2
Opération : recupererQuestionnaire()

Post Conditions : 

-Les attributs du questionnaire courant ont été affichés
_______________________________________________________________________

## Réalisation de cas d'utilisation (RDCU)

![RDCU-CU05a1](RDCU-CU05a-addQuestionnaire.png)
![RDCU-CU05a2](RDCU-CU05a-getQuestionnaires.png)
![RDCU-CU05b1](RDCU-CU05a-getQuestionnaires.png)
![RDCU-CU05b2](RDCU-CU05b-recupererQuestionnaire.png)

*** Nous n'avons pas de RDCU pour les opérations systèmes
selectCategories() car c'est simplement une sélection sur l'interface

### Diagramme de classe TPLANT
Le diagramme de classe TPLANT généré est une image trop grosse et pas claire, se qui la rend impossible à joindre au rapport de laboratoire. Par contre, celui-ci se trouve dans le dossier de l'itération #2, qui possède lui-même le rapport. Il est sous le nom : digramme-classes.puml. 
Ce que l'on remarque du diagramme de classe TPLANT est qu'il est similaire à notre MDD, puisqu'il utilise les mêmes classes avec les mêmes attributs. Toutefois, celui-ci possède plus de détails sur les classes qui ne seront pas démontré dans le MDD, comme les différentes méthodes ainsi que les getters/setters de chaque attribut.
  
## Retour sur la correction du rapport précédent
La note du rapport précédent était très haute, sauf a quelques choses pret. Premièrement, nous avions
des RDCU d'opérations systèmes qui était trop simples (c'était seulement quelque chose qu'on allait chercher
dans le controleur pour l'afficher) et nous avons perdus des points pour ces diagrammes. Donc, dans cette itération, nous avons omis ces RDCU (Le RDCU de selectCategories()). Ensuite, nous avons ajouté plus de détails sur l'usage de nos patrons GRASP (Contrôleur, Expert, etc.).
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
- [x] Vous avez un seul diagramme de classes
- [x] Vous avez remis la version PDF de ce document dans votre répertoire
- [x] [Vous avez regardé cette petite présentation pour l'architecture en couche et avez appliqué ces concepts](https://log210-cfuhrman.github.io/log210-valider-architecture-couches/#/) 