import { prisma } from "@/lib/prisma";
import CandidateActions from "@/components/admin/candidate-actions";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CandidateReviewPage({
  params,
}: Props) {
  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({
    where: {
      id,
    },
    include: {
      notes: {
        orderBy: {
          createdAt: "desc",
        },
      },
      greenFlags: {
        orderBy: {
          createdAt: "desc",
        },
      },
      redFlags: {
        orderBy: {
          createdAt: "desc",
        },
      },
      interviews: {
        orderBy: {
          scheduledAt: "desc",
        },
      },
      dates: {
        orderBy: {
          scheduledAt: "desc",
        },
      },
      events: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!candidate) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#fff8f5] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* BACK */}
        <Link
          href="/admin/candidates"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#746f70] transition hover:text-[#e94f64]"
        >
          ← Back to candidates
        </Link>

        {/* HEADER */}
        <section className="rounded-3xl border border-[#e8d9db] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div className="flex gap-5">
              {/* PHOTO */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f8dde2] text-2xl">
                {candidate.photoUrl ? (
                  <img
                    src={candidate.photoUrl}
                    alt={`${candidate.firstName} profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "👤"
                )}
              </div>

              {/* BASIC INFO */}
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-[#171717]">
                    {candidate.firstName}{" "}
                    {candidate.lastName ?? ""}
                  </h1>

                  <span className="rounded-full bg-[#f8dde2] px-3 py-1 text-xs font-semibold text-[#e94f64]">
                    {candidate.status.replaceAll("_", " ")}
                  </span>
                </div>

                <p className="mt-2 text-[#746f70]">
                  {candidate.age} · {candidate.city}
                  {candidate.occupation
                    ? ` · ${candidate.occupation}`
                    : ""}
                </p>

                <p className="mt-1 text-sm text-[#746f70]">
                  Applied{" "}
                  {new Date(candidate.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* COMPATIBILITY */}
            <div className="rounded-2xl bg-[#fff8f5] px-6 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#746f70]">
                Compatibility
              </p>

              <p className="mt-1 text-4xl font-bold text-[#e94f64]">
                {candidate.compatibilityScore ?? "—"}
                {candidate.compatibilityScore !== null && "%"}
              </p>

              <p className="text-xs text-[#746f70]">
                For entertainment purposes
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-8 border-t border-[#e8d9db] pt-6">
            <CandidateActions
              candidateId={candidate.id}
              currentStatus={candidate.status}
            />
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* LEFT / MAIN CONTENT */}
          <div className="space-y-6 lg:col-span-2">

            {/* COMPATIBILITY BREAKDOWN */}
            <section className="rounded-3xl border border-[#e8d9db] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#171717]">
                💘 Compatibility Breakdown
              </h2>

              <p className="mt-1 text-sm text-[#746f70]">
                A playful internal scoring system — not a scientific
                assessment.
              </p>

              <div className="mt-6 space-y-5">
                <ScoreBar
                  label="Communication"
                  score={candidate.communicationScore}
                />

                <ScoreBar
                  label="Lifestyle"
                  score={candidate.lifestyleScore}
                />

                <ScoreBar
                  label="Values"
                  score={candidate.valuesScore}
                />

                <ScoreBar
                  label="Humor"
                  score={candidate.humorScore}
                />
              </div>
            </section>

            {/* BASIC INFORMATION */}
            <section className="rounded-3xl border border-[#e8d9db] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#171717]">
                👤 Basic Information
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InfoItem
                  label="Email"
                  value={candidate.email}
                />

                <InfoItem
                  label="City"
                  value={candidate.city}
                />

                <InfoItem
                  label="Age"
                  value={`${candidate.age}`}
                />

                <InfoItem
                  label="Height"
                  value={candidate.height}
                />

                <InfoItem
                  label="Zodiac"
                  value={candidate.zodiac}
                />

                <InfoItem
                  label="Occupation / Degree"
                  value={candidate.occupation}
                />
              </div>
            </section>

            {/* LIFESTYLE */}
            <section className="rounded-3xl border border-[#e8d9db] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#171717]">
                🌱 Lifestyle
              </h2>

              <div className="mt-5 space-y-4">
                <Answer
                  question="Workout frequency"
                  answer={candidate.workoutFrequency}
                />

                <Answer
                  question="Diet"
                  answer={candidate.diet}
                />

                <Answer
                  question="Ideal weekend"
                  answer={candidate.weekendPreference}
                />

                <Answer
                  question="Travel"
                  answer={candidate.travels}
                />

                <Answer
                  question="Pets"
                  answer={
                    candidate.hasPets === null
                      ? null
                      : candidate.hasPets
                        ? `Yes${candidate.petType ? ` — ${candidate.petType}` : ""}`
                        : "No"
                  }
                />
              </div>
            </section>

            {/* PERSONALITY */}
            <section className="rounded-3xl border border-[#e8d9db] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#171717]">
                🧠 Personality
              </h2>

              <div className="mt-5 space-y-4">
                <Answer
                  question="Personality type"
                  answer={candidate.personality}
                />

                <Answer
                  question="Conflict style"
                  answer={candidate.conflictStyle}
                />

                <Answer
                  question="Communication style"
                  answer={candidate.communication}
                />

                <Answer
                  question="Friends would describe them as"
                  answer={candidate.friendsDescribe}
                />
              </div>
            </section>

            {/* RELATIONSHIP */}
            <section className="rounded-3xl border border-[#e8d9db] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#171717]">
                ❤️ Relationship
              </h2>

              <div className="mt-5 space-y-4">
                <Answer
                  question="Relationship intent"
                  answer={candidate.relationshipIntent}
                />

                <Answer
                  question="Love languages"
                  answer={candidate.loveLanguages}
                />

                <Answer
                  question="Values"
                  answer={candidate.values}
                />

                <Answer
                  question="Long-term goals"
                  answer={candidate.longTermGoals}
                />

                <Answer
                  question="Relationship needs"
                  answer={candidate.relationshipNeeds}
                />
              </div>
            </section>

            {/* IMPORTANT QUESTIONS */}
            <section className="rounded-3xl border border-[#e8d9db] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#171717]">
                🍟 Important Questions
              </h2>

              <div className="mt-5 space-y-5">
                <Answer
                  question="Last fry protocol"
                  answer={candidate.fryProtocol}
                />

                <Answer
                  question="When they say 'I'm fine'"
                  answer={candidate.fineResponse}
                />

                <Answer
                  question="If their message is left on read"
                  answer={candidate.readResponse}
                />

                <Answer
                  question="Toilet seat protocol"
                  answer={candidate.toiletProtocol}
                />

                <Answer
                  question="Why should we hire you?"
                  answer={candidate.whyGoodBoyfriend}
                />

                <Answer
                  question="What makes you different?"
                  answer={candidate.whatMakesDifferent}
                />

                <Answer
                  question="Anything else?"
                  answer={candidate.anythingElse}
                />
              </div>
            </section>

            {/* INTERVIEW */}
            {candidate.interviews.length > 0 && (
              <section className="rounded-3xl border border-[#e8d9db] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#171717]">
                  📅 Interviews
                </h2>

                <div className="mt-5 space-y-4">
                  {candidate.interviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="rounded-2xl bg-[#fff8f5] p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-[#171717]">
                            {new Date(
                              interview.scheduledAt
                            ).toLocaleString()}
                          </p>

                          <p className="mt-1 text-sm text-[#746f70]">
                            {interview.type.replaceAll("_", " ")}
                          </p>
                        </div>

                        <span className="w-fit rounded-full bg-[#f8dde2] px-3 py-1 text-xs font-semibold text-[#e94f64]">
                          {interview.status}
                        </span>
                      </div>

                      {interview.meetingUrl && (
                        <a
                          href={interview.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex rounded-xl bg-[#e94f64] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          Join Google Meet →
                        </a>
                      )}

                      {interview.adminNotes && (
                        <div className="mt-4 border-t border-[#e8d9db] pt-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#746f70]">
                            Admin Notes
                          </p>

                          <p className="mt-1 text-sm text-[#171717]">
                            {interview.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* DATES */}
            {candidate.dates.length > 0 && (
              <section className="rounded-3xl border border-[#e8d9db] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#171717]">
                  💕 Dates
                </h2>

                <div className="mt-5 space-y-4">
                  {candidate.dates.map((date) => (
                    <div
                      key={date.id}
                      className="rounded-2xl bg-[#fff8f5] p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-[#171717]">
                            {new Date(
                              date.scheduledAt
                            ).toLocaleString()}
                          </p>

                          <p className="mt-1 text-sm text-[#746f70]">
                            {date.type}
                          </p>
                        </div>

                        <span className="rounded-full bg-[#f8dde2] px-3 py-1 text-xs font-semibold text-[#e94f64]">
                          {date.status}
                        </span>
                      </div>

                      {date.prompt && (
                        <p className="mt-4 text-sm text-[#746f70]">
                          Prompt: {date.prompt}
                        </p>
                      )}

                      {date.meetingUrl && (
                        <a
                          href={date.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-block font-semibold text-[#e94f64] hover:underline"
                        >
                          Join date →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-6">

            {/* GREEN FLAGS */}
            <section className="rounded-3xl border border-[#e8d9db] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#171717]">
                🟢 Green Flags
              </h2>

              {candidate.greenFlags.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {candidate.greenFlags.map((flag) => (
                    <div
                      key={flag.id}
                      className="rounded-xl bg-[#f7faf7] p-3 text-sm text-[#171717]"
                    >
                      {flag.description}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#746f70]">
                  No green flags added yet.
                </p>
              )}
            </section>

            {/* RED FLAGS */}
            <section className="rounded-3xl border border-[#e8d9db] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#171717]">
                🔴 Red Flags
              </h2>

              {candidate.redFlags.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {candidate.redFlags.map((flag) => (
                    <div
                      key={flag.id}
                      className="rounded-xl bg-[#fff5f5] p-3 text-sm text-[#171717]"
                    >
                      {flag.description}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#746f70]">
                  No red flags added yet.
                </p>
              )}
            </section>

            {/* ADMIN NOTES */}
            <section className="rounded-3xl border border-[#e8d9db] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#171717]">
                📝 Admin Notes
              </h2>

              {candidate.notes.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {candidate.notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-xl bg-[#fff8f5] p-3"
                    >
                      <p className="text-sm text-[#171717]">
                        {note.content}
                      </p>

                      <p className="mt-2 text-xs text-[#746f70]">
                        {new Date(
                          note.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#746f70]">
                  No admin notes yet.
                </p>
              )}
            </section>

            {/* APPLICATION TIMELINE */}
            <section className="rounded-3xl border border-[#e8d9db] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#171717]">
                🕐 Recruitment Timeline
              </h2>

              {candidate.events.length > 0 ? (
                <div className="mt-5 space-y-5">
                  {candidate.events.map((event, index) => (
                    <div
                      key={event.id}
                      className="relative pl-7"
                    >
                      {index !== candidate.events.length - 1 && (
                        <div className="absolute left-[7px] top-4 h-full w-px bg-[#e8d9db]" />
                      )}

                      <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full bg-[#e94f64]" />

                      <p className="text-sm font-semibold text-[#171717]">
                        {event.toStatus.replaceAll("_", " ")}
                      </p>

                      <p className="mt-1 text-xs text-[#746f70]">
                        {new Date(
                          event.createdAt
                        ).toLocaleString()}
                      </p>

                      {event.note && (
                        <p className="mt-1 text-xs text-[#746f70]">
                          {event.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#746f70]">
                  No timeline events yet.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ----------------------------- */
/* Helper Components              */
/* ----------------------------- */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-2xl bg-[#fff8f5] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#746f70]">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-[#171717]">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function Answer({
  question,
  answer,
}: {
  question: string;
  answer: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#171717]">
        {question}
      </p>

      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#746f70]">
        {answer || "Not provided"}
      </p>
    </div>
  );
}

function ScoreBar({
  label,
  score,
}: {
  label: string;
  score: number | null;
}) {
  const value = score ?? 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-[#171717]">
          {label}
        </span>

        <span className="text-sm font-semibold text-[#e94f64]">
          {score !== null ? `${score}%` : "—"}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#f8dde2]">
        <div
          className="h-full rounded-full bg-[#e94f64] transition-all"
          style={{
            width: `${Math.min(Math.max(value, 0), 100)}%`,
          }}
        />
      </div>
    </div>
  );
}