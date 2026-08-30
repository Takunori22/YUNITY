export default {
  intro: "Veuillez cocher une case sauf indication contraire. Il n’y a pas de bonne ou de mauvaise réponse.",
  consent: "Vos réponses sont recueillies de façon anonyme et servent uniquement à améliorer le projet YU-NITY.",
  section: {
    s1: "Informations de base",
    s2: "Avant l’expérience",
    s3: "Après l’expérience",
    s4: "Pour finir",
  },
  q: {
    q1_nationality: { label: "Quelle est votre nationalité ?" },
    q2_visited_before: {
      label: "Avez-vous déjà fréquenté un sento (bain public japonais) ?",
      opt: { first_time: "C’est ma première fois", visited_before: "J’en ai déjà fréquenté un" },
    },
    q3_familiarity: {
      label: "Avant cette expérience, connaissiez-vous les sento en tant qu’élément de la culture japonaise ?",
      opt: {
        knew_a_lot: "Je connaissais bien",
        knew_a_little: "Je connaissais un peu",
        heard_only: "J’en avais seulement entendu parler",
        did_not_know: "Je ne connaissais pas",
      },
    },
    q4_hesitation: {
      label: "Aviez-vous des inquiétudes ou des réticences à l’idée de vivre l’expérience d’un sento ?",
      opt: { a_lot: "Beaucoup", some: "Un peu", not_much: "Pas beaucoup", none: "Pas du tout" },
    },
    q5_concerns: {
      label: "Qu’est-ce qui vous inquiétait ? (Plusieurs réponses possibles)",
      opt: {
        naked: "Être nu(e)",
        etiquette: "Les règles et les bonnes manières dans le bain",
        language: "Ne pas comprendre la langue",
        with_others: "Se baigner avec d’autres personnes",
        tattoos: "Les tatouages",
        other: "Autre",
        none: "Aucune",
      },
    },
    q6_explanation_helped: {
      label: "L’explication préalable des règles et des bonnes manières vous a-t-elle aidé(e) à utiliser le sento plus sereinement ?",
    },
    q7_understanding_deepened: {
      label: "Après cette expérience, pensez-vous avoir approfondi votre compréhension de la culture et des coutumes japonaises ?",
    },
    q8_impression_change: {
      label: "Votre image des sento japonais a-t-elle changé après l’expérience ?",
      opt: {
        much_more_positive: "Elle est devenue beaucoup plus positive",
        somewhat_more_positive: "Elle est devenue un peu plus positive",
        no_change: "Elle n’a pas changé",
        more_negative: "Elle est devenue plus négative",
      },
    },
    q9_felt_closer: {
      label: "Cette expérience vous a-t-elle permis de vous sentir plus proche de la culture et de la vie quotidienne japonaises ?",
    },
    q10_free_comment: {
      label: "Veuillez nous parler librement de ce qui vous a marqué pendant cette expérience du sento ou des aspects de la culture japonaise que vous avez découverts pour la première fois.",
    },
  },
  scale: { low: "1 = Pas du tout", high: "5 = Tout à fait" },
  nationality: { placeholder: "Sélectionnez votre pays" },
  ui: {
    back: "Retour",
    next: "Suivant",
    submit: "Envoyer",
    step: "Étape {n} / {total}",
    required: "Cette question est obligatoire.",
    pick_one_plus: "Veuillez sélectionner au moins une option.",
    retry: "Réessayer",
  },
  thanks: {
    title: "Merci d’avoir partagé votre expérience.",
    body: "Votre réponse a bien été enregistrée.",
    home: "Retour à l’accueil",
  },
  error_generic: "Une erreur s’est produite lors de l’envoi. Veuillez réessayer.",
};
