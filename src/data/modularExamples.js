export const modularExamples = [
  {
    name: 'Fibonacci (récursif)',
    icon: '🌀',
    code: `Fonction fib(n: entier): entier
Début
  Si n <= 1 Alors
    Retourner n
  Sinon
    Retourner fib(n-1) + fib(n-2)
  Fin Si
Fin

Var i: entier
Début
  Ecrire("Suite de Fibonacci (récursif):")
  Pour i de 0 à 10 Faire
    Ecrire("fib(", i, ") =", fib(i))
  Fin Pour
Fin`
  },
  {
    name: 'PGCD & PPCM (Euclide)',
    icon: '🔢',
    code: `Fonction pgcd(a, b: entier): entier
Var r: entier
Début
  Tant Que b != 0 Faire
    r ← a mod b
    a ← b
    b ← r
  Fin Tant Que
  Retourner a
Fin

Fonction ppcm(a, b: entier): entier
Début
  Retourner (a * b) / pgcd(a, b)
Fin

Var x, y: entier
Début
  x ← 48; y ← 36
  Ecrire("PGCD(", x, ",", y, ") =", pgcd(x, y))
  Ecrire("PPCM(", x, ",", y, ") =", ppcm(x, y))
Fin`
  },
  {
    name: 'Tri par sélection',
    icon: '📊',
    code: `Type tab = tableau de 10 entier

Procédure Remplir(@t: tab, n: entier)
Var i : entier
Début
  Pour i de 0 à n-1 Faire
    t[i] ← aléa(10, 99)
  Fin Pour
Fin

Procédure Afficher(t: tab, n: entier)
Var i : entier
Début
  Pour i de 0 à n-1 Faire
    Ecrire(t[i])
  Fin Pour
Fin

Procédure Permuter(@a: entier, @b: entier)
Début
  tmp ← a ; a ← b ; b ← tmp
Fin

Procédure trierTableau(t: tab; n: entier)
Var i, j, min, temp: entier
Début
  Pour i de 0 à n-2 Faire
    min ← i
    Pour j de i+1 à n-1 Faire
      Si t[j] < t[min] Alors
        min ← j
      Fin Si
    Fin Pour
    Permuter(t[i], t[min])
  Fin Pour
Fin

Var arr: tab; i: entier
Début
  Remplir(arr, 10)
  Ecrire("Avant tri:")
  Afficher(arr, 10)
  trierTableau(arr, 10)
  Ecrire("Après tri:")
  Afficher(arr, 10)
Fin`
  },
  {
    name: 'Recherche dichotomique',
    icon: '🔍',
    code: `Type tab = tableau de 10 entier

Fonction rechercher(t: tab, val: entier): entier
Var d, f, milieu: entier
Début
  d ← 0; f ← 9
  Tant Que d <= f Faire
    milieu ← (d + f) div 2
    Si t[milieu] = val Alors
      Retourner milieu
    Sinon Si t[milieu] < val Alors
      d ← milieu + 1
    Sinon
      f ← milieu - 1
    Fin Si
  Fin Tant Que
  Retourner -1
Fin

Var tab: tab; i, pos: entier
Début
  Pour i de 0 à 9 Faire
    tab[i] ← i * 3
  Fin Pour
  Ecrire("Tableau trié:")
  Pour i de 0 à 9 Faire
    Ecrire("tab[", i, "] =", tab[i])
  Fin Pour
  pos ← rechercher(tab, 15)
  Si pos >= 0 Alors
    Ecrire("Valeur 15 trouvée à l'indice", pos)
  Sinon
    Ecrire("Valeur 15 non trouvée")
  Fin Si
Fin`
  },
  {
    name: 'Statistiques sur tableau',
    icon: '📈',
    code: `Type tab = tableau de 10 entier

Fonction sommeTab(t: tab): entier
Var i, s: entier
Début
  s ← 0
  Pour i de 0 à 9 Faire
    s ← s + t[i]
  Fin Pour
  Retourner s
Fin

Fonction minTab(t: tab): entier
Var i, m: entier
Début
  m ← t[0]
  Pour i de 1 à 9 Faire
    Si t[i] < m Alors
      m ← t[i]
    Fin Si
  Fin Pour
  Retourner m
Fin

Fonction maxTab(t: tab): entier
Var i, m: entier
Début
  m ← t[0]
  Pour i de 1 à 9 Faire
    Si t[i] > m Alors
      m ← t[i]
    Fin Si
  Fin Pour
  Retourner m
Fin

Fonction moyenneTab(t: tab): réel
Début
  Retourner sommeTab(t) / 10
Fin

Var tab: tab; i: entier
Début
  Pour i de 0 à 9 Faire
    tab[i] ← (i * 7 + 3) % 20
  Fin Pour
  Ecrire("Tableau:")
  Pour i de 0 à 9 Faire
    Ecrire("tab[", i, "] =", tab[i])
  Fin Pour
  Ecrire("Somme:", sommeTab(tab))
  Ecrire("Min:", minTab(tab))
  Ecrire("Max:", maxTab(tab))
  Ecrire("Moyenne:", moyenneTab(tab))
Fin`
  },
  {
    name: 'Nombres premiers',
    icon: '🔬',
    code: `Fonction estPremier(n: entier): booleen
Var i, mx: entier
    test: booleen
Début
  Si n < 2 Alors
    test ← Faux
  Sinon Si n = 2 ou n = 3 Alors
    test ← Vrai
  Sinon Si n mod 2 = 0 ou n mod 3 = 0 Alors
    test ← Faux
  Sinon
    test ← Vrai
  Fin Si
  i ← 5
  mx ← Ent(Racine(n) + 1) 
  Tant Que test et i <= mx  Faire
    test ← n mod i != 0
    i ← i + 2
  Fin Tant Que
  Retourner test
Fin

Procédure afficherPremiers(limite: entier)
Var i: entier
Début
  Ecrire("Nombres premiers jusqu'à", limite, ":")
  Pour i de 2 à limite Faire
    Si estPremier(i) Alors
      Ecrire(i)
    Fin Si
  Fin Pour
Fin

Procédure afficherNombresPremiersJusquA(limite: entier)
Var i: entier
Début
  Ecrire("Liste des nombres premiers jusqu'à", limite, ":")
  Pour i de 2 à limite Faire
    Si estPremier(i) Alors
      Ecrire(i, "est premier")
    Sinon
      Ecrire(i, "n'est pas premier")
    Fin Si
  Fin Pour
Fin

Var nombre: entier
Début
  nombre ← 37
  Si estPremier(nombre) Alors
    Ecrire(nombre, "est premier")
  Sinon
    Ecrire(nombre, "n'est pas premier")
  Fin Si
  afficherPremiers(150)
Fin`
  },
  {
    name: 'Manipulation de chaînes',
    icon: '📝',
    code: `Fonction compterVoyelles(ch: chaine): entier
Var i, cpt: entier; car: caractere
Début
  cpt ← 0
  Pour i de 0 à long(ch)-1 Faire
    car ← ch[i]
    Si car = "a" Ou car = "e" Ou car = "i"
       Ou car = "o" Ou car = "u" Ou car = "y"
       Ou car = "A" Ou car = "E" Ou car = "I"
       Ou car = "O" Ou car = "U" Ou car = "Y" Alors
      cpt ← cpt + 1
    Fin Si
  Fin Pour
  Retourner cpt
Fin

Fonction inverserChaine(ch: chaine): chaine
Var i: entier; res: chaine
Début
  res ← ""
  Pour i de long(ch)-1 à 0 Pas -1 Faire
    res ← res + ch[i]
  Fin Pour
  Retourner res
Fin

Fonction estPalindrome(ch: chaine): booleen
Var i: entier
Début
  Pour i de 0 à long(ch) / 2 Faire
    Si ch[i] != ch[long(ch) - 1 - i] Alors
      Retourner Faux
    Fin Si
  Fin Pour
  Retourner Vrai
Fin

Fonction compterMots(ch: chaine): entier
Var i, cpt: entier; dansMot: booleen
Début
  cpt ← 0
  dansMot ← Faux
  Pour i de 0 à long(ch)-1 Faire
    Si ch[i] != " " Alors
      Si dansMot = Faux Alors
        cpt ← cpt + 1
        dansMot ← Vrai
      Fin Si
    Sinon
      dansMot ← Faux
    Fin Si
  Fin Pour
  Retourner cpt
Fin

Var texte: chaine
Début
  texte ← "Algorithmique"
  Ecrire("Texte:", texte)
  Ecrire("Longueur:", long(texte))
  Ecrire("Nombre de voyelles:", compterVoyelles(texte))
  Ecrire("Inversé:", inverserChaine(texte))
  Ecrire("Est palindrome:", estPalindrome(texte))
  Ecrire("Nombre de mots:", compterMots("Bonjour le monde"))
Fin`
  },
  {
    name: 'Exponentiation rapide',
    icon: '⚡',
    code: `Fonction puissance(base, exp: entier): entier
Début
  Si exp = 0 Alors
    Retourner 1
  Sinon Si exp % 2 = 0 Alors
    Retourner puissance(base * base, exp / 2)
  Sinon
    Retourner base * puissance(base, exp - 1)
  Fin Si
Fin

Fonction sommePuissances(n, max: entier): entier
Var i, s: entier
Début
  s ← 0
  Pour i de 0 à max Faire
    s ← s + puissance(n, i)
  Fin Pour
  Retourner s
Fin

Fonction factorielle(n: entier): entier
Début
  Si n <= 1 Alors
    Retourner 1
  Sinon
    Retourner n * factorielle(n - 1)
  Fin Si
Fin

Fonction fibonacciIteratif(n: entier): entier
Var i, a, b, temp: entier
Début
  a ← 0
  b ← 1
  Pour i de 2 à n Faire
    temp ← a + b
    a ← b
    b ← temp
  Fin Pour
  Retourner b
Fin

Var resultat: entier
Début
  resultat ← puissance(2, 10)
  Ecrire("2^10 =", resultat)
  Ecrire("Somme 2^0 + 2^1 + ... + 2^5 =", sommePuissances(2, 5))
  Ecrire("Factorielle de 6 =", factorielle(6))
  Ecrire("Fibonacci(10) itératif =", fibonacciIteratif(10))
Fin`
  },
  {
    name: 'Tri à bulles',
    icon: '🫧',
    code: `Type tab = tableau de 15 entier

Procédure Remplir(@t: tab, n: entier)
Var i : entier
Début
  Pour i de 0 à n-1 Faire
    t[i] ← aléa(10, 99)
  Fin Pour
Fin

Procédure Afficher(t: tab, n: entier)
Var i : entier
Début
  Pour i de 0 à n-1 Faire
    Ecrire(t[i])
  Fin Pour
Fin

Procédure trierBulles(@t: tab; n: entier)
Var i, j: entier
Début
  Pour i de 0 à n-2 Faire
    Pour j de 0 à n-i-2 Faire
      Si t[j] > t[j+1] Alors
        Permuter(t[j], t[j+1])
      Fin Si
    Fin Pour
  Fin Pour
Fin

Procédure Permuter(@a: entier, @b: entier)
Début
  tmp ← a ; a ← b ; b ← tmp
Fin

Var arr: tab; i: entier
Début
  Remplir(arr, 15)
  Ecrire("Avant tri:")
  Afficher(arr, 15)
  trierBulles(arr, 15)
  Ecrire("Après tri:")
  Afficher(arr, 15)
Fin`
  },
  {
    name: 'Suite arithmétique',
    icon: '📐',
    code: `Fonction sommeArithmetique(a1, n, r: entier): entier
Var i, s: entier
Début
  s ← 0
  Pour i de 0 à n-1 Faire
    s ← s + a1 + i * r
  Fin Pour
  Retourner s
Fin

Fonction estArithmetique(t: tab, n: entier): booleen
Var i: entier
Début
  Si n < 2 Alors
    Retourner Vrai
  Fin Si
  Pour i de 2 à n-1 Faire
    Si t[i] - t[i-1] != t[1] - t[0] Alors
      Retourner Faux
    Fin Si
  Fin Pour
  Retourner Vrai
Fin

Fonction termeArithmetique(a1, n, r: entier): entier
Début
  Retourner a1 + (n - 1) * r
Fin

Var suite: tab; i: entier
Début
  suite[0] ← 3
  suite[1] ← 7
  suite[2] ← 11
  suite[3] ← 15
  suite[4] ← 19
  
  Ecrire("Suite arithmétique:")
  Pour i de 0 à 4 Faire
    Ecrire("u", i, "=", suite[i])
  Fin Pour
  
  Ecrire("Raison:", suite[1] - suite[0])
  Ecrire("Somme des 5 premiers termes:", sommeArithmetique(3, 5, 4))
  Ecrire("10ème terme:", termeArithmetique(3, 10, 4))
Fin`
  },
  {
    name: 'Jeu de devinette',
    icon: '🎮',
    code: `Fonction devinerNombre(): entier
Var secret, essai, tentatives: entier
Début
  secret ← aléa(1, 100)
  tentatives ← 0
  Ecrire("Devinez le nombre secret (entre 1 et 100)!")
  
  Répéter
    Ecrire("Votre essai:")
    Lire(essai)
    tentatives ← tentatives + 1
    
    Si essai < secret Alors
      Ecrire("Trop petit!")
    Sinon Si essai > secret Alors
      Ecrire("Trop grand!")
    Sinon
      Ecrire("Bravo! Vous avez trouvé en", tentatives, "tentatives")
    Fin Si
  Jusqu'à essai = secret
  
  Retourner tentatives
Fin

Début
  Ecrire("=== JEU DE DEVINETTE ===")
  devinerNombre()
Fin`
  },
  {
    name: 'Calculatrice',
    icon: '🔢',
    code: `Procédure afficherMenu()
Début
  Ecrire("=== CALCULATRICE ===")
  Ecrire("1. Addition")
  Ecrire("2. Soustraction")
  Ecrire("3. Multiplication")
  Ecrire("4. Division")
  Ecrire("5. Puissance")
  Ecrire("6. Quitter")
Fin

Fonction addition(a, b: entier): entier
Début
  Retourner a + b
Fin

Fonction soustraction(a, b: entier): entier
Début
  Retourner a - b
Fin

Fonction multiplication(a, b: entier): entier
Début
  Retourner a * b
Fin

Fonction division(a, b: entier): réel
Début
  Si b = 0 Alors
    Retourner 0
  Fin Si
  Retourner a / b
Fin

Fonction puissance(base, exp: entier): entier
Début
  Si exp = 0 Alors
    Retourner 1
  Fin Si
  Retourner base * puissance(base, exp - 1)
Fin

Var choix, a, b: entier
Début
  Répéter
    afficherMenu()
    Ecrire("Votre choix:")
    Lire(choix)
    
    Si choix >= 1 Et choix <= 5 Alors
      Ecrire("Premier nombre:")
      Lire(a)
      Ecrire("Deuxième nombre:")
      Lire(b)
      
      Si choix = 1 Alors
        Ecrire("Résultat:", addition(a, b))
      Sinon Si choix = 2 Alors
        Ecrire("Résultat:", soustraction(a, b))
      Sinon Si choix = 3 Alors
        Ecrire("Résultat:", multiplication(a, b))
      Sinon Si choix = 4 Alors
        Ecrire("Résultat:", division(a, b))
      Sinon Si choix = 5 Alors
        Ecrire("Résultat:", puissance(a, b))
      Fin Si
    Fin Si
  Jusqu'à choix = 6
  
  Ecrire("Au revoir!")
Fin`
  }
];