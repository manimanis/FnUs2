// src/codemirror/snippets.js

import { snippetCompletion } from "@codemirror/autocomplete";

export const snippets = [
  snippetCompletion(
    `Si \${1:a > 0} Alors
  \${2}
Fin Si`,
    {
      label: "si - finsi",
      type: "keyword",
      info: "Structure Si"
    }
  ),

  snippetCompletion(
    `Si \${1:a > 0} Alors
  \${2}
Sinon
  \${3}
Fin Si`,
    {
      label: "si - sinon - finsi",
      type: "keyword",
      info: "Structure Si avec Sinon"
    }
  ),

  snippetCompletion(`Si \${1:a > 0} Alors
  \${2}
Sinon Si \${3:a < 0} Alors
  \${4}
Sinon
  \${5}
Fin Si`,
    {
      label: "si - sinon si - sinon - finsi",
      type: "keyword",
      info: "Structure Si avec Sinon Si"
    }),

  snippetCompletion(
    `Pour \${1:i} de \${2:0} à \${3:n-1} Faire
  \${4}
Fin Pour`,
    {
      label: "pour pas = 1",
      type: "keyword",
      info: "Structure Pour avec increment 1"
    }
  ),

  snippetCompletion(
    `Pour \${1:i} de \${2:n-1} à \${3:0} Pas \${4:-1} Faire
  \${5}
Fin Pour`,
    {
      label: "pour pas = -1",
      type: "keyword",
      info: "Structure Pour avec decrement 1"
    }
  ),

  snippetCompletion(
    `Répéter
  \${1}
Jusqu'à \${2:x > 0}`,
    {
      label: "repeter",
      type: "keyword"
    }
  ),

  snippetCompletion(
    `Tant Que \${1:x > 0} Faire
  \${2}
Fin TantQue`,
    {
      label: "tantque",
      type: "keyword"
    }
  ),

  snippetCompletion(
    `Fonction \${1:nom}(\${2:n}: \${3:entier}):\${4:entier}
Début
  \${5}
  Retourner \${6:0}
Fin`,
    {
      label: "fonction",
      type: "keyword"
    }
  ),

  snippetCompletion(
    `Procédure \${1:nom}(\${2:n}: \${3:entier})
Début
  \${4}
Fin`,
    {
      label: "procedure",
      type: "keyword"
    }
  ),
];

const keywords = [
  'Début', 'Debut', 'Fin', 'Si', 'Alors', 'Sinon',
  'Tant', 'Que', 'Faire', 'Pour', 'Pas',
  'Répéter', 'Repeter', 'Jusqu\'à', 'Jusqu_a',
  'Fonction', 'Fonction', 'Procédure', 'Procedure', 'Retourner',
  'Var', 'Type', 'De',
  'Et', 'Ou', 'Non', 'Mod', 'Div'
];

const builtInFunctions = [
  'Ecrire(n)', 'Lire(n)',
  'Long(ch)', 'Sous_chaine(ch, d, f)', 'Effacer(ch, d, f)', 'Pos(ch1, ch2)', 'Valeur(ch)', 
  'Convch(n)', 'Majus(ch)', 'Chr(code)', 'Ord(car)',
  'Abs(x)', 'Sin(x)', 'Cos(x)', 'Tan(x)', 'Alea(d, f)', 'Arrondi(x)', 'Ent(x)', 'Racine(x)'
];

export function mySnippetsCompletion(context) {
  let word = context.matchBefore(/\w*/);

  if (!word || (word.from === word.to && !context.explicit)) {
    return null;
  }

  const input = word.text.toLowerCase();

  // fusion snippets + mots clés
  const options = [
    ...snippets,
    ...keywords.map(keyword => ({
      label: keyword,
      type: "keyword",
      info: "Mot-clé"
    })),
    ...builtInFunctions.map(func => ({
      label: func,
      type: "function",
      info: "Fonction prédéfinie"
    }))
  ].filter(item =>
    item.label.toLowerCase().startsWith(input)
  );

  if (options.length === 0) return null;

  return {
    from: word.from,
    options
  };

}