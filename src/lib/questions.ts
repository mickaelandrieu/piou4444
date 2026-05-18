export type Dimension = "attention" | "organisation" | "impulsivite";

export type AsrsQuestion = {
  id: number;
  text: string;
  dimension: Dimension;
  partA: boolean;
};

export type ContextualQuestion = {
  id: string;
  text: string;
  axis: "travail" | "quotidien" | "temps" | "oubli" | "stress";
};

export const ASRS_SCALE: { value: number; label: string }[] = [
  { value: 0, label: "Jamais" },
  { value: 1, label: "Rarement" },
  { value: 2, label: "Parfois" },
  { value: 3, label: "Souvent" },
  { value: 4, label: "Très souvent" },
];

export const ASRS_QUESTIONS: AsrsQuestion[] = [
  {
    id: 1,
    text: "À quelle fréquence avez-vous des difficultés pour terminer les derniers détails d'un projet, une fois que les parties les plus stimulantes ont été réalisées ?",
    dimension: "organisation",
    partA: true,
  },
  {
    id: 2,
    text: "À quelle fréquence avez-vous des difficultés pour mettre les choses en ordre quand vous devez accomplir une tâche qui demande de l'organisation ?",
    dimension: "organisation",
    partA: true,
  },
  {
    id: 3,
    text: "À quelle fréquence avez-vous des problèmes pour vous rappeler vos rendez-vous ou vos obligations ?",
    dimension: "organisation",
    partA: true,
  },
  {
    id: 4,
    text: "Lorsque vous devez réaliser une tâche qui demande beaucoup de réflexion, à quelle fréquence évitez-vous de la commencer ou la remettez-vous à plus tard ?",
    dimension: "organisation",
    partA: true,
  },
  {
    id: 5,
    text: "À quelle fréquence vous tortillez-vous ou tripotez-vous des objets quand vous devez rester assis(e) longtemps ?",
    dimension: "impulsivite",
    partA: true,
  },
  {
    id: 6,
    text: "À quelle fréquence vous sentez-vous trop actif(ve) et obligé(e) de faire des choses, comme si vous étiez monté(e) sur un ressort ?",
    dimension: "impulsivite",
    partA: true,
  },
  {
    id: 7,
    text: "À quelle fréquence faites-vous des erreurs d'inattention lorsque vous travaillez sur un projet ennuyeux ou difficile ?",
    dimension: "attention",
    partA: false,
  },
  {
    id: 8,
    text: "À quelle fréquence avez-vous des difficultés à maintenir votre attention lorsque vous faites un travail ennuyeux ou répétitif ?",
    dimension: "attention",
    partA: false,
  },
  {
    id: 9,
    text: "À quelle fréquence avez-vous des difficultés à vous concentrer sur ce que les gens disent, même quand ils vous parlent directement ?",
    dimension: "attention",
    partA: false,
  },
  {
    id: 10,
    text: "À quelle fréquence égarez-vous des objets à la maison ou au travail, ou avez-vous des difficultés à les retrouver ?",
    dimension: "attention",
    partA: false,
  },
  {
    id: 11,
    text: "À quelle fréquence êtes-vous distrait(e) par l'activité ou le bruit autour de vous ?",
    dimension: "attention",
    partA: false,
  },
  {
    id: 12,
    text: "À quelle fréquence quittez-vous votre siège lors de réunions ou dans d'autres situations où vous êtes supposé(e) rester assis(e) ?",
    dimension: "impulsivite",
    partA: false,
  },
  {
    id: 13,
    text: "À quelle fréquence vous sentez-vous agité(e) ou nerveux(se) ?",
    dimension: "impulsivite",
    partA: false,
  },
  {
    id: 14,
    text: "À quelle fréquence avez-vous des difficultés à vous détendre quand vous avez du temps libre ?",
    dimension: "impulsivite",
    partA: false,
  },
  {
    id: 15,
    text: "À quelle fréquence vous arrive-t-il de trop parler dans des situations sociales ?",
    dimension: "impulsivite",
    partA: false,
  },
  {
    id: 16,
    text: "Quand vous êtes en pleine conversation, à quelle fréquence finissez-vous les phrases des personnes à qui vous parlez avant qu'elles n'aient pu les finir elles-mêmes ?",
    dimension: "impulsivite",
    partA: false,
  },
  {
    id: 17,
    text: "À quelle fréquence avez-vous des difficultés à attendre votre tour quand cela est nécessaire ?",
    dimension: "impulsivite",
    partA: false,
  },
  {
    id: 18,
    text: "À quelle fréquence interrompez-vous les autres quand ils sont occupés ?",
    dimension: "impulsivite",
    partA: false,
  },
];

export const SCREENER_QUESTIONS = ASRS_QUESTIONS.filter((q) => q.partA);
export const FULL_QUESTIONS = ASRS_QUESTIONS;

export const CONTEXTUAL_QUESTIONS: ContextualQuestion[] = [
  {
    id: "travail",
    text: "Au cours des 6 derniers mois, dans quelle mesure ces difficultés ont-elles impacté votre travail ou vos études ?",
    axis: "travail",
  },
  {
    id: "quotidien",
    text: "Dans quelle mesure ont-elles impacté votre vie quotidienne (relations, loisirs, vie sociale) ?",
    axis: "quotidien",
  },
  {
    id: "temps",
    text: "À quelle fréquence rencontrez-vous des difficultés à organiser ou à gérer votre temps ?",
    axis: "temps",
  },
  {
    id: "oubli",
    text: "À quelle fréquence vous sentez-vous désorganisé(e) ou avez-vous des oublis qui vous mettent en difficulté ?",
    axis: "oubli",
  },
  {
    id: "stress",
    text: "À quelle fréquence ces difficultés génèrent-elles du stress ou de la frustration ?",
    axis: "stress",
  },
];

export const CONTEXTUAL_SCALE: { value: number; label: string }[] = [
  { value: 0, label: "Pas du tout" },
  { value: 1, label: "Un peu" },
  { value: 2, label: "Modérément" },
  { value: 3, label: "Beaucoup" },
  { value: 4, label: "Énormément" },
];
