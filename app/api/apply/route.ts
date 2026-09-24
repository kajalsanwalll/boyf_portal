import { calculateCompatibility } from "@/lib/compatibility";
import { prisma } from "@/lib/prisma";
import {
  ApplicationStatus,
  PersonalityType,
  RelationshipIntent,
} from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const compatibility = calculateCompatibility({
    communication: body.communication,
    conflictStyle: body.conflictStyle,

    workoutFrequency: body.workoutFrequency,
    diet: body.diet,
    weekendPreference: body.weekendPreference,
    travels: body.travels,

    personality: body.personality
     ? (body.personality as PersonalityType)
    : null,

    relationshipIntent: body.relationshipIntent
     ? (body.relationshipIntent as RelationshipIntent)
     : null,

    longTermGoals: body.longTermGoals,
    relationshipNeeds: body.relationshipNeeds,
    values: body.values,

    fryProtocol: body.fryProtocol,
    fineResponse: body.fineResponse,
    readResponse: body.readResponse,
    toiletProtocol: body.toiletProtocol,
    whyGoodBoyfriend: body.whyGoodBoyfriend,
    });

    if (!body.firstName || !body.email || !body.age || !body.city) {
      return NextResponse.json(
        {
          error:
            "First name, email, age and city are required.",
        },
        { status: 400 }
      );
    }

    const existingCandidate =
      await prisma.candidate.findUnique({
        where: {
          email: body.email,
        },
      });

    if (existingCandidate) {
      return NextResponse.json(
        {
          error:
            "An application with this email already exists.",
        },
        { status: 409 }
      );
    }

    const candidate = await prisma.$transaction(
      async (tx) => {
        const createdCandidate =
          await tx.candidate.create({
            data: {
              firstName: body.firstName,
              lastName: body.lastName || null,
              email: body.email,
              age: Number(body.age),
              city: body.city,
              height: body.height || null,
              zodiac: body.zodiac || null,
              occupation: body.occupation || null,
              photoUrl: body.photoUrl || null,

              workoutFrequency:
                body.workoutFrequency || null,
              diet: body.diet || null,
              weekendPreference:
                body.weekendPreference || null,
              travels: body.travels || null,
              hasPets:
                typeof body.hasPets === "boolean"
                  ? body.hasPets
                  : null,
              petType: body.petType || null,

              personality:
                body.personality
                  ? (body.personality as PersonalityType)
                  : null,

              conflictStyle:
                body.conflictStyle || null,
              communication:
                body.communication || null,
              friendsDescribe:
                body.friendsDescribe || null,

              relationshipIntent:
                body.relationshipIntent
                  ? (body.relationshipIntent as RelationshipIntent)
                  : null,

              loveLanguages:
                body.loveLanguages || null,
              values: body.values || null,
              longTermGoals:
                body.longTermGoals || null,
              relationshipNeeds:
                body.relationshipNeeds || null,

              fryProtocol:
                body.fryProtocol || null,
              fineResponse:
                body.fineResponse || null,
              readResponse:
                body.readResponse || null,
              toiletProtocol:
                body.toiletProtocol || null,
              whyGoodBoyfriend:
                body.whyGoodBoyfriend || null,
              whatMakesDifferent:
                body.whatMakesDifferent || null,
              anythingElse:
                body.anythingElse || null,

              status: ApplicationStatus.APPLIED,

              compatibilityScore: compatibility.compatibilityScore,
              communicationScore: compatibility.communicationScore,
              lifestyleScore: compatibility.lifestyleScore,
              valuesScore: compatibility.valuesScore,
              humorScore: compatibility.humorScore,
            },
          });

        await tx.applicationEvent.create({
          data: {
            candidateId: createdCandidate.id,
            toStatus: ApplicationStatus.APPLIED,
            note: "Application submitted.",
          },
        });

        return createdCandidate;
      }
    );

    return NextResponse.json(
      {
        success: true,
        id: candidate.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Application submission error:", error);

    return NextResponse.json(
      {
        error: "Failed to submit application.",
      },
      { status: 500 }
    );
  }
}