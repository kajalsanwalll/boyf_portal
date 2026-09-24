import { prisma } from "@/lib/prisma";

import LogoutButton from "@/components/LogoutButton";

import { notFound, redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

import Link from "next/link";

import PhotoUpload from "./PhotoUpload";

import { Bricolage_Grotesque, Figtree } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
});

const timeline = [
  "APPLIED",
  "REVIEWING",
  "SHORTLISTED",
  "INTERVIEW_SCHEDULED",
  "INTERVIEW_COMPLETED",
  "DATE_SCHEDULED",
  "DATE_COMPLETED",
  "ACCEPTED",
];

const statusLabels: Record<string, string> = {
  APPLIED: "Application received",
  REVIEWING: "Under review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW_SCHEDULED: "Interview scheduled",
  INTERVIEW_COMPLETED: "Interview completed",
  DATE_SCHEDULED: "Date scheduled",
  DATE_COMPLETED: "Date completed",
  ACCEPTED: "Accepted",
  REJECTED: "Application closed",
  WITHDRAWN: "Application withdrawn",
};

const stageDescriptions: Record<string, string> = {
  APPLIED:
    "Your application has successfully entered the pipeline.",
  REVIEWING:
    "Someone is currently deciding whether you're boyfriend material.",
  SHORTLISTED:
    "Okayyy, you've made it past the first cut.",
  INTERVIEW_SCHEDULED:
    "Your interview is booked. Please bring your personality.",
  INTERVIEW_COMPLETED:
    "Interview done. Now we wait and pretend to be chill.",
  DATE_SCHEDULED:
    "You've made it to the date stage. Interesting...",
  DATE_COMPLETED:
    "The date happened. The committee is thinking.",
  ACCEPTED:
    "Congratulations. You have successfully secured the position.",
  REJECTED:
    "This application has been closed.",
  WITHDRAWN:
    "This application was withdrawn.",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStageIndex(status: string) {
  if (status === "REJECTED" || status === "WITHDRAWN") return -1;

  return timeline.indexOf(status);
}

function getProgress(status: string) {
  const index = getStageIndex(status);

  if (index < 0) return 0;

  return Math.round(
    (index / (timeline.length - 1)) * 100
  );
}

function ScoreRing({
  score,
}: {
  score: number | null;
}) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const value = score ?? 0;

  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg
        viewBox="0 0 120 120"
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="rgb(255 255 255 / 0.12)"
          strokeWidth="9"
        />

        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#ff6b81"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={
            c - (c * value) / 100
          }
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-[family-name:var(--font-display)] text-4xl font-bold leading-none">
          {score ?? "—"}

          {score !== null && (
            <span className="text-lg text-white/60">
              %
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

export default async function CandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  /* ---------------------------------------------------------
   * AUTHORIZATION
   * --------------------------------------------------------- */

  const { userId, sessionClaims } = await auth();

  // Not logged in
  if (!userId) {
    redirect("/sign-in");
  }

  // Get the candidate
  const { id } = await params;

  const candidate =
    await prisma.candidate.findUnique({
      where: { id },

      include: {
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

  /* ---------------------------------------------------------
   * ROLE CHECK
   *
   * ADMIN:
   *   Can view every candidate.
   *
   * NORMAL USER:
   *   Can only view their own candidate profile.
   *
   * Existing candidates created before Clerk integration have
   * clerkUserId = null, so they can only be viewed by admins.
   * --------------------------------------------------------- */

  const role = sessionClaims?.metadata?.role;

  const isAdmin = role === "ADMIN";

  const isOwner =
    candidate.clerkUserId === userId;

  if (!isAdmin && !isOwner) {
    redirect("/");
  }

  /* ---------------------------------------------------------
   * PAGE DATA
   * --------------------------------------------------------- */

  const progress = getProgress(candidate.status);

  const currentStageIndex =
    getStageIndex(candidate.status);

  const latestInterview =
    candidate.interviews[0];

  const latestDate = candidate.dates[0];

  const isRejected =
    candidate.status === "REJECTED" ||
    candidate.status === "WITHDRAWN";

  const isAccepted =
    candidate.status === "ACCEPTED";

  const appId = candidate.id
    .slice(-6)
    .toUpperCase();

  return (
    <main
      className={`${display.variable} ${body.variable} min-h-screen bg-[#fdf1f3] font-[family-name:var(--font-body)] text-[#2a1626] antialiased selection:bg-[#ff6b81]/30`}
    >
      <style>{`
        @keyframes stamp-in {
          from {
            opacity: 0;
            transform: rotate(-9deg) scale(1.5);
          }

          to {
            opacity: 1;
            transform: rotate(-6deg) scale(1);
          }
        }

        .stamp {
          animation: stamp-in .5s cubic-bezier(.2,.9,.3,1.2) .2s both;
        }

        @media (prefers-reduced-motion: reduce) {
          .stamp {
            animation: none;
          }
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#2a1626]/10 bg-[#fdf1f3]/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5 md:px-8">
          
          {/* Brand */}
          <Link
            href="/"
            className="rounded-md font-[family-name:var(--font-display)] text-lg font-bold tracking-tight outline-offset-4 hover:text-[#d9364f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d9364f]"
          >
            The Boyfriend Portal 💌
          </Link>

          {/* Header actions */}
          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-[#6b5566] sm:block">
              Application{" "}
              <span className="font-semibold text-[#2a1626]">
                #{appId}
              </span>
            </p>

            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-5 py-8 md:space-y-8 md:px-8 md:py-12">
        {/* Hero */}
        <section className="grid gap-4 md:grid-cols-[1fr_auto] md:gap-6">
          {/* Candidate introduction */}
          <div className="relative overflow-hidden rounded-3xl bg-white p-7 shadow-[0_1px_0_rgb(42_22_38/0.06),0_12px_32px_-16px_rgb(217_54_79/0.35)] md:p-10">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-center">
              {/* Candidate Photo */}
              <PhotoUpload
                candidateId={candidate.id}
                currentPhotoUrl={candidate.photoUrl}
                firstName={candidate.firstName}
              />

              {/* Candidate info */}
              <div className="min-w-0">
                <h1 className="font-[family-name:var(--font-display)] text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl">
                  Hi, {candidate.firstName}.
                </h1>

                <p className="mt-5 max-w-md text-base leading-7 text-[#6b5566]">
                  Welcome back to your very serious,
                  completely legitimate boyfriend
                  recruitment journey.
                </p>

                <ul className="mt-7 flex flex-wrap gap-2 text-sm">
                  {[
                    `📍 ${candidate.city}`,
                    `🎂 ${candidate.age}`,
                    candidate.occupation
                      ? `💼 ${candidate.occupation}`
                      : null,
                  ]
                    .filter(Boolean)
                    .map((chip) => (
                      <li
                        key={chip}
                        className="rounded-full bg-[#fdf1f3] px-3.5 py-1.5 font-medium"
                      >
                        {chip}
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* Status stamp */}
            <div
              className={`stamp pointer-events-none absolute right-6 top-6 hidden rotate-[-6deg] rounded-lg border-[3px] px-3 py-1.5 text-center font-[family-name:var(--font-display)] text-sm font-extrabold sm:block md:right-10 md:top-10 md:text-base ${
                isAccepted
                  ? "border-[#d9364f] text-[#d9364f]"
                  : isRejected
                    ? "border-[#6b5566] text-[#6b5566]"
                    : "border-[#2a1626]/80 text-[#2a1626]/80"
              }`}
              aria-hidden="true"
            >
              {statusLabels[candidate.status] ??
                candidate.status}
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-6 rounded-3xl bg-[#2a1626] p-7 text-white md:w-[300px] md:flex-col md:items-start md:justify-between">
            <ScoreRing
              score={candidate.compatibilityScore}
            />

            <div>
              <p className="font-[family-name:var(--font-display)] text-lg font-bold">
                Compatibility
              </p>

              <p className="mt-1 text-sm text-white/65">
                Extremely scientific. Probably. Just
                for fun, not a real assessment.
              </p>
            </div>
          </div>
        </section>

        {/* Outcome banners */}
        {isAccepted && (
          <section className="rounded-3xl bg-[#d9364f] p-8 text-white md:p-12">
            <p className="text-5xl" aria-hidden="true">
              💖
            </p>

            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight md:text-5xl">
              You’re in.
            </h2>

            <p className="mt-3 max-w-lg leading-7 text-white/90">
              Congratulations. After extensive review,
              several meetings, and absolutely no
              conflict of interest, you have secured the
              position.
            </p>
          </section>
        )}

        {isRejected && (
          <section className="rounded-3xl border border-[#2a1626]/10 bg-white p-8 md:p-10">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
              Application closed 🫡
            </h2>

            <p className="mt-2 max-w-lg text-[#6b5566]">
              Thank you for applying. The committee has
              made its extremely serious decision.
            </p>
          </section>
        )}

        {/* Status + timeline */}
        <section className="rounded-3xl bg-white p-7 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
                {statusLabels[candidate.status] ??
                  candidate.status}
              </h2>

              <p className="mt-2 max-w-xl leading-7 text-[#6b5566]">
                {stageDescriptions[candidate.status] ??
                  "Your application is moving through the pipeline."}
              </p>
            </div>

            <p className="font-[family-name:var(--font-display)] text-5xl font-extrabold text-[#d9364f]">
              {progress}%
            </p>
          </div>

          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Pipeline progress"
            className="mt-6 h-2.5 overflow-hidden rounded-full bg-[#fdf1f3]"
          >
            <div
              className="h-full rounded-full bg-[#d9364f] transition-[width] duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ol
            className={`mt-10 ${
              isRejected ? "opacity-50" : ""
            }`}
          >
            {timeline.map((stage, index) => {
              const completed =
                currentStageIndex >= index;

              const current =
                candidate.status === stage;

              const last =
                index === timeline.length - 1;

              return (
                <li
                  key={stage}
                  className="flex gap-4"
                  aria-current={
                    current ? "step" : undefined
                  }
                >
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        current
                          ? "bg-[#d9364f] text-white ring-4 ring-[#d9364f]/20"
                          : completed
                            ? "bg-[#2a1626] text-white"
                            : "bg-[#fdf1f3] text-[#6b5566]"
                      }`}
                    >
                      {completed && !current
                        ? "✓"
                        : index + 1}
                    </span>

                    {!last && (
                      <span
                        className={`w-0.5 flex-1 ${
                          currentStageIndex > index
                            ? "bg-[#2a1626]"
                            : "bg-[#2a1626]/10"
                        }`}
                      />
                    )}
                  </div>

                  <div
                    className={`min-w-0 ${
                      last ? "" : "pb-7"
                    } pt-1.5`}
                  >
                    <p
                      className={`font-semibold ${
                        current
                          ? "text-[#d9364f]"
                          : completed
                            ? "text-[#2a1626]"
                            : "text-[#6b5566]"
                      }`}
                    >
                      {statusLabels[stage]}
                    </p>

                    {current && (
                      <p className="mt-1 text-sm leading-6 text-[#6b5566]">
                        You are here.{" "}
                        {stageDescriptions[stage]}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Interview + Date */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <ScheduleCard
            title="Interview"
            emptyText="No interview has been scheduled yet. Keep an eye on this page."
            item={latestInterview}
            completedText="Interview completed"
            joinText="Join Google Meet"
            noLinkText="Meeting link will appear here once available."
            accent
          />

          <ScheduleCard
            title="Date"
            emptyText="No date has been scheduled yet. Details will appear here when the time comes."
            item={latestDate}
            completedText="Date completed"
            joinText="Join online date"
            showPrompt
          />
        </div>

        {/* Details */}
        <section className="rounded-3xl bg-white p-7 md:p-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
            Candidate details
          </h2>

          <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <Detail
              label="Name"
              value={`${candidate.firstName} ${
                candidate.lastName ?? ""
              }`.trim()}
            />

            <Detail
              label="Age"
              value={String(candidate.age)}
            />

            <Detail
              label="City"
              value={candidate.city}
            />

            <Detail
              label="Height"
              value={candidate.height}
            />

            <Detail
              label="Zodiac"
              value={candidate.zodiac}
            />

            <Detail
              label="Occupation"
              value={candidate.occupation}
            />

            <Detail
              label="Relationship intent"
              value={candidate.relationshipIntent?.replaceAll(
                "_",
                " "
              )}
            />

            <Detail
              label="Personality"
              value={candidate.personality?.replaceAll(
                "_",
                " "
              )}
            />

            <Detail
              label="Communication"
              value={candidate.communication}
            />
          </dl>
        </section>

        {/* Footer */}
        <footer className="flex flex-col items-center gap-2 pt-4 text-center">
          <Link
            href="/"
            className="rounded-md text-sm font-semibold text-[#d9364f] outline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d9364f]"
          >
            ← Back to The Boyfriend Portal
          </Link>

          <p className="text-xs text-[#6b5566]">
            Please do not attempt to bribe the recruitment committee.
          </p>
        </footer>
      </div>
    </main>
  );
}

type Scheduled = {
  scheduledAt: Date;
  status: string;
  meetingUrl?: string | null;
  prompt?: string | null;
};

function ScheduleCard({
  title,
  item,
  emptyText,
  completedText,
  joinText,
  noLinkText,
  showPrompt,
  accent,
}: {
  title: string;
  item?: Scheduled;
  emptyText: string;
  completedText: string;
  joinText: string;
  noLinkText?: string;
  showPrompt?: boolean;
  accent?: boolean;
}) {
  return (
    <section className="flex flex-col rounded-3xl bg-white p-7">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
        {title}
      </h2>

      {!item ? (
        <p className="mt-3 text-sm leading-6 text-[#6b5566]">
          {emptyText}
        </p>
      ) : (
        <div className="mt-4 flex flex-1 flex-col gap-4">
          <div>
            <p className="text-sm text-[#6b5566]">
              Scheduled for
            </p>

            <p className="mt-0.5 text-lg font-semibold">
              {formatDate(item.scheduledAt)}
            </p>
          </div>

          {showPrompt && item.prompt && (
            <blockquote className="border-l-4 border-[#ff6b81] pl-4 text-sm leading-6">
              <span className="block text-[#6b5566]">
                Date prompt
              </span>

              {item.prompt}
            </blockquote>
          )}

          {item.status === "COMPLETED" ? (
            <p className="mt-auto rounded-xl bg-[#e8f6ee] px-4 py-3 text-sm font-semibold text-[#1b6b3a]">
              ✓ {completedText}
            </p>
          ) : item.meetingUrl ? (
            <a
              href={item.meetingUrl}
              target="_blank"
              rel="noreferrer"
              className={`mt-auto rounded-xl px-5 py-3 text-center text-sm font-bold text-white outline-offset-2 transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d9364f] ${
                accent
                  ? "bg-[#d9364f]"
                  : "bg-[#2a1626]"
              }`}
            >
              {joinText} →
            </a>
          ) : noLinkText ? (
            <p className="mt-auto text-sm text-[#6b5566]">
              {noLinkText}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;

  return (
    <div className="border-t border-[#2a1626]/10 pt-3">
      <dt className="text-sm text-[#6b5566]">
        {label}
      </dt>

      <dd className="mt-0.5 font-semibold capitalize">
        {value}
      </dd>
    </div>
  );
}