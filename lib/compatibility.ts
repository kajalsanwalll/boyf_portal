import {
  PersonalityType,
  RelationshipIntent,
} from "@prisma/client";

type CandidateAnswers = {
  communication?: string | null;
  conflictStyle?: string | null;

  workoutFrequency?: string | null;
  diet?: string | null;
  weekendPreference?: string | null;
  travels?: string | null;

  personality?: PersonalityType | null;

  relationshipIntent?: RelationshipIntent | null;
  longTermGoals?: string | null;
  relationshipNeeds?: string | null;

  values?: string | null;

  fryProtocol?: string | null;
  fineResponse?: string | null;
  readResponse?: string | null;
  toiletProtocol?: string | null;
  whyGoodBoyfriend?: string | null;
};

function scoreText(
  value: string | null | undefined,
  weights: Record<string, number>,
  fallback = 60
) {
  if (!value) return fallback;

  const normalized = value.toLowerCase();

  for (const [keyword, score] of Object.entries(weights)) {
    if (normalized.includes(keyword.toLowerCase())) {
      return score;
    }
  }

  return fallback;
}

function average(values: number[]) {
  if (values.length === 0) return 60;

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
}

/* --------------------------------
   COMMUNICATION
-------------------------------- */

function calculateCommunication(candidate: CandidateAnswers) {
  const communication = scoreText(candidate.communication, {
    "open": 90,
    "honest": 95,
    "clear": 90,
    "direct": 88,
    "talk": 85,
    "communicate": 90,
    "avoid": 45,
    "silent": 40,
    "shut down": 35,
    "ignore": 30,
  });

  const conflict = scoreText(candidate.conflictStyle, {
    "talk": 90,
    "communicate": 90,
    "discuss": 92,
    "calm": 88,
    "listen": 90,
    "space": 75,
    "avoid": 40,
    "ignore": 30,
    "yell": 30,
  });

  return average([communication, conflict]);
}

/* --------------------------------
   LIFESTYLE
-------------------------------- */

function calculateLifestyle(candidate: CandidateAnswers) {
  const workout = scoreText(candidate.workoutFrequency, {
    "daily": 85,
    "regular": 85,
    "4": 85,
    "5": 90,
    "3": 80,
    "sometimes": 70,
    "rarely": 55,
    "never": 50,
  });

  const weekend = scoreText(candidate.weekendPreference, {
    "active": 85,
    "out": 80,
    "travel": 85,
    "adventure": 90,
    "home": 70,
    "chill": 75,
    "sleep": 65,
    "party": 75,
  });

  const travel = scoreText(candidate.travels, {
    "love": 90,
    "often": 90,
    "frequent": 90,
    "yes": 80,
    "sometimes": 75,
    "rarely": 60,
    "never": 50,
  });

  return average([workout, weekend, travel]);
}

/* --------------------------------
   RELATIONSHIP ALIGNMENT
-------------------------------- */

function calculateRelationship(candidate: CandidateAnswers) {
  let intentScore = 60;

  switch (candidate.relationshipIntent) {
    case RelationshipIntent.SERIOUS:
      intentScore = 95;
      break;

    case RelationshipIntent.MARRIAGE:
      intentScore = 95;
      break;

    case RelationshipIntent.OPEN_TO_SEEING:
      intentScore = 75;
      break;

    case RelationshipIntent.CASUAL:
      intentScore = 55;
      break;

    case RelationshipIntent.FOR_THE_PLOT:
      intentScore = 45;
      break;
  }

  const goals = scoreText(candidate.longTermGoals, {
    "serious": 95,
    "long term": 95,
    "marriage": 95,
    "family": 90,
    "relationship": 85,
    "growth": 80,
    "career": 75,
    "explore": 70,
    "casual": 50,
    "nothing": 40,
  });

  const needs = scoreText(candidate.relationshipNeeds, {
    "communication": 90,
    "trust": 95,
    "honesty": 95,
    "respect": 95,
    "support": 90,
    "loyalty": 95,
    "space": 75,
    "fun": 80,
  });

  return average([intentScore, goals, needs]);
}

/* --------------------------------
   VALUES
-------------------------------- */

function calculateValues(candidate: CandidateAnswers) {
  return scoreText(candidate.values, {
    "honesty": 95,
    "trust": 95,
    "respect": 95,
    "family": 90,
    "loyalty": 95,
    "kindness": 95,
    "growth": 85,
    "ambition": 85,
    "communication": 90,
    "independence": 80,
    "freedom": 75,
  });
}

/* --------------------------------
   FUN / PERSONALITY
-------------------------------- */

function calculateHumor(candidate: CandidateAnswers) {
  const personalityScores: Partial<
    Record<PersonalityType, number>
  > = {
    INTROVERT: 75,
    EXTROVERT: 90,
    AMBIVERT: 95,
    DEPENDS: 80,
  };

  const personality =
    candidate.personality
      ? personalityScores[candidate.personality] ?? 75
      : 75;

  const funnyAnswers = [
    candidate.fryProtocol,
    candidate.fineResponse,
    candidate.readResponse,
    candidate.toiletProtocol,
    candidate.whyGoodBoyfriend,
  ].filter(Boolean).join(" ");

  let answerScore = 70;

  if (funnyAnswers.length > 100) {
    answerScore += 10;
  }

  if (
    /funny|haha|lol|joke|laugh|chaos|banter|roast/i.test(
      funnyAnswers
    )
  ) {
    answerScore += 10;
  }

  if (
    /depends|share|obviously|respect|communicate/i.test(
      funnyAnswers
    )
  ) {
    answerScore += 5;
  }

  answerScore = Math.min(answerScore, 100);

  return average([personality, answerScore]);
}

/* --------------------------------
   MAIN CALCULATOR
-------------------------------- */

export function calculateCompatibility(
  candidate: CandidateAnswers
) {
  const communicationScore =
    calculateCommunication(candidate);

  const lifestyleScore =
    calculateLifestyle(candidate);

  const relationshipScore =
    calculateRelationship(candidate);

  const valuesScore =
    calculateValues(candidate);

  const humorScore =
    calculateHumor(candidate);

  const compatibilityScore = Math.round(
    communicationScore * 0.25 +
      relationshipScore * 0.25 +
      lifestyleScore * 0.2 +
      valuesScore * 0.2 +
      humorScore * 0.1
  );

  return {
    compatibilityScore,
    communicationScore,
    lifestyleScore,
    valuesScore,
    humorScore,

    // We don't have a relationshipScore column
    // in the current Prisma schema, so this is
    // intentionally only used for the overall score.
    relationshipScore,
  };
}