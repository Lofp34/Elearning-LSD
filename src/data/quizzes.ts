export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
};

export type Quiz = {
  title: string;
  questions: QuizQuestion[];
};

export const QUIZZES: Record<string, Quiz> = {
  "elearning1-01-posture-service": {
    title: "Posture de service",
    questions: [
      {
        question: "Quel est l'etat d'esprit de vente presente en ouverture ?",
        options: [
          "Convaincre a tout prix",
          "Aider a decider",
          "Negocier le prix",
          "Accelere le closing",
        ],
        answerIndex: 1,
      },
      {
        question: "Quel est le role du commercial selon la video ?",
        options: [
          "Forcer la decision",
          "Clarifier pour aider a choisir",
          "Presenter toutes les options sans guider",
          "Parler le plus possible",
        ],
        answerIndex: 1,
      },
      {
        question: "Quel exemple d'intention visible est donne ?",
        options: [
          "Je veux vendre vite",
          "Je veux comprendre avant de proposer",
          "Je promets le meilleur prix",
          "Je suis le moins cher",
        ],
        answerIndex: 1,
      },
      {
        question: "La neutralite active signifie que vous...",
        options: [
          "Evitez de repondre",
          "Acceptez le non du client",
          "Ignorez les objections",
          "Changez de sujet",
        ],
        answerIndex: 1,
      },
      {
        question: "Dans l'exemple immobilier, que dit le commercial ?",
        options: [
          "Mon but est de vous faire signer",
          "Mon but est de voir si ce bien correspond a votre projet",
          "Je ne peux pas vous aider",
          "Je propose uniquement cette option",
        ],
        answerIndex: 1,
      },
    ],
  },
  "elearning1-02-confiance-calme": {
    title: "Confiance calme",
    questions: [
      {
        question: "Selon la video, la confiance est surtout...",
        options: ["Du bruit", "Du calme", "De l'humour", "De la vitesse"],
        answerIndex: 1,
      },
      {
        question: "Quel signal de confiance est cite ?",
        options: [
          "Parler plus fort",
          "Dire 'je ne sais pas, je verifie'",
          "Promettre des resultats",
          "Changer de sujet",
        ],
        answerIndex: 1,
      },
      {
        question: "Avant l'entretien, que faut-il faire ?",
        options: [
          "Improviser",
          "Se rappeler 2 cas clients reussis",
          "Eviter toute preparation",
          "Se concentrer sur la concurrence",
        ],
        answerIndex: 1,
      },
      {
        question: "Quand vous etes calme, le client...",
        options: [
          "Devient defensif",
          "Se detend et se livre",
          "Raccourcit l'entretien",
          "Change d'avis",
        ],
        answerIndex: 1,
      },
      {
        question: "Quel exemple est donne en audioprothese ?",
        options: [
          "Je garantis un resultat identique",
          "Je peux expliquer le protocole et le suivi",
          "Je baisse le prix",
          "Je ne sais pas quoi proposer",
        ],
        answerIndex: 1,
      },
    ],
  },
  "elearning1-03-resilience-rejet": {
    title: "Resilience et rejet",
    questions: [
      {
        question: "En vente, le non est...",
        options: ["Un echec", "Un signal", "Une insulte", "Une fin"],
        answerIndex: 1,
      },
      {
        question: "Le client refuse...",
        options: [
          "Votre valeur",
          "Une option",
          "Votre professionnalisme",
          "Votre personne",
        ],
        answerIndex: 1,
      },
      {
        question: "Quelle question poser apres un non ?",
        options: [
          "Pourquoi vous dites non a moi ?",
          "Qu'est-ce qui a pese dans votre decision ?",
          "Vous etes sur ?",
          "Vous avez tort",
        ],
        answerIndex: 1,
      },
      {
        question: "La resilience, c'est...",
        options: [
          "Ignorer le client",
          "La vitesse de retour a l'action",
          "Changer de metier",
          "Baisser les prix",
        ],
        answerIndex: 1,
      },
      {
        question: "Dans l'exemple immobilier, que demande-t-on ?",
        options: [
          "Le prix, le delai ou le type de bien ?",
          "Le nom de votre voisin ?",
          "Votre budget exact ?",
          "Quand vous signez ?",
        ],
        answerIndex: 0,
      },
    ],
  },
  "elearning1-04-ethique-confiance": {
    title: "Ethique et confiance long terme",
    questions: [
      {
        question: "L'ethique est presentee comme...",
        options: [
          "Un bonus",
          "Un accelerateur de confiance",
          "Une perte de temps",
          "Un luxe inutile",
        ],
        answerIndex: 1,
      },
      {
        question: "Dire non a un client mal cible...",
        options: [
          "Baisse votre credibilite",
          "Protege votre credibilite",
          "N'a aucun impact",
          "Fait perdre du temps",
        ],
        answerIndex: 1,
      },
      {
        question: "Clarifier les limites permet au client de se sentir...",
        options: ["Presse", "Respecte et en securite", "Ignore", "Frustre"],
        answerIndex: 1,
      },
      {
        question: "Une vente propre genere...",
        options: [
          "Recommandations et re-achat",
          "Moins de confiance",
          "Plus d'objections",
          "Moins de relation",
        ],
        answerIndex: 0,
      },
      {
        question: "Dans l'exemple audioprothese, quel message est donne ?",
        options: [
          "On entend parfaitement en concert",
          "Ce n'est pas realiste, mais on peut ameliorer le quotidien",
          "C'est impossible",
          "On ne donne pas de limites",
        ],
        answerIndex: 1,
      },
    ],
  },
  "elearning1-05-discipline-energie": {
    title: "Discipline et energie",
    questions: [
      {
        question: "L'etat d'esprit passe aussi par...",
        options: [
          "L'improvisation",
          "L'hygiene mentale",
          "Le multitache",
          "La chance",
        ],
        answerIndex: 1,
      },
      {
        question: "Avant la journee, quelle routine est conseillee ?",
        options: [
          "Aucune preparation",
          "5 minutes de preparation mentale",
          "Deux heures de mails",
          "Repondre aux objections",
        ],
        answerIndex: 1,
      },
      {
        question: "Apres la journee, il faut...",
        options: [
          "Oublier la journee",
          "Noter 2 apprentissages et 1 action",
          "Changer de client",
          "Arreter les rappels",
        ],
        answerIndex: 1,
      },
      {
        question: "Les micro-pauses servent a...",
        options: [
          "Saturer davantage",
          "Eviter la saturation",
          "Ralentir le pipeline",
          "Eviter les questions",
        ],
        answerIndex: 1,
      },
      {
        question: "Le focus doit porter sur...",
        options: [
          "Les actions controllables",
          "Le resultat uniquement",
          "Le nombre de concurrents",
          "Le stress du client",
        ],
        answerIndex: 0,
      },
    ],
  },
  "elearning2-01-pyramide-structure": {
    title: "Pyramide de vente et structuration",
    questions: [
      {
        question: "La structure donne au client une perception de...",
        options: [
          "Flou",
          "Clarte et professionnalisme",
          "Pression",
          "Confusion",
        ],
        answerIndex: 1,
      },
      {
        question: "Quel est l'ordre de la pyramide de vente ?",
        options: [
          "Argumentation -> Decouverte -> Closing -> Objections -> Contact",
          "Prise de contact -> Decouverte -> Argumentation -> Objections -> Closing",
          "Closing -> Contact -> Argumentation -> Decouverte -> Objections",
          "Contact -> Closing -> Objections -> Decouverte -> Argumentation",
        ],
        answerIndex: 1,
      },
      {
        question: "Sans structure, la discussion...",
        options: [
          "Devient plus courte",
          "Part dans tous les sens",
          "Devient plus fluide",
          "Gagne en confiance",
        ],
        answerIndex: 1,
      },
      {
        question: "Si la decouverte est floue, l'argumentation devient...",
        options: ["Precise", "Generique", "Inutile", "Rassurante"],
        answerIndex: 1,
      },
      {
        question: "La logique d'escalier signifie que...",
        options: [
          "On saute des etapes",
          "On ne saute pas de marches",
          "On commence par le closing",
          "On ignore la prise de contact",
        ],
        answerIndex: 1,
      },
    ],
  },
  "elearning2-02-prise-de-contact": {
    title: "Prise de contact",
    questions: [
      {
        question: "La prise de contact est le moment ou le client...",
        options: [
          "Compare les prix",
          "Decide si vous etes digne de confiance",
          "Demande une remise",
          "Refuse la discussion",
        ],
        answerIndex: 1,
      },
      {
        question: "Combien d'etapes compte la structure proposee ?",
        options: ["4", "6", "8", "10"],
        answerIndex: 1,
      },
      {
        question: "Le bris de glace sert a...",
        options: [
          "Gagner du temps",
          "Etablir une proximite sincere",
          "Eviter les questions",
          "Imposer le prix",
        ],
        answerIndex: 1,
      },
      {
        question: "Le timing consiste a...",
        options: [
          "Allonger l'entretien",
          "Indiquer la duree et demander l'accord",
          "Eviter la validation",
          "Passer a l'argumentation",
        ],
        answerIndex: 1,
      },
      {
        question: "Le pitch en 3 etapes contient...",
        options: [
          "Prix, promo, reduction",
          "Enjeux clients, solution, forces/benefices",
          "Historique, logo, bureau",
          "Objections, closing, suivi",
        ],
        answerIndex: 1,
      },
    ],
  },
  "elearning2-03-decouverte": {
    title: "Decouverte",
    questions: [
      {
        question: "La decouverte est avant tout...",
        options: [
          "Un questionnaire",
          "Un diagnostic guide",
          "Un monologue",
          "Un pitch",
        ],
        answerIndex: 1,
      },
      {
        question: "Quelle question mesure l'urgence ?",
        options: [
          "Quel est votre budget ?",
          "Si on ne change rien dans 6 mois, que se passe-t-il ?",
          "Aimez-vous notre marque ?",
          "Combien de contacts avez-vous ?",
        ],
        answerIndex: 1,
      },
      {
        question: "Developper la motivation consiste a...",
        options: [
          "Imposer une solution",
          "Faire formuler les raisons d'agir",
          "Eviter les enjeux",
          "Raccourcir la discussion",
        ],
        answerIndex: 1,
      },
      {
        question: "Une regle d'or de la decouverte est...",
        options: [
          "Poser 2 questions maximum",
          "Poser au moins 10 questions",
          "Eviter l'ecoute active",
          "Passer vite a l'argumentation",
        ],
        answerIndex: 1,
      },
      {
        question: "La reformulation doit contenir...",
        options: [
          "Le prix et la concurrence",
          "Ce que j'ai compris + ce que vous voulez atteindre",
          "Uniquement les objections",
          "La solution finale",
        ],
        answerIndex: 1,
      },
    ],
  },
  "elearning2-04-argumentation": {
    title: "Argumentation (BAC)",
    questions: [
      {
        question: "BAC signifie...",
        options: [
          "Besoin, Action, Closing",
          "Benefices, Avantages, Caracteristiques",
          "Budget, Accord, Contrat",
          "Base, Axe, Contexte",
        ],
        answerIndex: 1,
      },
      {
        question: "Une bonne argumentation commence par...",
        options: [
          "Les caracteristiques",
          "Les benefices exprimes par le client",
          "Le prix",
          "La concurrence",
        ],
        answerIndex: 1,
      },
      {
        question: "Combien de chaines BAC conseille-t-on ?",
        options: ["Une seule", "Deux ou trois", "Six", "Aucune"],
        answerIndex: 1,
      },
      {
        question: "Comment credibiliser une chaine BAC ?",
        options: [
          "Ajouter une preuve courte",
          "Ajouter plus de caracteristiques",
          "Changer de sujet",
          "Donner une remise",
        ],
        answerIndex: 0,
      },
      {
        question: "Quelle question aide a faire emerger les objections ?",
        options: [
          "Vous etes d'accord ?",
          "Qu'en pensez-vous ?",
          "On signe ?",
          "Vous voulez une reduction ?",
        ],
        answerIndex: 1,
      },
    ],
  },
  "elearning2-05-objections": {
    title: "Objections",
    questions: [
      {
        question: "Une objection signifie souvent...",
        options: [
          "Une attaque",
          "Un besoin d'etre rassure",
          "Un refus definitif",
          "Un desinteret",
        ],
        answerIndex: 1,
      },
      {
        question: "Quel type d'objection existe ?",
        options: [
          "Manque de priorite",
          "Manque de style",
          "Manque d'humour",
          "Manque de rapidite",
        ],
        answerIndex: 0,
      },
      {
        question: "Isoler une objection consiste a demander...",
        options: [
          "Vous etes sur ?",
          "A part ca, y a-t-il d'autres objections rationnelles ?",
          "Vous etes presse ?",
          "Quel est votre budget ?",
        ],
        answerIndex: 1,
      },
      {
        question: "Face a une objection, il faut...",
        options: [
          "Se justifier",
          "Rester calme et factuel",
          "Couper la parole",
          "Mettre la pression",
        ],
        answerIndex: 1,
      },
      {
        question: "Apres une objection traitee, on doit...",
        options: [
          "Revenir au besoin initial",
          "Changer de sujet",
          "Arreter la vente",
          "Ignorer le client",
        ],
        answerIndex: 0,
      },
    ],
  },
  "elearning2-06-closing": {
    title: "Closing",
    questions: [
      {
        question: "Le closing est...",
        options: [
          "Une rupture",
          "Une suite logique",
          "Une improvisation",
          "Une pression",
        ],
        answerIndex: 1,
      },
      {
        question: "Apres la derniere objection isolee, on doit...",
        options: [
          "Revenir au debut",
          "Passer a l'action",
          "Parler du prix",
          "Eviter la suite",
        ],
        answerIndex: 1,
      },
      {
        question: "Une objection irrationnelle...",
        options: [
          "Fait partie des objections isolees",
          "Arrive apres et n'etait pas isolee",
          "Doit etre ignoree",
          "Est toujours vraie",
        ],
        answerIndex: 1,
      },
      {
        question: "La next step doit etre...",
        options: [
          "Vague",
          "Precise (date, document, action)",
          "Reportee",
          "Secret",
        ],
        answerIndex: 1,
      },
      {
        question: "Quel exemple est donne pour proposer une date ?",
        options: [
          "Jeudi 27 ou mardi 2",
          "L'an prochain",
          "Quand vous voulez",
          "Aucune date",
        ],
        answerIndex: 0,
      },
    ],
  },
  "elearning3-01-ecoute-active": {
    title: "Ecoute active",
    questions: [
      {
        question: "L'ecoute active permet de...",
        options: [
          "Raccourcir la discussion",
          "Faire parler et rassurer",
          "Eviter les questions",
          "Conclure plus vite",
        ],
        answerIndex: 1,
      },
      {
        question: "Quel levier fait partie des 3 ?",
        options: [
          "Silence",
          "Interruption",
          "Justification",
          "Argumentation",
        ],
        answerIndex: 0,
      },
      {
        question: "Quelle erreur est mentionnee ?",
        options: [
          "Reformuler",
          "Poser une nouvelle question sans valider",
          "Relancer",
          "Garder le silence",
        ],
        answerIndex: 1,
      },
      {
        question: "L'ecoute active est...",
        options: [
          "Passive",
          "Une posture qui guide sans imposer",
          "Un monologue",
          "Une technique de closing",
        ],
        answerIndex: 1,
      },
      {
        question: "Dans l'exemple, on utilise le silence pour...",
        options: [
          "Couper l'echange",
          "Laisser le client completer",
          "Changer de sujet",
          "Donner un prix",
        ],
        answerIndex: 1,
      },
    ],
  },
  "elearning3-02-questionnement-structure": {
    title: "Questionnement structure",
    questions: [
      {
        question: "L'entonnoir va de...",
        options: [
          "Questions ouvertes -> precisees -> validation",
          "Closing -> objections -> decouverte",
          "Pitch -> prix -> contrat",
          "Validation -> ouverte -> precisee",
        ],
        answerIndex: 0,
      },
      {
        question: "Dans SPIN, le I signifie...",
        options: ["Impact", "Intention", "Information", "Ideal"],
        answerIndex: 0,
      },
      {
        question: "Le N (Need-payoff) sert a...",
        options: [
          "Mesurer le budget",
          "Faire exprimer la valeur de la solution",
          "Eviter les objections",
          "Clore la vente",
        ],
        answerIndex: 1,
      },
      {
        question: "Le dosage recommande est...",
        options: [
          "Beaucoup de questions sans synthese",
          "2 a 3 questions puis une synthese",
          "Un seul bloc de questions",
          "Aucune question",
        ],
        answerIndex: 1,
      },
      {
        question: "Quel est un exemple de question de validation ?",
        options: [
          "Si je resume, votre priorite est X, c'est bien ca ?",
          "Quel est votre budget ?",
          "Vous aimez notre produit ?",
          "On signe ?",
        ],
        answerIndex: 0,
      },
    ],
  },
  "elearning3-03-reformulation-synthese": {
    title: "Reformulation et synthese",
    questions: [
      {
        question: "Les deux niveaux de reformulation sont...",
        options: [
          "Factuelle et priorites",
          "Prix et objections",
          "Technique et closing",
          "Argumentation et pitch",
        ],
        answerIndex: 0,
      },
      {
        question: "La synthese courte contient...",
        options: [
          "Situation + priorite",
          "Prix + remise",
          "Concurrence + offre",
          "Argument + closing",
        ],
        answerIndex: 0,
      },
      {
        question: "Quelle phrase valide la synthese ?",
        options: [
          "Est-ce que je resume correctement ?",
          "Vous etes d'accord ?",
          "On signe ?",
          "Vous etes presse ?",
        ],
        answerIndex: 0,
      },
      {
        question: "Une bonne synthese...",
        options: [
          "Augmente les objections",
          "Reduit les objections futures",
          "Coupe la conversation",
          "Ignore le client",
        ],
        answerIndex: 1,
      },
      {
        question: "Dans l'exemple immobilier, on reformule...",
        options: [
          "La priorite d'acheter avant l'ete",
          "Le prix de vente",
          "Le nombre de visites",
          "La concurrence",
        ],
        answerIndex: 0,
      },
    ],
  },
  "elearning3-04-preuves-storytelling": {
    title: "Preuves et storytelling",
    questions: [
      {
        question: "Une promesse sans preuve ressemble a...",
        options: [
          "Un fait",
          "Un argument commercial",
          "Un contrat",
          "Une garantie",
        ],
        answerIndex: 1,
      },
      {
        question: "Quel type de preuve est cite ?",
        options: ["Chiffre simple", "Logo", "Slogan", "Comparatif"],
        answerIndex: 0,
      },
      {
        question: "Le mini storytelling suit quelle structure ?",
        options: [
          "Situation -> mise en place -> resultat",
          "Prix -> promo -> contrat",
          "Objection -> reponse -> closing",
          "Pitch -> demo -> signature",
        ],
        answerIndex: 0,
      },
      {
        question: "Combien de preuves par argument ?",
        options: ["Une", "Trois", "Cinq", "Autant que possible"],
        answerIndex: 0,
      },
      {
        question: "Une preuve claire sert a...",
        options: [
          "Mettre la pression",
          "Rendre la solution imaginable",
          "Eviter la decouverte",
          "Raccourcir le pitch",
        ],
        answerIndex: 1,
      },
    ],
  },
  "elearning3-05-rythme-engagement": {
    title: "Rythme et engagement",
    questions: [
      {
        question: "Un rythme trop lent...",
        options: [
          "Rassure toujours",
          "Ennuie le client",
          "Accelere la vente",
          "Supprime les objections",
        ],
        answerIndex: 1,
      },
      {
        question: "Quel cycle est recommande ?",
        options: [
          "Question -> ecoute -> synthese -> confirmation",
          "Pitch -> prix -> closing",
          "Argumentation -> remise -> contrat",
          "Silence -> fin",
        ],
        answerIndex: 0,
      },
      {
        question: "Combien de temps dure un cycle ?",
        options: ["30 secondes", "2 a 3 minutes", "10 minutes", "20 minutes"],
        answerIndex: 1,
      },
      {
        question: "Quel exemple de confirmation est donne ?",
        options: [
          "Est-ce que ca vous parle ?",
          "Vous etes trop cher ?",
          "On signe ?",
          "Vous voulez partir ?",
        ],
        answerIndex: 0,
      },
      {
        question: "A quoi servent les transitions propres ?",
        options: [
          "Eviter les etapes",
          "Guider sans faire subir",
          "Mettre la pression",
          "Couper l'echange",
        ],
        answerIndex: 1,
      },
    ],
  },
};
