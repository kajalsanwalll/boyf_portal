import {
  PrismaClient,
  ApplicationStatus,
  PersonalityType,
  RelationshipIntent,
} from "@prisma/client";

const prisma = new PrismaClient();

const cities = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Pune",
  "Hyderabad",
  "Chandigarh",
  "Jaipur",
  "Chennai",
  "Kolkata",
  "Gurgaon",
];

const firstNames = [
  "Aarav",
  "Arjun",
  "Kabir",
  "Rohan",
  "Aditya",
  "Vihaan",
  "Karan",
  "Rahul",
  "Dev",
  "Aryan",
];

const zodiacSigns = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
];

const statuses: ApplicationStatus[] = [
  "APPLIED",
  "REVIEWING",
  "SHORTLISTED",
  "INTERVIEW_SCHEDULED",
  "INTERVIEW_COMPLETED",
  "DATE_SCHEDULED",
  "REJECTED",
];

const personalities: PersonalityType[] = [
  "INTROVERT",
  "EXTROVERT",
  "AMBIVERT",
  "DEPENDS",
];

const intents: RelationshipIntent[] = [
  "SERIOUS",
  "OPEN_TO_SEEING",
  "FOR_THE_PLOT",
  "CASUAL",
];

async function main() {
  // Clear existing candidates so running the seed again
  // doesn't create duplicates.
  await prisma.candidate.deleteMany();

  const candidates = [];

  for (let i = 0; i < 250; i++) {
    const firstName = firstNames[i % firstNames.length];

    candidates.push({
      firstName,
      lastName: `Candidate${i + 1}`,
      email: `candidate${i + 1}@boyf.test`,

      age: 21 + (i % 10),
      city: cities[i % cities.length],
      height: `${165 + (i % 20)} cm`,
      zodiac: zodiacSigns[i % zodiacSigns.length],

      occupation:
        i % 3 === 0
          ? "Software Engineer"
          : i % 3 === 1
            ? "Student"
            : "Product Designer",

      // Lifestyle
      workoutFrequency:
        i % 3 === 0
          ? "4-5 times/week"
          : i % 3 === 1
            ? "Occasionally"
            : "Never",

      diet: i % 2 === 0 ? "Non-vegetarian" : "Vegetarian",

      weekendPreference:
        i % 2 === 0 ? "Going out" : "Staying in",

      travels: i % 3 === 0 ? "Frequently" : "Sometimes",

      hasPets: i % 4 === 0,

      petType: i % 4 === 0 ? "Dog" : null,

      // Personality
      personality: personalities[i % personalities.length],

      conflictStyle:
        i % 2 === 0
          ? "Talk it out"
          : "Need some space first",

      communication:
        i % 3 === 0
          ? "Very communicative"
          : i % 3 === 1
            ? "Pretty good"
            : "Depends",

      friendsDescribe:
        "Funny, dependable and slightly chaotic.",

      // Relationship
      relationshipIntent: intents[i % intents.length],

      loveLanguages:
        i % 2 === 0
          ? "Quality Time, Words"
          : "Acts of Service",

      values: "Trust, communication, kindness",

      longTermGoals:
        "Build a happy life and grow together.",

      relationshipNeeds:
        "Communication and consistency.",

      // Important questions
      fryProtocol:
        i % 2 === 0
          ? "Obviously give her the last fry."
          : "We split it.",

      fineResponse:
        "I know that means it is NOT fine.",

      readResponse:
        "Reply when I have something useful to say.",

      toiletProtocol: "Seat down. Obviously.",

      whyGoodBoyfriend:
        "I communicate, make plans and remember the little things.",

      whatMakesDifferent:
        "I can make people laugh when things get stressful.",

      anythingElse: "I make excellent playlists.",

      // Status
      status: statuses[i % statuses.length],

      // Compatibility
      compatibilityScore: 60 + ((i * 17) % 40),
      communicationScore: 55 + ((i * 13) % 45),
      humorScore: 50 + ((i * 19) % 50),
      lifestyleScore: 50 + ((i * 11) % 50),
      valuesScore: 60 + ((i * 7) % 40),
    });
  }

  await prisma.candidate.createMany({
    data: candidates,
  });

  console.log("❤️ Created 250 fake boyfriend candidates.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });