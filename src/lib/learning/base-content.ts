import { BASE_MODULES } from "@/lib/learning/base-structure";

export type BaseQuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
};

export type BaseModuleContent = {
  scriptText: string;
  quizQuestions: BaseQuizQuestion[];
};

export const BASE_MODULE_CONTENT: Record<string, BaseModuleContent> = {
  "mental.posture-service": {
    scriptText:
      "Dans une relation commerciale B2B, la posture de service consiste a aider un client a prendre une bonne decision, pas a pousser une offre trop vite. L'objectif est de comprendre son contexte, son enjeu business et le risque du statu quo avant de parler solution. Cette posture change le ton de l'echange: on cherche d'abord a clarifier, a securiser et a orienter. Elle implique aussi de dire non a une demande mal cadree ou prematuree, car proteger la qualite de la decision fait monter la confiance. En pratique, ouvre tes rendez-vous avec un cadre simple: ce que tu veux comprendre, ce que tu proposes d'analyser et la prochaine etape utile.",
    quizQuestions: [
      {
        question: "Dans ce module, la posture de service consiste avant tout a...",
        options: [
          "aider le client a prendre une bonne decision",
          "presenter l'offre la plus complete des le debut",
          "defendre son prix avant d'explorer le besoin",
          "raccourcir l'entretien pour aller plus vite",
        ],
        answerIndex: 0,
      },
      {
        question: "Quel est le bon ordre dans un echange B2B de qualite ?",
        options: [
          "prix, remise, signature",
          "enjeu, contexte, prochaine etape utile",
          "catalogue, argumentaire, closing",
          "objection, relance, devis",
        ],
        answerIndex: 1,
      },
      {
        question: "Une vraie posture de service conduit parfois a...",
        options: [
          "dire non a une demande mal cadree",
          "retarder toute proposition",
          "accepter toutes les demandes du client",
          "eviter de parler du risque",
        ],
        answerIndex: 0,
      },
      {
        question: "Quel effet produit cette posture sur la relation ?",
        options: [
          "elle augmente la confiance",
          "elle rend l'entretien plus flou",
          "elle retire toute structure",
          "elle remplace la qualification",
        ],
        answerIndex: 0,
      },
      {
        question: "Au debut d'un rendez-vous, il faut surtout poser...",
        options: [
          "un cadre clair et une prochaine etape utile",
          "une reduction commerciale",
          "une comparaison avec la concurrence",
          "une liste de caracteristiques techniques",
        ],
        answerIndex: 0,
      },
    ],
  },
  "mental.confiance-calme": {
    scriptText:
      "La confiance commerciale en B2B ne se joue pas dans l'agitation mais dans le calme. Un interlocuteur se rassure quand le discours est clair, le rythme stable et les mots precis. Afficher de la confiance, ce n'est pas surjouer; c'est montrer que l'on tient son cadre, que l'on sait dire ce que l'on sait, et ce que l'on doit verifier. Ce calme permet a l'autre de mieux exposer sa situation et d'entendre la proposition. Pour l'installer, prepare un objectif simple avant chaque echange, ralentis volontairement les transitions et privilegie les phrases courtes qui vont a l'essentiel.",
    quizQuestions: [
      {
        question: "Dans ce module, la confiance est surtout liee a...",
        options: [
          "un calme maitrise",
          "un debit de parole rapide",
          "une prise de parole dominante",
          "une argumentation plus longue",
        ],
        answerIndex: 0,
      },
      {
        question: "Quel comportement renforce la credibilite ?",
        options: [
          "promettre un resultat immediat",
          "dire clairement ce qu'il faut verifier",
          "repondre a tout sans nuance",
          "passer vite aux tarifs",
        ],
        answerIndex: 1,
      },
      {
        question: "Pourquoi le calme est-il utile dans un echange client ?",
        options: [
          "il aide l'interlocuteur a s'ouvrir et a mieux comprendre",
          "il permet d'eviter toute question",
          "il remplace la preparation",
          "il raccourcit automatiquement le cycle de vente",
        ],
        answerIndex: 0,
      },
      {
        question: "Quelle habitude est recommandee avant un rendez-vous ?",
        options: [
          "preparer un objectif simple",
          "memoriser tout le catalogue",
          "commencer par les objections",
          "attendre la reaction du client",
        ],
        answerIndex: 0,
      },
      {
        question: "Une parole claire et stable permet surtout de...",
        options: [
          "poser un cadre rassurant",
          "faire pression plus facilement",
          "augmenter le volume de mots",
          "supprimer la phase de decouverte",
        ],
        answerIndex: 0,
      },
    ],
  },
  "mental.resilience-projet": {
    scriptText:
      "En B2B, un refus ne remet pas en cause ta valeur; il signale souvent un timing, une priorite ou un risque non traite. La resilience consiste a analyser ce signal sans t'y accrocher trop longtemps. Au lieu de vivre le non comme une sanction, transforme-le en information: qu'est-ce qui bloque vraiment, qui arbitre, et a quel moment la decision pourra revenir? Cette lecture aide a garder de l'energie et a qualifier plus finement les cycles longs. Une bonne pratique est de terminer chaque refus par une question utile et une trace claire pour la suite.",
    quizQuestions: [
      {
        question: "Dans ce module, un refus est d'abord considere comme...",
        options: [
          "un signal a analyser",
          "une remise en cause personnelle",
          "la fin definitive du dossier",
          "une faute de l'offre",
        ],
        answerIndex: 0,
      },
      {
        question: "La resilience commerciale sert surtout a...",
        options: [
          "revenir vite a une lecture utile du dossier",
          "multiplier les remises",
          "ignorer les objections",
          "relancer sans comprendre",
        ],
        answerIndex: 0,
      },
      {
        question: "Que faut-il chercher derriere un non ?",
        options: [
          "le timing, la priorite ou le risque non traite",
          "une baisse de prix immediate",
          "un changement de produit automatique",
          "une faute de communication interne",
        ],
        answerIndex: 0,
      },
      {
        question: "Une bonne fin d'echange apres un refus consiste a...",
        options: [
          "poser une question utile et tracer la suite",
          "defendre encore plus l'offre",
          "clore brutalement l'echange",
          "sortir le prospect du suivi",
        ],
        answerIndex: 0,
      },
      {
        question: "Pourquoi cette approche est-elle utile en B2B ?",
        options: [
          "parce que les cycles sont souvent longs et multi-acteurs",
          "parce que toutes les decisions sont immediates",
          "parce qu'il n'y a pas d'objections reelles",
          "parce que la relation importe peu",
        ],
        answerIndex: 0,
      },
    ],
  },
  "mental.ethique-confiance": {
    scriptText:
      "L'ethique commerciale n'est pas un frein; c'est un accelerateur de confiance durable. En B2B, un client mesure vite si l'on cherche a signer a tout prix ou a construire une solution utile et tenable. Etre ethique, c'est clarifier les limites, nommer les conditions de succes et ne pas vendre ce qui n'apportera pas de resultat solide. Cette posture protege la recommandation, les renouvellements et la reputation de long terme. Concretement, annonce ce que ton offre couvre, ce qu'elle ne couvre pas, et ce qui doit etre reuni chez le client pour reussir.",
    quizQuestions: [
      {
        question: "Dans ce module, l'ethique est presentee comme...",
        options: [
          "un accelerateur de confiance durable",
          "une contrainte commerciale inutile",
          "une technique de negociation",
          "une etape reservee au juridique",
        ],
        answerIndex: 0,
      },
      {
        question: "Etre ethique en vente B2B consiste notamment a...",
        options: [
          "clarifier les limites et les conditions de succes",
          "promettre une transformation rapide",
          "deplacer les objections apres la signature",
          "vendre la formule la plus large",
        ],
        answerIndex: 0,
      },
      {
        question: "Quel risque est reduit par cette posture ?",
        options: [
          "la deception apres la vente",
          "la phase de decouverte",
          "la preparation du rendez-vous",
          "la qualification du besoin",
        ],
        answerIndex: 0,
      },
      {
        question: "L'effet recherche sur le long terme est surtout...",
        options: [
          "recommandation, renouvellement et reputation",
          "une relance plus agressive",
          "une vente plus rapide a chaque fois",
          "un volume plus grand de demonstrations",
        ],
        answerIndex: 0,
      },
      {
        question: "Dans un echange client, il faut dire clairement...",
        options: [
          "ce que l'offre couvre et ce qu'elle ne couvre pas",
          "que tout peut etre resolu par l'offre",
          "que le client n'a pas de risque",
          "que l'urgence suffit a lancer le projet",
        ],
        answerIndex: 0,
      },
    ],
  },
  "mental.energie-discipline": {
    scriptText:
      "Une performance commerciale reguliere repose moins sur des coups d'eclat que sur une discipline simple. En B2B, la qualite des rendez-vous baisse vite quand le suivi, la preparation et les relances sont geres dans l'urgence. Ce module invite a proteger son energie avec des routines courtes: preparer l'objectif du rendez-vous, noter les engagements avant de passer au dossier suivant, et reserver un temps fixe pour les relances. Cette discipline limite les oublis, reduit la charge mentale et rend l'activite plus fiable. L'enjeu n'est pas d'en faire plus, mais de mieux tenir ce qui compte.",
    quizQuestions: [
      {
        question: "Dans ce module, la discipline commerciale sert surtout a...",
        options: [
          "rendre l'activite plus fiable et moins stressante",
          "allonger la duree des rendez-vous",
          "remplacer le pilotage",
          "multiplier les outils",
        ],
        answerIndex: 0,
      },
      {
        question: "Quelle routine est recommandee ?",
        options: [
          "preparer l'objectif du rendez-vous",
          "attendre que le client rappelle",
          "improviser la relance",
          "changer de methode a chaque echange",
        ],
        answerIndex: 0,
      },
      {
        question: "Pourquoi noter les engagements juste apres un echange ?",
        options: [
          "pour reduire les oublis et la charge mentale",
          "pour rallonger le cycle de vente",
          "pour eviter toute relance",
          "pour remplacer le CRM",
        ],
        answerIndex: 0,
      },
      {
        question: "L'objectif de ce module n'est pas de...",
        options: [
          "faire plus au hasard",
          "tenir une execution reguliere",
          "structurer les relances",
          "mieux proteger son energie",
        ],
        answerIndex: 0,
      },
      {
        question: "Un temps fixe pour les relances permet surtout de...",
        options: [
          "sortir les suivis de l'urgence",
          "supprimer le besoin de qualification",
          "deleguer toute la relation",
          "remplacer les prochaines etapes",
        ],
        answerIndex: 0,
      },
    ],
  },
  "pyramide.pyramide-structure": {
    scriptText:
      "La vente B2B est plus fluide quand l'entretien suit une structure claire. Cette structure n'est pas un script rigide; c'est un enchainement logique qui rassure le client et aide a mieux qualifier. La pyramide de vente repose sur cinq temps: prise de contact, decouverte, argumentation, traitement des objections et prochaine etape. Chaque etape prepare la suivante. Si la decouverte est faible, l'argumentation sera trop generique; si les objections sont mal traitees, la conclusion paraitra forcee. L'enjeu est donc de respecter la logique du parcours, pas de reciter un discours.",
    quizQuestions: [
      {
        question: "La pyramide de vente sert avant tout a...",
        options: [
          "structurer l'entretien de facon rassurante",
          "remplacer la preparation",
          "passer plus vite au prix",
          "supprimer les objections",
        ],
        answerIndex: 0,
      },
      {
        question: "Quelle etape vient juste apres la prise de contact ?",
        options: [
          "la decouverte",
          "le closing",
          "la relance",
          "la contractualisation",
        ],
        answerIndex: 0,
      },
      {
        question: "Si la decouverte est faible, l'argumentation devient souvent...",
        options: [
          "trop generique",
          "plus convaincante",
          "plus courte",
          "inutile",
        ],
        answerIndex: 0,
      },
      {
        question: "Ce module insiste surtout sur...",
        options: [
          "la logique du parcours",
          "la quantite d'arguments",
          "la vitesse de conclusion",
          "le choix du support visuel",
        ],
        answerIndex: 0,
      },
      {
        question: "La bonne posture face a cette structure est de...",
        options: [
          "la suivre comme un cadre, pas comme une recitation",
          "la remplacer par l'improvisation",
          "commencer toujours par l'offre",
          "sauter les etapes quand le client est presse",
        ],
        answerIndex: 0,
      },
    ],
  },
  "pyramide.prise-de-contact": {
    scriptText:
      "La prise de contact ne sert pas seulement a etre agreable; elle sert a poser un cadre. En B2B, un bon demarrage doit rassurer sur trois points: tu comprends pourquoi vous etes la, tu sais comment l'echange va se derouler, et tu respectes le temps de l'interlocuteur. Pour cela, annonce l'objectif du rendez-vous, le plan, la duree estimee et la decision attendue a la fin. Ce cadre t'aide aussi a garder la main sans durcir la relation. Une prise de contact bien menee facilite ensuite la decouverte et limite les digressions.",
    quizQuestions: [
      {
        question: "La prise de contact sert surtout a...",
        options: [
          "poser un cadre clair et rassurant",
          "presenter le tarif rapidement",
          "eviter la phase de decouverte",
          "reciter le pitch complet",
        ],
        answerIndex: 0,
      },
      {
        question: "Quel element doit etre annonce des le debut ?",
        options: [
          "l'objectif et le deroule du rendez-vous",
          "la concurrence principale",
          "le budget final",
          "les objections probables",
        ],
        answerIndex: 0,
      },
      {
        question: "Pourquoi indiquer la duree estimee ?",
        options: [
          "pour montrer que l'on respecte le temps de l'interlocuteur",
          "pour aller plus vite au closing",
          "pour eviter toute question",
          "pour reduire la preparation",
        ],
        answerIndex: 0,
      },
      {
        question: "Une bonne prise de contact aide ensuite a...",
        options: [
          "mieux conduire la decouverte",
          "supprimer les besoins du client",
          "sauter les relances",
          "deplacer la decision a plus tard",
        ],
        answerIndex: 0,
      },
      {
        question: "Quel ton est recherche dans cette etape ?",
        options: [
          "un cadre ferme mais relationnel",
          "une pression commerciale immediate",
          "une neutralite distante",
          "une discussion sans objectif",
        ],
        answerIndex: 0,
      },
    ],
  },
  "pyramide.decouverte": {
    scriptText:
      "La decouverte est le coeur de l'entretien B2B, car elle permet de comprendre ce qui doit vraiment bouger chez le client. L'objectif n'est pas d'accumuler des informations, mais d'identifier la situation actuelle, les difficultes concretes, l'impact business et la priorite reelle. Une bonne decouverte fait parler l'interlocuteur sur ses faits, ses irritants, ses consequences et ses criteres de decision. Elle aide aussi a distinguer le symptome du probleme de fond. Plus cette phase est propre, plus le reste de la vente devient simple et credible.",
    quizQuestions: [
      {
        question: "L'objectif principal de la decouverte est de...",
        options: [
          "comprendre ce qui doit vraiment bouger chez le client",
          "presenter toute l'offre en detail",
          "obtenir un oui rapide",
          "reduire la duree du rendez-vous",
        ],
        answerIndex: 0,
      },
      {
        question: "Une bonne decouverte explore notamment...",
        options: [
          "faits, irritants, impact et priorite",
          "prix, remise et contrat",
          "uniquement la relation personnelle",
          "les objections finales",
        ],
        answerIndex: 0,
      },
      {
        question: "Pourquoi faut-il distinguer symptome et probleme de fond ?",
        options: [
          "pour eviter une proposition trop superficielle",
          "pour aller plus vite au devis",
          "pour limiter les questions",
          "pour rendre l'echange plus technique",
        ],
        answerIndex: 0,
      },
      {
        question: "Quel effet produit une decouverte bien menee ?",
        options: [
          "elle simplifie le reste de la vente",
          "elle rend l'argumentation plus abstraite",
          "elle remplace la prochaine etape",
          "elle supprime les acteurs de decision",
        ],
        answerIndex: 0,
      },
      {
        question: "Dans cette phase, la bonne posture est de...",
        options: [
          "faire parler le client sur sa realite",
          "occuper le temps avec un pitch",
          "donner une solution trop tot",
          "contester les problemes exposes",
        ],
        answerIndex: 0,
      },
    ],
  },
  "pyramide.argumentation": {
    scriptText:
      "Une argumentation efficace en B2B ne consiste pas a empiler des caracteristiques; elle relie une solution a un besoin prioritaire. Chaque argument doit partir d'un fait exprime par le client, montrer l'effet concret de la proposition, puis expliquer pourquoi cet effet compte pour lui. Cette logique evite les discours generiques et rend la valeur beaucoup plus lisible. Une bonne argumentation reste sobre: elle traite peu de points, mais les traite bien. L'essentiel est de faire le lien entre probleme, resultat attendu et modalites de mise en oeuvre.",
    quizQuestions: [
      {
        question: "Une argumentation B2B efficace part d'abord...",
        options: [
          "d'un besoin prioritaire du client",
          "de toutes les caracteristiques produit",
          "de la remise possible",
          "du niveau de concurrence",
        ],
        answerIndex: 0,
      },
      {
        question: "Quel enchainement est recommande ?",
        options: [
          "fait client, effet concret, valeur pour lui",
          "offre, tarif, justification",
          "cas interne, devis, relance",
          "argument, contre-argument, closing",
        ],
        answerIndex: 0,
      },
      {
        question: "Pourquoi faut-il eviter les discours generiques ?",
        options: [
          "parce qu'ils rendent la valeur moins lisible",
          "parce qu'ils raccourcissent la vente",
          "parce qu'ils remplacent la decouverte",
          "parce qu'ils facilitent la signature",
        ],
        answerIndex: 0,
      },
      {
        question: "Une argumentation de qualite est plutot...",
        options: [
          "sobre et reliee aux priorites du client",
          "large et pleine de details techniques",
          "tres rapide et sans exemples",
          "centree sur le fournisseur",
        ],
        answerIndex: 0,
      },
      {
        question: "L'essentiel de cette etape est de relier...",
        options: [
          "probleme, resultat attendu et mise en oeuvre",
          "concurrence, remise et date de signature",
          "catalogue, options et urgence",
          "contact, relance et promotion",
        ],
        answerIndex: 0,
      },
    ],
  },
  "pyramide.objection": {
    scriptText:
      "Une objection n'est pas un blocage a combattre; c'est un point qui n'est pas encore securise dans l'esprit du client. En B2B, elle peut porter sur le budget, la priorite, le timing, le risque de mise en oeuvre ou l'alignement interne. Pour la traiter correctement, commence par la reformuler, puis identifie sa cause reelle avant de repondre. Cette etape demande d'etre calme et precis. L'objectif n'est pas d'avoir le dernier mot, mais de lever un doute ou de qualifier qu'une condition manque encore pour avancer.",
    quizQuestions: [
      {
        question: "Dans ce module, une objection est definie comme...",
        options: [
          "un point pas encore securise dans l'esprit du client",
          "une attaque personnelle",
          "une fin de non-recevoir definitive",
          "une erreur de pricing",
        ],
        answerIndex: 0,
      },
      {
        question: "La premiere action recommande pour traiter une objection est de...",
        options: [
          "la reformuler",
          "la contredire",
          "augmenter la pression",
          "changer de sujet",
        ],
        answerIndex: 0,
      },
      {
        question: "Pourquoi faut-il chercher la cause reelle de l'objection ?",
        options: [
          "pour repondre au vrai doute, pas au symptome",
          "pour raccourcir la decouverte",
          "pour remplacer la prochaine etape",
          "pour eviter tout engagement",
        ],
        answerIndex: 0,
      },
      {
        question: "Le but n'est pas d'avoir le dernier mot, mais de...",
        options: [
          "lever un doute ou qualifier une condition manquante",
          "prouver que le client a tort",
          "multiplier les arguments",
          "faire baisser le prix",
        ],
        answerIndex: 0,
      },
      {
        question: "En B2B, une objection peut concerner...",
        options: [
          "le budget, le timing ou le risque de mise en oeuvre",
          "uniquement le relationnel",
          "uniquement la concurrence",
          "uniquement la reduction demandee",
        ],
        answerIndex: 0,
      },
    ],
  },
  "pyramide.closing": {
    scriptText:
      "Le closing en B2B ne doit pas donner l'impression d'une pression finale; il doit rendre naturelle la prochaine etape. Une bonne conclusion recapitulera ce qui a ete compris, ce qui fait sens pour le client et la decision attendue maintenant. Selon le contexte, cette decision peut etre un devis, un atelier, une validation interne ou un second rendez-vous avec un autre acteur. Le plus important est que la suite soit claire, datee et attribuee. Quand la prochaine etape est precise, l'avancement commercial devient beaucoup plus solide.",
    quizQuestions: [
      {
        question: "Dans ce module, le closing sert surtout a...",
        options: [
          "rendre naturelle la prochaine etape",
          "mettre une pression finale",
          "reciter une offre complete",
          "revenir sur toute la decouverte",
        ],
        answerIndex: 0,
      },
      {
        question: "Que faut-il recapitul er avant de conclure ?",
        options: [
          "ce qui a ete compris et ce qui fait sens pour le client",
          "uniquement le prix final",
          "uniquement la concurrence",
          "la totalite des arguments avances",
        ],
        answerIndex: 0,
      },
      {
        question: "En B2B, une bonne prochaine etape peut etre...",
        options: [
          "un atelier, un devis ou une validation interne",
          "une relance sans date",
          "un document sans destinataire",
          "une promesse orale vague",
        ],
        answerIndex: 0,
      },
      {
        question: "Pourquoi faut-il dater et attribuer la suite ?",
        options: [
          "pour rendre l'avancement concret",
          "pour reduire la qualite du suivi",
          "pour eviter la responsabilite",
          "pour supprimer le besoin de relance",
        ],
        answerIndex: 0,
      },
      {
        question: "Le closing devient fragile quand...",
        options: [
          "la prochaine etape reste floue",
          "la synthese est claire",
          "le besoin a ete qualifie",
          "la decision attendue est explicite",
        ],
        answerIndex: 0,
      },
    ],
  },
  "techniques.ecoute-active": {
    scriptText:
      "L'ecoute active consiste a entendre ce que le client dit, mais aussi ce qu'il essaie de faire comprendre derriere ses mots. En B2B, cela veut dire relever les faits, les tensions, les priorites et les signaux faibles sans preparer sa reponse trop tot. Une ecoute active se voit dans la qualite des relances courtes, dans la reformulation et dans le respect du rythme de l'autre. Elle permet de mieux qualifier et de mieux personnaliser la suite. C'est souvent elle qui fait la difference entre un entretien correct et un entretien vraiment utile.",
    quizQuestions: [
      {
        question: "L'ecoute active consiste principalement a...",
        options: [
          "comprendre les faits et les signaux derriere les mots",
          "attendre son tour pour repondre",
          "prendre plus de notes que le client",
          "faire un pitch plus vite",
        ],
        answerIndex: 0,
      },
      {
        question: "Quel signe montre une vraie ecoute active ?",
        options: [
          "une relance courte et precise",
          "une interruption frequente",
          "une reponse immediate a chaque phrase",
          "un changement de sujet regulier",
        ],
        answerIndex: 0,
      },
      {
        question: "Pourquoi cette technique est-elle precieuse en B2B ?",
        options: [
          "elle aide a mieux qualifier et personnaliser",
          "elle remplace le cadre du rendez-vous",
          "elle supprime la phase d'argumentation",
          "elle reduit automatiquement le cycle de vente",
        ],
        answerIndex: 0,
      },
      {
        question: "Un mauvais reflexe dans cette etape serait de...",
        options: [
          "preparer sa reponse trop tot",
          "laisser le client finir",
          "relever un signal faible",
          "reformuler un point cle",
        ],
        answerIndex: 0,
      },
      {
        question: "L'ecoute active fait souvent la difference entre...",
        options: [
          "un entretien correct et un entretien utile",
          "un devis et un contrat",
          "une relance et un closing",
          "une presentation et une demonstration",
        ],
        answerIndex: 0,
      },
    ],
  },
  "techniques.questionnement-structure": {
    scriptText:
      "Questionner avec structure permet de guider la reflexion du client sans le brusquer. En B2B, commence par des questions ouvertes pour faire apparaitre le contexte, puis resserre progressivement vers les faits, les priorites et les criteres de decision. Cette progression evite les questionnaires mecaniques et garde une logique utile. Elle aide aussi a ne pas oublier les sujets sensibles: impact, urgence, parties prenantes et conditions de succes. Un bon questionnement ne multiplie pas les questions; il pose les bonnes, au bon moment.",
    quizQuestions: [
      {
        question: "Le bon ordre de questionnement en B2B est plutot...",
        options: [
          "ouvert puis de plus en plus cadre",
          "ferme des la premiere minute",
          "technique puis relationnel",
          "prix puis besoin",
        ],
        answerIndex: 0,
      },
      {
        question: "Pourquoi commencer par des questions ouvertes ?",
        options: [
          "pour faire apparaitre le contexte reel",
          "pour eviter toute structure",
          "pour conclure plus vite",
          "pour limiter la parole du client",
        ],
        answerIndex: 0,
      },
      {
        question: "Cette progression aide notamment a couvrir...",
        options: [
          "impact, urgence, parties prenantes et succes",
          "catalogue, remise et promotion",
          "planning interne uniquement",
          "les objections finales seulement",
        ],
        answerIndex: 0,
      },
      {
        question: "Un bon questionnement cherche surtout a...",
        options: [
          "poser les bonnes questions au bon moment",
          "poser le plus de questions possible",
          "remplacer la reformulation",
          "eviter les sujets sensibles",
        ],
        answerIndex: 0,
      },
      {
        question: "Quel risque evite un questionnement structure ?",
        options: [
          "le questionnaire mecanique sans logique",
          "la synthese finale",
          "la prochaine etape explicite",
          "la personnalisation de l'offre",
        ],
        answerIndex: 0,
      },
    ],
  },
  "techniques.reformulation-synthese": {
    scriptText:
      "Reformuler, c'est verifier la comprehension mutuelle sans ralentir l'echange. En B2B, cette technique est utile pour confirmer un point sensible, faire ressortir un impact ou tester si l'on a bien compris la priorite. Une bonne reformulation reste breve et neutre: elle reprend l'essentiel sans interpreter trop vite. La synthese, elle, sert a remettre de l'ordre avant de proposer une suite. Ensemble, ces deux gestes reduisent les malentendus et renforcent la perception de professionnalisme.",
    quizQuestions: [
      {
        question: "Reformuler sert d'abord a...",
        options: [
          "verifier la comprehension mutuelle",
          "montrer que l'on sait deja",
          "gagner du temps sur la decouverte",
          "eviter la synthese finale",
        ],
        answerIndex: 0,
      },
      {
        question: "Une bonne reformulation doit etre...",
        options: [
          "breve et neutre",
          "longue et tres detaillee",
          "interpretee des le debut",
          "centrale sur l'offre",
        ],
        answerIndex: 0,
      },
      {
        question: "La synthese sert surtout a...",
        options: [
          "remettre de l'ordre avant la suite",
          "ajouter de nouvelles informations",
          "remplacer les objections",
          "faire monter la pression",
        ],
        answerIndex: 0,
      },
      {
        question: "Quel benefice majeur apporte ce duo technique ?",
        options: [
          "moins de malentendus et plus de professionnalisme",
          "moins de preparation en amont",
          "une signature immediate",
          "moins d'acteurs de decision",
        ],
        answerIndex: 0,
      },
      {
        question: "A quel moment la reformulation est-elle utile ?",
        options: [
          "quand un point sensible ou prioritaire apparait",
          "uniquement a la fin du rendez-vous",
          "seulement apres un refus",
          "uniquement dans les appels entrants",
        ],
        answerIndex: 0,
      },
    ],
  },
  "techniques.preuve-storytelling": {
    scriptText:
      "En vente B2B, la preuve rassure plus que la promesse. Utiliser une preuve, c'est montrer qu'un resultat est credible: cas client, chiffre, exemple d'usage, retour terrain ou scenario comparable. Le storytelling n'est pas la pour faire joli; il sert a rendre une situation concrete, memorable et facile a se projeter. Une bonne preuve reste proche du contexte du client et relie clairement le point de depart, l'action et le resultat. Plus elle est simple et precise, plus elle devient convaincante.",
    quizQuestions: [
      {
        question: "Dans ce module, la preuve sert avant tout a...",
        options: [
          "rendre un resultat credible",
          "remplacer la decouverte",
          "eviter les objections",
          "rallonger la presentation",
        ],
        answerIndex: 0,
      },
      {
        question: "Le storytelling est utile surtout parce qu'il...",
        options: [
          "rend la situation concrete et memoireable",
          "ajoute du spectacle a l'offre",
          "evite de parler de faits",
          "remplace la structure de vente",
        ],
        answerIndex: 0,
      },
      {
        question: "Quelle preuve est la plus efficace ?",
        options: [
          "une preuve proche du contexte du client",
          "une anecdote tres generale",
          "une promesse sans exemple",
          "une statistique sans source",
        ],
        answerIndex: 0,
      },
      {
        question: "Une bonne preuve doit relier...",
        options: [
          "point de depart, action et resultat",
          "prix, remise et signature",
          "script, objection et closing",
          "contact, email et rappel",
        ],
        answerIndex: 0,
      },
      {
        question: "Pourquoi faut-il rester simple et precis ?",
        options: [
          "parce que la projection devient plus convaincante",
          "parce que cela remplace la qualification",
          "parce que le client veut plus de jargon",
          "parce que la concurrence le fait",
        ],
        answerIndex: 0,
      },
    ],
  },
  "techniques.rythme-engagement": {
    scriptText:
      "Le rythme d'un entretien B2B se voit dans la facon dont on fait avancer la conversation sans la brusquer. Il faut alterner exploration, clarification et decision pour garder une dynamique utile. Trop lent, l'entretien se dilue; trop rapide, il fait perdre l'adhesion. L'engagement, lui, se construit en obtenant de petits accords successifs: valider un constat, confirmer une priorite, accepter une prochaine etape. Cette progression cree de l'avancement reel sans tension inutile. Le bon rythme est celui qui maintient la clarte et l'implication du client jusqu'a la suite decidee ensemble.",
    quizQuestions: [
      {
        question: "Dans ce module, un bon rythme d'entretien sert a...",
        options: [
          "faire avancer la conversation avec clarte",
          "accumuler les sujets sans priorite",
          "aller plus vite que le client",
          "retarder la prochaine etape",
        ],
        answerIndex: 0,
      },
      {
        question: "Quel risque existe si l'entretien est trop lent ?",
        options: [
          "il se dilue",
          "il devient plus precis",
          "il traite mieux les objections",
          "il accelere la decision",
        ],
        answerIndex: 0,
      },
      {
        question: "Comment construit-on l'engagement ?",
        options: [
          "avec de petits accords successifs",
          "avec une conclusion directe des les premieres minutes",
          "avec un argumentaire plus long",
          "avec une relance plus frequente",
        ],
        answerIndex: 0,
      },
      {
        question: "Quel exemple de petit accord est pertinent ?",
        options: [
          "valider un constat ou une priorite",
          "promettre la signature",
          "supprimer la phase de decouverte",
          "deplacer toute decision a plus tard",
        ],
        answerIndex: 0,
      },
      {
        question: "Le bon rythme est celui qui maintient...",
        options: [
          "clarte et implication du client",
          "pression et vitesse de parole",
          "complexite et volume d'information",
          "distance et formalisme",
        ],
        answerIndex: 0,
      },
    ],
  },
};

export function getBaseModuleContent(contentKey: string) {
  const content = BASE_MODULE_CONTENT[contentKey];
  if (!content) {
    throw new Error(`Missing base content for module ${contentKey}`);
  }
  return content;
}

export function listMissingBaseModuleContent() {
  return BASE_MODULES.filter((module) => !BASE_MODULE_CONTENT[module.partKey + "." + module.chapterKey]).map(
    (module) => `${module.partKey}.${module.chapterKey}`
  );
}
