export type BasePartKey = "mental" | "pyramide" | "techniques";

export type BaseModuleDefinition = {
  partKey: BasePartKey;
  chapterKey: string;
  title: string;
  orderIndex: number;
  adaptationGuideline: string;
};

export type BasePartDefinition = {
  key: BasePartKey;
  title: string;
  modules: Omit<BaseModuleDefinition, "partKey">[];
};

// Structure pedagogique fixe: les modules ne changent jamais.
// Seuls les exemples, le vocabulaire et les objections peuvent etre adaptes par client.
export const BASE_LEARNING_STRUCTURE: BasePartDefinition[] = [
  {
    key: "mental",
    title: "Mental",
    modules: [
      {
        chapterKey: "posture-service",
        title: "Posture service",
        orderIndex: 1,
        adaptationGuideline: "Relier la posture de service aux situations du terrain client.",
      },
      {
        chapterKey: "confiance-calme",
        title: "Confiance calme",
        orderIndex: 2,
        adaptationGuideline: "Utiliser un vocabulaire rassurant et simple pour non commerciaux.",
      },
      {
        chapterKey: "resilience-projet",
        title: "Resilience projet",
        orderIndex: 3,
        adaptationGuideline: "Illustrer les refus et objections courantes sans jargon technique.",
      },
      {
        chapterKey: "ethique-confiance",
        title: "Ethique confiance",
        orderIndex: 4,
        adaptationGuideline: "Insister sur la relation de confiance long terme et la transparence.",
      },
      {
        chapterKey: "energie-discipline",
        title: "Energie discipline",
        orderIndex: 5,
        adaptationGuideline: "Proposer des routines applicables immediatement en contexte reel.",
      },
    ],
  },
  {
    key: "pyramide",
    title: "Pyramide de la vente",
    modules: [
      {
        chapterKey: "pyramide-structure",
        title: "Pyramide structure",
        orderIndex: 6,
        adaptationGuideline: "Expliquer la logique de parcours avec des etapes claires et concretes.",
      },
      {
        chapterKey: "prise-de-contact",
        title: "Prise de contact",
        orderIndex: 7,
        adaptationGuideline: "Fournir des formulations naturelles pour debutants en vente.",
      },
      {
        chapterKey: "decouverte",
        title: "Decouverte",
        orderIndex: 8,
        adaptationGuideline: "Mettre en avant les bonnes questions et l'ecoute active client.",
      },
      {
        chapterKey: "argumentation",
        title: "Argumentation",
        orderIndex: 9,
        adaptationGuideline: "Transformer les caracteristiques en benefices simples et concrets.",
      },
      {
        chapterKey: "objection",
        title: "Objection",
        orderIndex: 10,
        adaptationGuideline: "Traiter les objections sans pression, avec empathie et clarte.",
      },
      {
        chapterKey: "closing",
        title: "Closing",
        orderIndex: 11,
        adaptationGuideline: "Conclure avec une prochaine etape explicite et non aggressive.",
      },
    ],
  },
  {
    key: "techniques",
    title: "Techniques",
    modules: [
      {
        chapterKey: "ecoute-active",
        title: "Ecoute active",
        orderIndex: 12,
        adaptationGuideline: "Donner des exemples de reformulation en situation operationnelle.",
      },
      {
        chapterKey: "questionnement-structure",
        title: "Questionnement structure",
        orderIndex: 13,
        adaptationGuideline: "Favoriser les questions ouvertes puis de cadrage pragmatique.",
      },
      {
        chapterKey: "reformulation-synthese",
        title: "Reformulation synthese",
        orderIndex: 14,
        adaptationGuideline: "Verifier la comprehension mutuelle en fin d'echange.",
      },
      {
        chapterKey: "preuve-storytelling",
        title: "Preuve storytelling",
        orderIndex: 15,
        adaptationGuideline: "Utiliser des preuves factuelles et des mini-cas clients credibles.",
      },
      {
        chapterKey: "rythme-engagement",
        title: "Rythme engagement",
        orderIndex: 16,
        adaptationGuideline: "Maintenir un rythme clair avec des engagements actionnables.",
      },
    ],
  },
];

export const BASE_MODULES: BaseModuleDefinition[] = BASE_LEARNING_STRUCTURE.flatMap((part) =>
  part.modules.map((module) => ({
    ...module,
    partKey: part.key,
  }))
);

export function findBaseModule(partKey: BasePartKey, chapterKey: string) {
  return BASE_MODULES.find((module) => module.partKey === partKey && module.chapterKey === chapterKey);
}

export function getVoiceSlotForOrder(orderIndex: number): "FEMALE" | "MALE" {
  return orderIndex % 2 === 1 ? "FEMALE" : "MALE";
}
