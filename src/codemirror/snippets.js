// src/codemirror/snippets.js

import { snippetCompletion } from "@codemirror/autocomplete";

export const snippets = [
  snippetCompletion(
    `Type \${1:tab} = tableau de \${2:20} \${3:entier}`,
    {
      label: "type tableau",
      type: "keyword",
      info: "Déclaration d'un tableau"
    }
  ),

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

  snippetCompletion(
    `Procédure Saisir(@n: entier)
Début
  Répéter
    Ecrire("Entrez un entier : ");
    Lire(n);
  Jusqu'à n > 0
Fin`,
    {
      label: "saisir",
      type: "keyword",
      info: "Saisir un entier"
    }
  ),

  snippetCompletion(
    `Procédure Remplir(@t: tab, n: entier)
Var i: entier
Début
  Pour i de 0 à n-1 Faire
    Ecrire("t[", i, "] = ");
    Lire(t[i]);
  Fin Pour
Fin`,
    {
      label: "remplir",
      type: "keyword",
      info: "Remplir un tableau"
    }
  ),

  snippetCompletion(
    `Procédure Afficher(t: tab, n: entier)
Var i: entier
Début
  Pour i de 0 à n-1 Faire
    Ecrire(t[i], fin=" ");
  Fin Pour
Fin`,
    {
      label: "afficher",
      type: "keyword",
      info: "Afficher un tableau"
    }
  ),

  snippetCompletion(
    `Fonction Premier(n: entier): booléen
Var i: entier
    test: booléen
Début
  test ← n >= 2
  i ← 2
  Tant Que i * i ≤ n Et test Faire
    test ← n mod i ≠ 0
    i ← i + 1
  Fin Tant Que
  Retourner test
Fin`,
    {
      label: "premier",
      type: "keyword",
      info: "Vérifier si un nombre est premier"
    }
  ),

  snippetCompletion(
    `Fonction SemiPremier(n: entier): booléen
Var i: entier
    test: booléen
Début
  test ← Faux
  i ← 2
  Tant Que i * i ≤ n Et non test Faire
    test ← n mod i = 0 et Premier(i) et Premier(n div i)
    i ← i + 1
  Fin Tant Que
  Retourner test
Fin`,
    {
      label: "semipremier",
      type: "keyword",
      info: "Vérifier si un nombre est semi-premier"
    }
  ),

  snippetCompletion(
    `Fonction Rechercher(v: entier, t: tab, n: entier): entier
Var i, p: entier
    test: booléen
Début
  p ← -1
  i ← 0
  Tant Que i < n Et p = -1 Faire
    Si t[i] = v Alors
      p ← i
    Fin Si
    i ← i + 1
  Fin Tant Que
  Retourner p
Fin`,
    {
      label: "rechercher",
      type: "keyword",
      info: "Rechercher un élément dans un tableau"
    }
  ),

  snippetCompletion(
    `Fonction Somme(t: tab, n: entier): entier
Var i, s: entier
Début
  s ← 0
  Pour i de 0 à n-1 Faire
    s ← s + t[i]
  Fin Pour
  Retourner s
Fin`,
    {
      label: "somme",
      type: "keyword",
      info: "Calculer la somme des éléments d'un tableau"
    }
  ),

  snippetCompletion(
    `Procédure TriBulles(@t: tab, n: entier)
Var i, j, temp: entier
    trié: booléen
Début
  Répéter
    trié ← Vrai
    Pour i de 0 à n-2-i Faire
      Si t[i] > t[i+1] Alors
        temp ← t[i]
        t[i] ← t[i+1]
        t[i+1] ← temp
        trié ← Faux
      Fin Si
    Fin Pour
  Jusqu'à trié
Fin`,
    {
      label: "tribulles",
      type: "keyword",
      info: "Trier un tableau par méthode du tri à bulles"
    }
  ),

  snippetCompletion(
    `Procédure TriSelection(@t: tab, n: entier)
Var i, j, min, temp: entier
Début
  Pour i de 0 à n-2 Faire
    min ← i
    Pour j de i+1 à n-1 Faire
      Si t[j] < t[min] Alors
        min ← j
      Fin Si
    Fin Pour
    Si min ≠ i Alors
      temp ← t[i]
      t[i] ← t[min]
      t[min] ← temp
    Fin Si
  Fin Pour
Fin`,
    {
      label: "triselection",
      type: "keyword",
      info: "Trier un tableau par méthode du tri par sélection"
    }
  ),

  snippetCompletion(
    `Procédure TriInsertion(@t: tab, n: entier)
Var i, j, temp: entier
    trié: booléen
Début
  Pour i de 1 à n-1 Faire
    temp ← t[i]
    j ← i - 1
    Tant Que j >= 0 Et t[j] > temp Faire
      t[j+1] ← t[j]
      j ← j - 1
    Fin Tant Que
    t[j+1] ← temp
  Fin Pour
Fin`,
    {
      label: "triinsertion",
      type: "keyword",
      info: "Trier un tableau par méthode du tri par insertion"
    }
  ),

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