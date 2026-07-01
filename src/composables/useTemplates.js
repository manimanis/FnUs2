import { ref, onMounted } from 'vue';
import { useStorage } from './useStorage.js';

// Templates par défaut
const DEFAULT_TEMPLATES = [
  {
    id: 'basic',
    name: 'Structure de base',
    icon: '📄',
    description: ' squelette minimal d\'un programme ALGO++',
    code: `Var x, y: entier

Début
  x ← 0
  y ← 0
  // Votre code ici
  
Fin`
  },
  {
    id: 'function',
    name: 'Fonction',
    icon: '⚙️',
    description: 'Modèle pour créer une fonction',
    code: `Fonction nomFonction(param1: type): typeRetour
Var resultat: typeRetour
Début
  // Votre logique ici
  resultat ← param1
  Retourner resultat
Fin

Début
  // Appel de la fonction
  Ecrire(nomFonction(valeur))
Fin`
  },
  {
    id: 'procedure',
    name: 'Procédure',
    icon: '🔧',
    description: 'Modèle pour créer une procédure',
    code: `Procédure nomProcedure(param1: type)
Var variable: type
Début
  // Votre logique ici
  Ecrire("Message")
Fin

Début
  // Appel de la procédure
  nomProcedure(valeur)
Fin`
  },
  {
    id: 'loop-for',
    name: 'Boucle Pour',
    icon: '🔁',
    description: 'Modèle de boucle Pour',
    code: `Var i, n: entier
Début
  n ← 10
  Pour i de 0 à n-1 Faire
    Ecrire("Itération", i)
  Fin Pour
Fin`
  },
  {
    id: 'loop-while',
    name: 'Boucle Tant Que',
    icon: '🔂',
    description: 'Modèle de boucle Tant Que',
    code: `Var compteur: entier
Début
  compteur ← 0
  Tant Que compteur < 10 Faire
    Ecrire("Compteur:", compteur)
    compteur ← compteur + 1
  Fin Tant Que
Fin`
  },
  {
    id: 'condition',
    name: 'Condition Si',
    icon: '🔀',
    description: 'Modèle de condition Si/Sinon',
    code: `Var x: entier
Début
  x ← 5
  Si x > 0 Alors
    Ecrire("Positif")
  Sinon Si x < 0 Alors
    Ecrire("Négatif")
  Sinon
    Ecrire("Nul")
  Fin Si
Fin`
  },
  {
    id: 'array',
    name: 'Tableau',
    icon: '📊',
    description: 'Modèle avec tableau',
    code: `Type tab = tableau de 10 entier

Var tableau: tab; i: entier
Début
  // Remplissage
  Pour i de 0 à 9 Faire
    tableau[i] ← i * 2
  Fin Pour
  
  // Affichage
  Pour i de 0 à 9 Faire
    Ecrire("tab[", i, "] =", tableau[i])
  Fin Pour
Fin`
  },
  {
    id: 'input-output',
    name: 'Entrée/Sortie',
    icon: '💬',
    description: 'Modèle avec Lire/Ecrire',
    code: `Var nom: chaine; age: entier
Début
  Ecrire("Quel est votre nom?")
  Lire(nom)
  Ecrire("Quel est votre âge?")
  Lire(age)
  Ecrire("Bonjour", nom, "!")
  Ecrire("Vous avez", age, "ans")
Fin`
  }
];

export function useTemplates() {
  const { value: templates, save: saveTemplates } = useStorage(
    'algo-plus-plus-templates',
    DEFAULT_TEMPLATES,
    localStorage
  );

  const selectedTemplate = ref(null);

  // Charger les templates
  onMounted(() => {
    if (!templates.value || templates.value.length === 0) {
      templates.value = DEFAULT_TEMPLATES;
      saveTemplates();
    }
  });

  // Obtenir un template par ID
  function getTemplate(id) {
    return templates.value.find(t => t.id === id);
  }

  // Sélectionner un template
  function selectTemplate(id) {
    selectedTemplate.value = getTemplate(id);
    return selectedTemplate.value;
  }

  // Ajouter un template personnalisé
  function addTemplate(template) {
    const newTemplate = {
      id: `custom-${Date.now()}`,
      name: template.name || 'Template personnalisé',
      icon: template.icon || '📝',
      description: template.description || '',
      code: template.code || ''
    };
    templates.value.push(newTemplate);
    saveTemplates();
    return newTemplate;
  }

  // Modifier un template
  function updateTemplate(id, updates) {
    const index = templates.value.findIndex(t => t.id === id);
    if (index !== -1) {
      templates.value[index] = {
        ...templates.value[index],
        ...updates
      };
      saveTemplates();
      return templates.value[index];
    }
    return null;
  }

  // Supprimer un template
  function deleteTemplate(id) {
    const index = templates.value.findIndex(t => t.id === id);
    if (index !== -1) {
      templates.value.splice(index, 1);
      saveTemplates();
      return true;
    }
    return false;
  }

  // Réinitialiser aux templates par défaut
  function resetToDefaults() {
    templates.value = DEFAULT_TEMPLATES.map(t => ({ ...t }));
    saveTemplates();
  }

  // Dupliquer un template
  function duplicateTemplate(id) {
    const template = getTemplate(id);
    if (template) {
      return addTemplate({
        name: `${template.name} (copie)`,
        icon: template.icon,
        description: template.description,
        code: template.code
      });
    }
    return null;
  }

  return {
    templates,
    selectedTemplate,
    getTemplate,
    selectTemplate,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    resetToDefaults,
    duplicateTemplate
  };
}