import { Dimension } from "./questions";
import { FullResult, Level, ScreenerResult } from "./scoring";

export const LEVEL_LABEL: Record<Level, string> = {
  faible: "faible",
  modere: "modéré",
  eleve: "élevé",
};

export const LEVEL_COLOR: Record<Level, string> = {
  faible: "bg-signal-low",
  modere: "bg-signal-mid",
  eleve: "bg-signal-high",
};

export const DIMENSION_LABEL: Record<Dimension, string> = {
  attention: "Attention",
  organisation: "Organisation / exécution",
  impulsivite: "Impulsivité / agitation",
};

export const DIMENSION_DESCRIPTION: Record<Dimension, string> = {
  attention:
    "Capacité à maintenir sa concentration, à filtrer les distractions et à garder le fil dans la durée.",
  organisation:
    "Capacité à planifier, prioriser, démarrer et finaliser les tâches, à se souvenir des engagements.",
  impulsivite:
    "Régulation de l'agitation interne, du besoin de bouger, de la prise de parole et de la patience.",
};

export function screenerSummary(r: ScreenerResult): string {
  switch (r.level) {
    case "faible":
      return "Votre screening initial ne met pas en évidence de signal attentionnel marqué. Les difficultés que vous rencontrez semblent ponctuelles plutôt que persistantes.";
    case "modere":
      return "Votre screening initial fait apparaître un signal modéré. Certaines difficultés attentionnelles semblent revenir régulièrement et méritent d'être explorées plus précisément.";
    case "eleve":
      return "Votre screening initial fait apparaître un signal élevé. Les difficultés attentionnelles décrites semblent fréquentes et il peut être pertinent d'approfondir avec le questionnaire complet.";
  }
}

export function dimensionInsight(d: Dimension, level: Level): string {
  const map: Record<Dimension, Record<Level, string>> = {
    attention: {
      faible:
        "Votre attention semble globalement stable, avec des fluctuations qui restent dans la norme.",
      modere:
        "Des difficultés à maintenir une attention soutenue apparaissent, en particulier sur les tâches peu stimulantes ou répétitives.",
      eleve:
        "Des difficultés marquées de maintien attentionnel apparaissent : fragmentation, distractibilité, surcharge cognitive possibles.",
    },
    organisation: {
      faible:
        "L'organisation et la planification semblent globalement fonctionnelles au quotidien.",
      modere:
        "Des frictions apparaissent dans la planification, la priorisation ou la finalisation des tâches.",
      eleve:
        "Des difficultés importantes d'organisation, de démarrage et de clôture des tâches sont rapportées, avec un risque d'évitement ou de procrastination.",
    },
    impulsivite: {
      faible:
        "La régulation de l'agitation et de l'impulsivité semble en place dans la plupart des contextes.",
      modere:
        "Une agitation interne ou une difficulté à attendre / se poser apparaît dans certains contextes.",
      eleve:
        "Une agitation, une impulsivité ou une difficulté à se mettre au repos sont fréquemment rapportées.",
    },
  };
  return map[d][level];
}

export function globalInterpretation(full: FullResult): string {
  const impact = full.contextual.level;
  const lvl = full.level;
  if (lvl === "faible" && impact === "faible") {
    return "Votre profil n'indique pas de difficultés attentionnelles persistantes avec un impact fonctionnel notable.";
  }
  if (lvl === "eleve" && impact === "eleve") {
    return "Votre profil indique des difficultés attentionnelles significatives, associées à un impact fonctionnel élevé sur votre organisation et votre quotidien.";
  }
  if (lvl === "eleve") {
    return "Votre profil indique des difficultés attentionnelles significatives. L'impact fonctionnel rapporté semble plus modéré, ce qui peut refléter des stratégies de compensation.";
  }
  if (impact === "eleve") {
    return "Vos scores attentionnels restent modérés, mais l'impact fonctionnel rapporté est important. La charge mentale ou le contexte de vie pèsent peut-être autant que les symptômes eux-mêmes.";
  }
  return "Votre profil indique des difficultés attentionnelles présentes mais modérées, avec un impact fonctionnel partiel sur l'organisation quotidienne.";
}

export type Recommendation = { title: string; body: string };

export function recommendations(full: FullResult): Recommendation[] {
  const lvl = full.level;
  const recs: Recommendation[] = [];

  if (lvl === "faible") {
    recs.push({
      title: "Conserver des habitudes structurantes",
      body: "Un agenda partagé, une routine de revue hebdomadaire et la limitation des notifications suffisent souvent à maintenir un bon fonctionnement attentionnel.",
    });
    recs.push({
      title: "Hygiène cognitive",
      body: "Sommeil régulier, pauses courtes, activité physique : trois leviers simples pour maintenir la qualité de l'attention.",
    });
  }

  if (lvl === "modere") {
    recs.push({
      title: "Découper et prioriser",
      body: "Travailler en tranches courtes (méthode Pomodoro), n'inscrire que 3 priorités majeures par jour et clôturer chaque tâche avant d'en démarrer une autre.",
    });
    recs.push({
      title: "Externaliser la mémoire",
      body: "Tout sortir de la tête : listes, rappels, capture immédiate des idées. Réduire la charge mentale aide à libérer de l'attention pour ce qui compte.",
    });
    recs.push({
      title: "Réduire les interruptions",
      body: "Notifications désactivées, environnement de travail apaisé, plages de concentration protégées. La distractibilité diminue quand l'environnement collabore.",
    });
  }

  if (lvl === "eleve") {
    recs.push({
      title: "Envisager un échange avec un professionnel",
      body: "Un médecin, un psychiatre ou un psychologue formé au fonctionnement attentionnel pourra proposer une évaluation approfondie. Ce résultat ne constitue pas un diagnostic.",
    });
    recs.push({
      title: "Structurer l'environnement",
      body: "Routines visibles, alarmes, listes courtes, séquençage explicite des tâches : l'environnement doit faire une partie du travail à votre place.",
    });
    recs.push({
      title: "Repérer ce qui aggrave et ce qui aide",
      body: "Noter pendant deux semaines les contextes où l'attention décroche et ceux où elle tient. Cette cartographie est précieuse, pour vous comme pour un professionnel.",
    });
  }

  if (full.contextual.level === "eleve" && lvl !== "eleve") {
    recs.push({
      title: "Soulager la charge fonctionnelle",
      body: "Même si les scores attentionnels restent modérés, l'impact ressenti est important. Identifier les zones de friction concrètes (travail, oublis, stress) et alléger une à la fois peut faire une vraie différence.",
    });
  }

  return recs;
}

export function buildBullets(full: FullResult): string[] {
  const out: string[] = [];
  if (full.dimensions.attention.level !== "faible") {
    out.push("Difficultés de maintien de l'attention sur les tâches peu stimulantes.");
  }
  if (full.dimensions.organisation.level !== "faible") {
    out.push("Frictions de planification, priorisation et finalisation des tâches.");
  }
  if (full.dimensions.impulsivite.level !== "faible") {
    out.push("Agitation ou difficulté à attendre / se poser dans certains contextes.");
  }
  if (full.contextual.level === "eleve") {
    out.push("Impact fonctionnel élevé sur le travail, le quotidien ou le bien-être.");
  } else if (full.contextual.level === "modere") {
    out.push("Impact fonctionnel modéré sur l'organisation et le bien-être.");
  }
  if (out.length === 0) {
    out.push("Pas de difficulté attentionnelle marquée mise en évidence.");
  }
  return out;
}
