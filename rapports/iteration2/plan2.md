# Plan d'itération 1 

## Étapes jalons

| Étape jalon          | Date       |
| :------------------- | :--------- |
| Début de l'itération | 2025/10/22 |
| Démo (séance 5)      | 2025/11/05 |
| Fin de l'itération   | 2025/11/05 |

## Objectifs clés
- Présenter une démonstration technique de CU05a avec tests (2 points).
- Présenter une démonstration technique de CU05b (question vrai ou faux) avec tests (1 points).

## Affectations d'éléments de travail

Les éléments de travail suivants seront abordés dans cette itération:

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

## Problèmes
| Problème                                                                                             | Notes |
| ---------------------------------------------------------------------------------------------------- | ----- |
| Changement du nom de la classe SGB à Facade                                                          | ----- |

## Critères d'évaluation

- 90% des cas de test passent.
- Démonstration des fonctionnalités CU05a et CU05b pas à pas avec l'auxiliaire d'enseignement a reçu une réponse favorable.

## Évaluation

> Utiliser cette section pour la saisie et la communication des résultats et les actions des évaluations, qui sont généralement faites à la fin de chaque itération. Si vous ne le faites pas, l'équipe ne peut pas être en mesure d'améliorer la façon dont elle développe des logiciels.
> **Note:** cette section est complétée seulement après l'évaluation faite par l'auxiliaire d'enseignement, lors de la démo en lab.

<!-- GitHub ne supporte pas les tables sans en-tête: https://stackoverflow.com/a/17543474/1168342 -->
| Résumé | |
| ------------------------------------- | ------------------------------------------------------------------------ |
| Cible d'évaluation                    | Itération <!-- *Cela pourrait être toute l'itération ou simplement un composant spécifique* -->                            |
| Date d'évaluation  |   2025/11/05 |
| Participants       | **Coéquipiers** : Philippe, Ishak, Daniel, Marc-Sheldon<br> **Auxiliaire d'enseignement** : Moustavi-Al-Manee Haque |
| État du projet     | 🟢 <!-- 🔴🟠🟢 *Rouge, Orange, ou Vert.* --> |

### Questions d'évaluation
Regardez votre diagramme TPLANT et répondez aux questions suivantes?
1. Est-ce qu'il y a un décalage de représentation?
   Dans notre situation, non, parce que notre diagramme MDD et le diagramme généré par TPLANT possèdent les mêmes classes et attributs. 
  - Est-ce que tous les noms de classe ont un rapport avec le domaine?
   Oui, les noms de classes sont cohérents avec le domaine, à l’exception de certains contrôleurs dont les noms sont trop explicites (par exemple : ControleurEnseignant, etc.).

2. Est-ce que l'architecture en couche est respectée?
   - Est-ce que les contrôleurs GRASP sont bien identifiés?
   Oui, puisque l'entièreté de nos contrôleurs sont biens identifiés dans nos différents RDCU et dans le MDD.
   - Est-ce que les paramètres des opérations système sont tous de type primitif ou sont des objets de paramètres de type primitif?
   Oui, car même les objets qui ne sont pas de type primitif sont seulement constitué d'attributs de type primitif (ex: CoursGroupe).
   - Est-ce que vous avez un fichier de route par contrôleur?
   Oui, chaque contrôleur possède son propre fichier de route (par exemple: ControleurEnseignant --> routeurEnseignant).
         
3. Évaluer votre conception par rapport aux GRASP "forte cohésion" et "faible couplage"
   - Avez-vous des classes qui sont couplées avec "beaucoup" d'autres classes?
   Non, toutes les classes ont une ou deux associations au maximum.
   - Avez-vous des classes qui ont beaucoup de responsabilités (d'opérations)?
   Non, toutes les classes principales (principalement les contrôleurs) ont leurs propres responsabilités logiques, elles ne font pas de choses qui ne leur devrait pas être attribué logiquement. 

4. Y a-t-il des problèmes de Code smell à identifier avec l'aide de TPLANT
   1. Mysterious name relié au décalage des représentations ou pas
      1. Identifier le renommage (réusinage) éventuel de classe et/ou méthodes.
      Oui, notre classe SGB devrait avoir un autre nom, par exemple "Facade" pour qu'elle soit cohérente avec nos RDCUs (nous avons changé le nom dans les RDCU, mais toujours pas dans le code).
   2. Large class (cohésion)
      1. Proposer d'appliquer le réusinage Extract class / GRAPS fabrication pure. 
      Pas applicable dans notre situation.
   3. Trop de paramètres (4+)
      1. Proposer d'appliquer le réusinage Objet de paramètre.
      Les classes Question et CoursGroupe sont les classes qui possèdent le plus de paramètres. Par contre, pour ces deux classes, l'entièreté des paramètres sont nécessaires pour répondre aux besoins des cas d'utlisation.
   
### Évaluation par rapport aux objectifs

> Documentez si vous avez abordé les objectifs précisés dans le plan d'itération. *(on reprend les objectifs)*

- Résoudre les problèmes de la dernière itération soulevés par l'auxiliaire d'enseignement.
  - La rétroaction de l'auxiliaire d'enseignement a été positive. Bon travail l'équipe!
- Présenter une démonstration technique.
  - Le CU05a et CU05b a été convaincant pour l'auxiliaire d'enseignement.

- Présenter une démonstration technique de CU05a et CU05b avec tests
   - Le CU05 au complet a été convaincant pour l’auxiliaire, aucun commentaire a ajouté.

### Éléments de travail: prévus vs réalisés

Tous les éléments du CU05a et CU05b ont été complétés.

### Évaluation par rapport aux résultats selon les critères d'évaluation

La démonstration du CU05a et CU05b avec l'auxiliaire a été bien accueilli, aucun commentaire a ajouté.

## Autres préoccupations et écarts

> Documentez d'autres domaines qui ont été évalués, tels que la finance ou un type de programme, ainsi que la rétroaction des intervenants qui n'a pas été saisie ailleurs

Dans notre équipe, il n'y a aucune situation du genre qui est survenue. 

## Évaluation du travail d'équipe

> Évaluez la contribution de chaque membre de l'équipe au projet durant l'itération. Pour vous aider, utilisez `gitinspector` (voir les notes du cours). Toutefois, tenez aussi compte des éléments qui ne peuvent être évalués par l'outil (apprentissage, connaissances préalables, etc.)

Selon les statistiques générées par `gitinspector` Pierre et Jérémie font 90 % de la programmation et les deux autres membres doivent contribuer plus. Voir le script contribution.sh dans le répertoire scripts du projet.

Pour la deuxième itération, GitInspector ne constitue pas un outil fiable, puisque chaque cooéquipier travaillait dans une branche différence et sur des aspects différents du travail (analyse, conception, programmation, plan d’itération, rapport, etc.). Toutefois, tous les membres de l’équipe ont contribué de manière significative au travail.

### Retrait d'un membre de l'équipe pour contribution non significative

- C'est ici que vous mettez le nom de la personne ainsi que les raisons du retrait. Cette section doit nécessairement inclure une liste d'objectifs que cette personne doit respecter pour pouvoir s'assurer de faire partie de l'itération suivante. 

Pas applicable dans notre situation.

---

<a name="commentPlanifier">Comment planifier une itération selon le
    processus unifié :</a>
    <https://etsmtl365-my.sharepoint.com/:w:/g/personal/christopher_fuhrman_etsmtl_ca/EWVA3MlzFHdElIMlduUvg6oBSAlrgHO7hjM2J93D1LGPSg?e=kCbXch>

<a name="commentEstimer">Comment estimer la taille :</a>
    <https://etsmtl365-my.sharepoint.com/:w:/g/personal/christopher_fuhrman_etsmtl_ca/EaEe2fDK94RAkfWthKX1pr4B7KBgbD9BW4UMrzwtQzOrkg?e=XMf4IK>