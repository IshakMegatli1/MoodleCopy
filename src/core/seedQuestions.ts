import { CoursGroupe } from "./coursGroupe";
import { Question } from "./question";

export function seedQuestionsIfEmpty(cours: CoursGroupe) {
  const existantes = cours.getQuestions?.() ?? [];
  if (existantes.length > 0) return;

  const data: Array<{ titre: string; categorie?: string; enonce?: string }> = [
    { titre: "Identifier les acteurs d’un CU",  categorie: "UML",  enonce: "Donnez 3 acteurs possibles pour CU05a." },
    { titre: "Frontières système",              categorie: "UML",  enonce: "Expliquer la frontière d’un système." },
    { titre: "Scénarios alternatifs",           categorie: "UML",  enonce: "Définir 2 extensions pour CU05a." },
    { titre: "Cycle Red-Green-Refactor",        categorie: "TDD",  enonce: "Décrire les 3 étapes avec un exemple." },
    { titre: "Doubles de test",                 categorie: "TDD",  enonce: "Différence entre stub et mock." },
    { titre: "Granularité des tests",           categorie: "TDD",  enonce: "Pourquoi viser de petits tests ?" },
    { titre: "Pattern Strategy – but",          categorie: "Design Patterns", enonce: "But et exemple concret." },
    { titre: "Observer – interactions",         categorie: "Design Patterns", enonce: "Rôle de Subject vs Observers." },
    { titre: "Command – undo/redo",             categorie: "Design Patterns", enonce: "Comment implémenter undo ?" },
    { titre: "Middleware Express",              categorie: "Node/Express",    enonce: "Ordre d’enregistrement et effet." },
    { titre: "Express urlencoded extended",     categorie: "Node/Express",    enonce: "extended=false vs true ?" },
    { titre: "Types vs Interfaces",             categorie: "TypeScript",      enonce: "Quand préférer l’un à l’autre ?" },
    { titre: "Clé primaire vs unique",          categorie: "BD",              enonce: "Différences et usages." },
    { titre: "Transactions – utilité",          categorie: "BD",              enonce: "Pourquoi les transactions ?" },
    { titre: "Postconditions CU05a",            categorie: "LOG210",          enonce: "Citez 2 postconditions à tester." },
    { titre: "Filtrage par catégorie",          categorie: "LOG210",          enonce: "Comment l’UI déclenche le filtre ?" },
    { titre: "Association multiples",           categorie: "LOG210",          enonce: "Ajouter N questions d’un coup." },
    { titre: "Qualité du code",                 categorie: "LOG210",          enonce: "3 pratiques d’amélioration." },
    { titre: "Revue de code – objectifs",       categorie: "LOG210",          enonce: "But d’une code review." },
    { titre: "Couverture de tests",             categorie: "LOG210",          enonce: "Limites de la couverture." },
  ];

  for (const d of data) {
    // ⚠️ utilise le vrai constructeur (7 args)
    const q = new Question(
      d.titre,                           // titre
      d.enonce ?? "Énoncé à compléter",  // description
      false,                             // reponse (par défaut)
      "Bonne réponse !",                 // texteVrai
      "Mauvaise réponse !",              // texteFaux
      d.categorie ?? "",                 // categorie
      cours.group_id ?? ""               // idGroupe si exposé, sinon ""
    );
    cours.addQuestion(q);
  }
}
