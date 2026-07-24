import { ref, watch, onMounted, onUnmounted } from 'vue';

// Définitions des tooltips pour les mots-clés ALGO++
const KEYWORD_TOOLTIPS = {
  'Var': 'Déclare une ou plusieurs variables. Ex: Var x, y: entier',
  'Début': 'Marque le début du programme principal',
  'Fin': 'Marque la fin d\'un bloc (programme, fonction, procédure, condition, boucle)',
  'Si': 'Début d\'une condition. Syntaxe: Si condition Alors ... Sinon ... Fin Si',
  'Alors': 'Marque le début du bloc conditionnel',
  'Sinon': 'Marque le début du bloc alternatif',
  'Fin Si': 'Marque la fin d\'une condition',
  'Tant': 'Début d\'une boucle Tant Que. Syntaxe: Tant Que condition Faire ... Fin Tant Que',
  'Que': 'Partie condition de la boucle Tant Que',
  'Faire': 'Marque le début du corps de la boucle',
  'Fin Tant': 'Marque la fin d\'une boucle Tant Que',
  'Pour': 'Début d\'une boucle Pour. Syntaxe: Pour i de début à fin [Pas pas] Faire ... Fin Pour',
  'de': 'Indique le début de l\'intervalle dans une boucle Pour',
  'à': 'Indique la fin de l\'intervalle dans une boucle Pour',
  'Pas': 'Définit le pas d\'incrémentation dans une boucle Pour',
  'Fin Pour': 'Marque la fin d\'une boucle Pour',
  'Répéter': 'Début d\'une boucle Répéter. Syntaxe: Répéter ... Jusqu\'à condition',
  'Jusqu\'à': 'Condition d\'arrêt de la boucle Répéter',
  'Fonction': 'Définit une fonction. Syntaxe: Fonction nom(params): type ... Retourner ... Fin',
  'Procédure': 'Définit une procédure (fonction sans retour). Syntaxe: Procédure nom(params) ... Fin',
  'Retourner': 'Retourne une valeur depuis une fonction',
  'Ecrire': 'Affiche du texte/variables. Ex: Ecrire("Bonjour", x)',
  'Lire': 'Lit une valeur depuis l\'entrée. Ex: Lire(x)',
  '←': 'Opérateur d\'affectation. Equivalent à =',
  'entier': 'Type de données pour les nombres entiers',
  'reel': 'Type de données pour les nombres à virgule',
  'chaine': 'Type de données pour les chaînes de caractères',
  'caractere': 'Type de données pour un caractère unique',
  'booleen': 'Type de données booléen (Vrai/Faux)',
  'tableau': 'Type de données pour les tableaux. Ex: Type tab = tableau de 10 entier',
  'Vrai': 'Valeur booléenne true',
  'Faux': 'Valeur booléenne false',
  'et': 'Opérateur logique ET',
  'ou': 'Opérateur logique OU',
  'non': 'Opérateur logique NON',
  'mod': 'Opérateur modulo (reste de division)',
  'div': 'Division entière'
};

// Définitions des tooltips pour les fonctions intégrées
const FUNCTION_TOOLTIPS = {
  'Ent': 'Convertit un réel en entier (troncature). Ex: Ent(3.7) → 3',
  'Racine': 'Calcule la racine carrée. Ex: Racine(16) → 4',
  'aléa': 'Nombre aléatoire entier. Ex: aléa(1, 100) → nombre entre 1 et 100',
  'graine': 'Initialise la graine (seed) du générateur aléatoire. Ex: graine(42)',
  'long': 'Retourne la longueur d\'une chaîne. Ex: long("Bonjour") → 7',
  'sous_chaine': 'Extrait une sous-chaîne. Ex: sous_chaine("Bonjour", 0, 3) → "Bon"',
  'pos': 'Position d\'une sous-chaîne. Ex: pos("jour", "Bonjour") → 4',
  'valeur': 'Convertit une chaîne en nombre. Ex: valeur("42") → 42',
  'convch': 'Convertit un nombre en chaîne. Ex: convch(42) → "42"',
  'majus': 'Convertit en majuscules. Ex: majus("bonjour") → "BONJOUR"',
  'chr': 'Caractère depuis code ASCII. Ex: chr(65) → "A"',
  'ord': 'Code ASCII d\'un caractère. Ex: ord("A") → 65',
  'abs': 'Valeur absolue. Ex: abs(-5) → 5',
  'sin': 'Sinus (en radians). Ex: sin(0) → 0',
  'cos': 'Cosinus (en radians). Ex: cos(0) → 1',
  'tan': 'Tangente (en radians). Ex: tan(0) → 0',
  'arrondi': 'Arrondit un nombre. Ex: arrondi(3.7) → 4'
};

export function useTooltips() {
  const activeTooltip = ref(null);
  const tooltipPosition = ref({ x: 0, y: 0 });
  let tooltipElement = null;

  function getTooltip(word) {
    // Vérifier d'abord les mots-clés
    if (KEYWORD_TOOLTIPS[word]) {
      return {
        text: KEYWORD_TOOLTIPS[word],
        type: 'keyword'
      };
    }

    // Vérifier les fonctions (avec parenthèses ou non)
    const funcName = word.replace(/\(.*\)/, '');
    if (FUNCTION_TOOLTIPS[funcName]) {
      return {
        text: FUNCTION_TOOLTIPS[funcName],
        type: 'function'
      };
    }

    return null;
  }

  function showTooltip(word, event) {
    const tooltip = getTooltip(word);
    if (tooltip) {
      activeTooltip.value = tooltip;
      tooltipPosition.value = {
        x: event.clientX,
        y: event.clientY
      };
    }
  }

  function hideTooltip() {
    activeTooltip.value = null;
  }

  function moveTooltip(event) {
    if (activeTooltip.value) {
      tooltipPosition.value = {
        x: event.clientX,
        y: event.clientY
      };
    }
  }

  // Créer l'élément tooltip dans le DOM
  function createTooltipElement() {
    if (tooltipElement) return;

    tooltipElement = document.createElement('div');
    tooltipElement.className = 'algo-tooltip';
    tooltipElement.style.cssText = `
      position: fixed;
      z-index: 10000;
      background: var(--bg-card, #27273a);
      color: var(--text, #e0e0e0);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border, #3d3d5c);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      font-family: inherit;
      line-height: 1.5;
    `;

    const typeIndicator = document.createElement('div');
    typeIndicator.style.cssText = `
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
      font-weight: 600;
    `;

    const textElement = document.createElement('div');
    textElement.className = 'tooltip-text';

    tooltipElement.appendChild(typeIndicator);
    tooltipElement.appendChild(textElement);
    document.body.appendChild(tooltipElement);

    // Mettre à jour le contenu quand le tooltip change
    watch(activeTooltip, (newTooltip) => {
      if (newTooltip && tooltipElement) {
        typeIndicator.textContent = newTooltip.type === 'keyword' ? '🔑 Mot-clé' : '⚡ Fonction';
        typeIndicator.style.color = newTooltip.type === 'keyword' ? 'var(--keyword, #bb86fc)' : 'var(--function, #82aaff)';
        textElement.textContent = newTooltip.text;

        tooltipElement.style.left = `${tooltipPosition.value.x + 10}px`;
        tooltipElement.style.top = `${tooltipPosition.value.y + 10}px`;
        tooltipElement.style.opacity = '1';
      } else if (tooltipElement) {
        tooltipElement.style.opacity = '0';
      }
    });
  }

  onMounted(() => {
    createTooltipElement();
    document.addEventListener('mousemove', moveTooltip);
  });

  onUnmounted(() => {
    if (tooltipElement) {
      document.body.removeChild(tooltipElement);
      tooltipElement = null;
    }
    document.removeEventListener('mousemove', moveTooltip);
  });

  return {
    activeTooltip,
    showTooltip,
    hideTooltip,
    getTooltip
  };
}