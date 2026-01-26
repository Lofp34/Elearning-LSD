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
        question: "Dans l'ouverture, l'etat d'esprit n'est pas de placer un appareil, mais de...",
        options: [
          "Convaincre a tout prix",
          "Aider le patient a decider",
          "Vendre le modele le plus cher",
          "Parler technique d'abord",
        ],
        answerIndex: 1,
      },
      {
        question: "Selon la video, le role de l'expert est avant tout de...",
        options: [
          "Mettre la pression pour un modele",
          "Clarifier les options et accompagner",
          "Eviter la discussion",
          "Garantir un resultat",
        ],
        answerIndex: 1,
      },
      {
        question: "Qu'est-ce qui fait tomber les reticences face a l'appareillage ?",
        options: [
          "Parler des promotions",
          "Se concentrer sur la gene auditive et le quotidien",
          "Raccourcir l'entretien",
          "Comparer la concurrence",
        ],
        answerIndex: 1,
      },
      {
        question: "Quelle intention visible est recommandee ?",
        options: [
          "Je veux vendre vite",
          "Je veux comprendre les situations de gene avant de proposer",
          "Je propose toujours la meme solution",
          "Je ne parle pas des limites",
        ],
        answerIndex: 1,
      },
      {
        question: "La neutralite active, c'est...",
        options: [
          "Laisser le patient seul",
          "Guider l'echange tout en respectant son rythme",
          "Eviter les questions",
          "Imposer un devis",
        ],
        answerIndex: 1,
      },
    ],
  },
  "elearning1-02-confiance-calme": {
    title: "Confiance calme",
    questions: [
      {
        question: "La confiance est presentee comme une question de...",
        options: ["Bruit", "Calme", "Vitesse", "Humour"],
        answerIndex: 1,
      },
      {
        question: "Quel signal de confiance est cite ?",
        options: [
          "Parler plus fort",
          "Dire 'je ne sais pas, je verifie'",
          "Promettre un resultat",
          "Changer de sujet",
        ],
        answerIndex: 1,
      },
      {
        question: "Avant la consultation, que conseille-t-on ?",
        options: [
          "Improviser",
          "Se rememorer deux cas reussis",
          "Eviter la preparation",
          "Se comparer aux concurrents",
        ],
        answerIndex: 1,
      },
      {
        question: "Quand vous etes serein, le patient...",
        options: [
          "Se ferme",
          "Se detend et se livre",
          "Raccourcit l'entretien",
          "Change d'avis",
        ],
        answerIndex: 1,
      },
      {
        question: "Dans l'exemple audioprothese, que dit l'expert ?",
        options: [
          "Je garantis un resultat identique",
          "Je peux expliquer le protocole et le suivi",
          "Je baisse le prix",
          "Je ne propose rien",
        ],
        answerIndex: 1,
      },
    ],
  },
  "elearning1-03-resilience-rejet": {
    title: "Resilience et rejet",
    questions: [
      {
        question: "Un 'non' en centre est surtout...",
        options: ["Un echec", "Un signal", "Une attaque", "Une fin"],
        answerIndex: 1,
      },
      {
        question: "Quand un patient refuse, il n'evalue pas votre competence mais...",
        options: [
          "Exprime une peur ou une priorite",
          "Refuse votre personne",
          "Valide le devis",
          "Cherche un conflit",
        ],
        answerIndex: 0,
      },
      {
        question: "La 'boucle courte' consiste a demander...",
        options: [
          "Pourquoi vous dites non a moi ?",
          "Qu'est-ce qui pese le plus dans votre decision aujourd'hui ?",
          "Vous etes sur ?",
          "Vous avez tort",
        ],
        answerIndex: 1,
      },
      {
        question: "La resilience, c'est surtout...",
        options: [
          "Ignorer le refus",
          "Revenir vite a l'action",
          "Baisser le prix",
          "Changer de patient",
        ],
        answerIndex: 1,
      },
      {
        question: "Dans l'exemple, on explore un doute lie a...",
        options: [
          "L'esthetique, le budget ou l'idee de porter un appareil",
          "La concurrence",
          "Le stock",
          "Le planning",
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
          "Une contrainte",
          "Un accelerateur de confiance",
          "Un detail",
          "Un frein commercial",
        ],
        answerIndex: 1,
      },
      {
        question: "Dire non a un patient pas pret...",
        options: [
          "Diminue la credibilite",
          "Renforce la credibilite",
          "N'a aucun impact",
          "Oblige a vendre",
        ],
        answerIndex: 1,
      },
      {
        question: "Clarifier les limites de la technologie permet au patient de se sentir...",
        options: ["Presse", "Respecte et en securite", "Ignore", "Devalorise"],
        answerIndex: 1,
      },
      {
        question: "Une vente propre genere sur le long terme...",
        options: [
          "Recommandations et re-achats",
          "Moins de confiance",
          "Plus de conflits",
          "Moins de relation",
        ],
        answerIndex: 0,
      },
      {
        question: "Dans l'exemple, que promet-on de realiste ?",
        options: [
          "Une audition parfaite en concert rock",
          "Un meilleur confort au quotidien",
          "Aucune amelioration",
          "Un resultat garanti a 100%",
        ],
        answerIndex: 1,
      },
    ],
  },
  "elearning1-05-discipline-energie": {
    title: "Discipline et energie",
    questions: [
      {
        question: "La discipline protege surtout...",
        options: ["Le budget", "L'energie", "Le stock", "La concurrence"],
        answerIndex: 1,
      },
      {
        question: "Quelle routine du matin est conseillee ?",
        options: [
          "Aucune preparation",
          "5 minutes de preparation mentale",
          "Deux heures de mails",
          "Repondre aux objections",
        ],
        answerIndex: 1,
      },
      {
        question: "Le soir, il faut...",
        options: [
          "Oublier la journee",
          "Noter 2 apprentissages et 1 action d'amelioration",
          "Changer de patient",
          "Arreter les suivis",
        ],
        answerIndex: 1,
      },
      {
        question: "Les micro-pauses servent a...",
        options: [
          "Saturer davantage",
          "Eviter la saturation",
          "Raccourcir les rendez-vous",
          "Ignorer le patient",
        ],
        answerIndex: 1,
      },
      {
        question: "Le focus doit porter sur...",
        options: [
          "Le processus (accueil, decouverte, suivi)",
          "Les devis signes uniquement",
          "La concurrence",
          "Le prix moyen",
        ],
        answerIndex: 0,
      },
    ],
  },
  "elearning2-01-pyramide-structure": {
    title: "Pyramide de vente et structuration",
    questions: [
      {
        question: "La structure sert principalement a...",
        options: [
          "Rendre l'echange rigide",
          "Rassurer le patient et clarifier",
          "Accelerer sans ecoute",
          "Eviter les questions",
        ],
        answerIndex: 1,
      },
      {
        question: "Sans cadre, l'echange...",
        options: [
          "Devient plus naturel",
          "Part dans tous les sens",
          "Devient plus court",
          "Ameliore la confiance",
        ],
        answerIndex: 1,
      },
      {
        question: "Quel est l'ordre correct des etapes ?",
        options: [
          "Contact -> Decouverte -> Argumentation -> Objections -> Closing",
          "Argumentation -> Contact -> Closing -> Decouverte -> Objections",
          "Closing -> Contact -> Objections -> Decouverte -> Argumentation",
          "Contact -> Closing -> Objections -> Decouverte -> Argumentation",
        ],
        answerIndex: 0,
      },
      {
        question: "Si la decouverte est floue, l'argumentation devient...",
        options: ["Precise", "Generique", "Inutile", "Rassurante"],
        answerIndex: 1,
      },
      {
        question: "Dans l'exemple, clarifier le parcours des le debut permet...",
        options: [
          "De rendre le patient defensif",
          "De le mettre en securite",
          "De le faire taire",
          "De sauter des etapes",
        ],
        answerIndex: 1,
      },
    ],
  },
  "elearning2-02-prise-de-contact": {
    title: "Prise de contact",
    questions: [
      {
        question: "La prise de contact est le moment ou le patient decide s'il peut...",
        options: [
          "Vous confier son audition",
          "Comparer les prix",
          "Refuser l'echange",
          "Demander un devis",
        ],
        answerIndex: 0,
      },
      {
        question: "Quelle liste correspond aux 6 etapes ?",
        options: [
          "Bris de glace, cadre, plan, timing, validation, pitch",
          "Pitch, prix, closing, objections, contact, suivi",
          "Diagnostic, devis, paiement, livraison, suivi, closing",
          "Silence, relance, reformulation, demo, contrat, facture",
        ],
        answerIndex: 0,
      },
      {
        question: "Le bris de glace sert a...",
        options: [
          "Imposer le prix",
          "Etablir une proximite sincere",
          "Eviter les questions",
          "Passer au devis",
        ],
        answerIndex: 1,
      },
      {
        question: "Quelle phrase valide le cadre ?",
        options: [
          "On verra plus tard",
          "Est-ce que ce programme vous convient ?",
          "On commence par le devis",
          "Vous n'avez pas le choix",
        ],
        answerIndex: 1,
      },
      {
        question: "Quelle question lance la decouverte ?",
        options: [
          "Quel est votre budget exact ?",
          "Qu'est-ce qui vous a pousse a prendre rendez-vous aujourd'hui ?",
          "On signe maintenant ?",
          "Vous voulez quel modele ?",
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
          "Un interrogatoire",
          "Un diagnostic guide",
          "Un pitch",
          "Un closing",
        ],
        answerIndex: 1,
      },
      {
        question: "Quel est un exemple de question ouverte ?",
        options: [
          "Quelle est votre situation auditive actuelle ?",
          "Vous voulez un devis ?",
          "On passe aux tests ?",
          "Vous preferez quel modele ?",
        ],
        answerIndex: 0,
      },
      {
        question: "Quelle question mesure l'enjeu dans le temps ?",
        options: [
          "Si on ne fait rien, comment sera votre quotidien dans 6 mois ?",
          "Quel est votre budget ?",
          "Vous aimez notre centre ?",
          "Vous avez un autre rendez-vous ?",
        ],
        answerIndex: 0,
      },
      {
        question: "Pour developper la motivation, on demande...",
        options: [
          "Pourquoi vous etes venu ?",
          "Qu'est-ce qui vous ferait dire que le probleme est regle ?",
          "Vous etes presse ?",
          "Vous voulez une remise ?",
        ],
        answerIndex: 1,
      },
      {
        question: "La reformulation se termine par...",
        options: [
          "Est-ce que je resume correctement ?",
          "On signe ?",
          "Quel est votre budget ?",
          "On passe au devis ?",
        ],
        answerIndex: 0,
      },
    ],
  },
  "elearning2-04-argumentation": {
    title: "Argumentation (BAC)",
    questions: [
      {
        question: "L'argumentation est definie comme...",
        options: [
          "Un long discours technique",
          "Un pont entre decouverte et solution",
          "Un catalogue de caracteristiques",
          "Un resume du devis",
        ],
        answerIndex: 1,
      },
      {
        question: "BAC signifie...",
        options: [
          "Benefices, Avantages, Caracteristiques",
          "Besoin, Action, Closing",
          "Budget, Accord, Contrat",
          "Base, Axe, Contexte",
        ],
        answerIndex: 0,
      },
      {
        question: "On commence une chaine BAC par...",
        options: [
          "La caracteristique technique",
          "Le benefice pour le patient",
          "Le prix",
          "La concurrence",
        ],
        answerIndex: 1,
      },
      {
        question: "Combien de chaines BAC recommande-t-on ?",
        options: ["Une seule", "Deux ou trois", "Six", "Autant que possible"],
        answerIndex: 1,
      },
      {
        question: "Quelle question aide a faire emerger les objections ?",
        options: [
          "Qu'en pensez-vous ?",
          "On signe ?",
          "Vous etes d'accord ?",
          "Vous voulez une remise ?",
        ],
        answerIndex: 0,
      },
    ],
  },
  "elearning2-05-objections": {
    title: "Objections",
    questions: [
      {
        question: "Une objection signifie le plus souvent...",
        options: [
          "Un besoin d'etre rassure",
          "Un refus definitif",
          "Une attaque personnelle",
          "Un desinteret total",
        ],
        answerIndex: 0,
      },
      {
        question: "Quel type d'objection est cite ?",
        options: [
          "Manque d'information",
          "Manque de style",
          "Manque d'humour",
          "Manque de rapidite",
        ],
        answerIndex: 0,
      },
      {
        question: "Quelle phrase correspond a l'etape 'isoler' ?",
        options: [
          "A part cet aspect, y a-t-il autre chose qui vous inquiete ?",
          "On signe maintenant ?",
          "Je vous l'avais dit",
          "C'est comme ca",
        ],
        answerIndex: 0,
      },
      {
        question: "Face a une objection, il faut surtout...",
        options: [
          "Se justifier",
          "Rester calme et factuel",
          "Couper la parole",
          "Changer de sujet",
        ],
        answerIndex: 1,
      },
      {
        question: "Sur l'objection 'c'est trop cher', la premiere relance conseillee est...",
        options: [
          "Par rapport a quoi le trouvez-vous cher ?",
          "Je baisse le prix",
          "Vous avez tort",
          "On oublie",
        ],
        answerIndex: 0,
      },
    ],
  },
  "elearning2-06-closing": {
    title: "Closing",
    questions: [
      {
        question: "Le closing est presente comme...",
        options: [
          "Une rupture",
          "La suite logique de l'entretien",
          "Un moment de pression",
          "Un test technique",
        ],
        answerIndex: 1,
      },
      {
        question: "Apres la derniere objection, il faut...",
        options: [
          "Revenir au debut",
          "Proposer une suite concrete",
          "Parler de concurrence",
          "Reporter sans date",
        ],
        answerIndex: 1,
      },
      {
        question: "L'objection irrationnelle apparait souvent...",
        options: [
          "Au moment de passer a l'action",
          "Au debut de l'entretien",
          "Apres la facture",
          "Avant la prise de contact",
        ],
        answerIndex: 0,
      },
      {
        question: "Une next step doit etre...",
        options: [
          "Vague",
          "Precise (date, action, document)",
          "Secrete",
          "Optionnelle",
        ],
        answerIndex: 1,
      },
      {
        question: "Dans l'exemple, que propose-t-on pour conclure ?",
        options: [
          "Fixer un rendez-vous d'essai avec une date",
          "Donner un catalogue",
          "Attendre un rappel",
          "Envoyer un devis sans suite",
        ],
        answerIndex: 0,
      },
    ],
  },
  "elearning3-01-ecoute-active": {
    title: "Ecoute active",
    questions: [
      {
        question: "L'ecoute active permet surtout de...",
        options: [
          "Faire parler et rassurer le patient",
          "Raccourcir l'entretien",
          "Eviter les questions",
          "Conclure plus vite",
        ],
        answerIndex: 0,
      },
      {
        question: "Quel est un des 3 leviers ?",
        options: ["Silence", "Interruption", "Justification", "Argumentation"],
        answerIndex: 0,
      },
      {
        question: "Quelle erreur est citee ?",
        options: [
          "Proposer une solution trop vite",
          "Reformuler",
          "Relancer",
          "Laisser un silence",
        ],
        answerIndex: 0,
      },
      {
        question: "L'ecoute active est une posture qui...",
        options: [
          "Guide sans imposer",
          "Impose une solution",
          "Evite la decouverte",
          "Supprime les objections",
        ],
        answerIndex: 0,
      },
      {
        question: "Dans l'exemple, on relance le patient sur...",
        options: [
          "Son inquietude a porter un appareil",
          "Le prix",
          "La concurrence",
          "Le devis",
        ],
        answerIndex: 0,
      },
    ],
  },
  "elearning3-02-questionnement-structure": {
    title: "Questionnement structure",
    questions: [
      {
        question: "L'entonnoir suit quel ordre ?",
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
          "2 a 3 questions puis une synthese",
          "Un bloc de 15 questions",
          "Aucune reformulation",
          "Uniquement des questions fermees",
        ],
        answerIndex: 0,
      },
      {
        question: "Quelle phrase est une validation ?",
        options: [
          "Si je resume, votre priorite est X, c'est bien ca ?",
          "Quel est votre budget ?",
          "On signe ?",
          "Vous voulez un devis ?",
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
        question: "Une synthese courte contient...",
        options: [
          "Situation + priorite",
          "Prix + remise",
          "Concurrence + offre",
          "Argument + closing",
        ],
        answerIndex: 0,
      },
      {
        question: "Quelle question valide la synthese ?",
        options: [
          "Est-ce que je resume correctement votre situation ?",
          "On signe ?",
          "Vous avez le budget ?",
          "Vous aimez notre centre ?",
        ],
        answerIndex: 0,
      },
      {
        question: "Une bonne synthese permet de...",
        options: [
          "Reduire les objections futures",
          "Augmenter les objections",
          "Couper l'echange",
          "Eviter la decouverte",
        ],
        answerIndex: 0,
      },
      {
        question: "Dans l'exemple, la priorite du patient est...",
        options: [
          "Une solution simple et discrete",
          "Un prix bas",
          "Un appareil tres visible",
          "Une remise",
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
          "Un argument commercial",
          "Un fait",
          "Un contrat",
          "Une garantie",
        ],
        answerIndex: 0,
      },
      {
        question: "Quel est un type de preuve ?",
        options: ["Chiffre simple", "Slogan", "Logo", "Comparatif"],
        answerIndex: 0,
      },
      {
        question: "Combien de preuves par argument conseille-t-on ?",
        options: ["Une", "Trois", "Cinq", "Autant que possible"],
        answerIndex: 0,
      },
      {
        question: "Le mini storytelling suit la structure...",
        options: [
          "Situation -> action -> resultat",
          "Prix -> promo -> contrat",
          "Objection -> reponse -> closing",
          "Pitch -> demo -> signature",
        ],
        answerIndex: 0,
      },
      {
        question: "Le but d'une preuve claire est de...",
        options: [
          "Rendre la solution imaginable",
          "Mettre la pression",
          "Eviter la decouverte",
          "Raccourcir le pitch",
        ],
        answerIndex: 0,
      },
    ],
  },
  "elearning3-05-rythme-engagement": {
    title: "Rythme et engagement",
    questions: [
      {
        question: "Un rythme trop rapide provoque...",
        options: [
          "Un patient qui se ferme",
          "Un patient tres detendu",
          "Une confiance immediate",
          "Plus d'ecoute",
        ],
        answerIndex: 0,
      },
      {
        question: "Quel est le cycle recommande ?",
        options: [
          "Question -> ecoute -> synthese -> confirmation",
          "Pitch -> prix -> closing",
          "Argumentation -> remise -> contrat",
          "Silence -> fin",
        ],
        answerIndex: 0,
      },
      {
        question: "Quelle est la duree d'un cycle ?",
        options: ["30 secondes", "2 a 3 minutes", "10 minutes", "20 minutes"],
        answerIndex: 1,
      },
      {
        question: "Quelle micro-confirmation est proposee ?",
        options: [
          "Est-ce que cela vous parle ?",
          "Vous etes trop cher ?",
          "On signe ?",
          "Vous voulez partir ?",
        ],
        answerIndex: 0,
      },
      {
        question: "Annoncer les transitions permet de...",
        options: [
          "Guider sans pousser",
          "Couper l'echange",
          "Eviter les etapes",
          "Accrocher un devis",
        ],
        answerIndex: 0,
      },
    ],
  },
};
