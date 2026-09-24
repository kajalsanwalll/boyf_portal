import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const stages = [
  {
    status: "APPLIED",
    label: "Application Submitted",
    emoji: "📨",
    description: "Your application has entered the boyfriend pipeline.",
  },
  {
    status: "REVIEWING",
    label: "Under Review",
    emoji: "🔎",
    description: "Our recruitment team is reviewing your application.",
  },
  {
    status: "SHORTLISTED",
    label: "Shortlisted",
    emoji: "❤️",
    description: "You've made it through the first round.",
  },
  {
    status: "INTERVIEW_SCHEDULED",
    label: "Interview",
    emoji: "📅",
    description: "Time to prove you're boyfriend material.",
  },
  {
    status: "INTERVIEW_COMPLETED",
    label: "Interview Completed",
    emoji: "🎤",
    description: "The interview is officially done.",
  },
  {
    status: "DATE_SCHEDULED",
    label: "Online Date",
    emoji: "💕",
    description: "You've made it to the date stage.",
  },
  {
    status: "DATE_COMPLETED",
    label: "Date Completed",
    emoji: "✨",
    description: "The date has been completed.",
  },
  {
    status: "ACCEPTED",
    label: "Accepted",
    emoji: "💍",
    description: "Congratulations. You've been hired.",
  },
];

const stageOrder = stages.map((stage) => stage.status);

export default async function CandidateStatusPage({
  params,
}: Props) {
  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({
    where: {
      id,
    },
    include: {
      interviews: {
        orderBy: {
          scheduledAt: "desc",
        },
        take: 1,
      },
      dates: {
        orderBy: {
          scheduledAt: "desc",
        },
        take: 1,
      },
      events: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!candidate) {
    notFound();
  }

  const currentIndex = stageOrder.indexOf(candidate.status);

  const isRejected = candidate.status === "REJECTED";
  const isWithdrawn = candidate.status === "WITHDRAWN";

  const latestInterview = candidate.interviews[0];
  const latestDate = candidate.dates[0];

  return (
    <main className="min-h-screen bg-[#fff8f5] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl">

        {/* TOP BRAND */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-[#171717]"
          >
            boyfriend<span className="text-[#e94f64]">.</span>
          </Link>

          <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#746f70] shadow-sm">
            Candidate Portal
          </span>
        </div>

        {/* HEADER */}
        <section className="rounded-3xl border border-[#e8d9db] bg-white p-6 shadow-sm md:p-10">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#f8dde2] text-3xl">
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

            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#e94f64]">
              Boyfriend Recruitment Portal
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#171717]">
              Hey, {candidate.firstName} 👋
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-[#746f70]">
              Here's everything you need to know about your application.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-[#fff8f5] px-4 py-2 text-sm text-[#746f70]">
                #{candidate.id.slice(-6).toUpperCase()}
              </span>

              <span className="rounded-full bg-[#f8dde2] px-4 py-2 text-sm font-semibold text-[#e94f64]">
                {formatStatus(candidate.status)}
              </span>
            </div>
          </div>
        </section>

        {/* REJECTED */}
        {isRejected && (
          <section className="mt-6 rounded-3xl border border-[#e8d9db] bg-white p-6 text-center shadow-sm md:p-8">
            <div className="text-5xl">💔</div>

            <h2 className="mt-4 text-2xl font-bold text-[#171717]">
              Application Update
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-[#746f70]">
              Thank you for applying. Unfortunately, we've decided not to
              move forward with your application at this time.
            </p>
          </section>
        )}

        {/* WITHDRAWN */}
        {isWithdrawn && (
          <section className="mt-6 rounded-3xl border border-[#e8d9db] bg-white p-6 text-center shadow-sm md:p-8">
            <div className="text-5xl">👋</div>

            <h2 className="mt-4 text-2xl font-bold text-[#171717]">
              Application Withdrawn
            </h2>

            <p className="mt-2 text-[#746f70]">
              Your application has been withdrawn from the recruitment
              process.
            </p>
          </section>
        )}

        {/* PROGRESS */}
        {!isRejected && !isWithdrawn && (
          <section className="mt-6 rounded-3xl border border-[#e8d9db] bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-[#746f70]">
                  Application progress
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#171717]">
                  The boyfriend pipeline
                </h2>
              </div>

              <span className="text-sm font-semibold text-[#e94f64]">
                {Math.max(currentIndex + 1, 1)} / {stages.length}
              </span>
            </div>

            <div className="mt-8 space-y-0">
              {stages.map((stage, index) => {
                const isComplete =
                  currentIndex >= index;

                const isCurrent =
                  currentIndex === index;

                return (
                  <div
                    key={stage.status}
                    className="relative flex gap-4"
                  >
                    {/* CONNECTING LINE */}
                    {index < stages.length - 1 && (
                      <div
                        className={`absolute left-[19px] top-10 h-[calc(100%-2px)] w-0.5 ${
                          currentIndex > index
                            ? "bg-[#e94f64]"
                            : "bg-[#e8d9db]"
                        }`}
                      />
                    )}

                    {/* DOT */}
                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm ${
                        isComplete
                          ? "bg-[#e94f64] text-white"
                          : "bg-[#fff8f5] text-[#746f70]"
                      } ${
                        isCurrent
                          ? "ring-4 ring-[#f8dde2]"
                          : ""
                      }`}
                    >
                      {isComplete ? "✓" : stage.emoji}
                    </div>

                    {/* CONTENT */}
                    <div className="pb-8">
                      <p
                        className={`font-semibold ${
                          isCurrent
                            ? "text-[#e94f64]"
                            : "text-[#171717]"
                        }`}
                      >
                        {stage.label}
                      </p>

                      <p className="mt-1 text-sm text-[#746f70]">
                        {stage.description}
                      </p>

                      {isCurrent && (
                        <span className="mt-2 inline-block rounded-full bg-[#f8dde2] px-3 py-1 text-xs font-semibold text-[#e94f64]">
                          Current stage
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* INTERVIEW */}
        {latestInterview && (
          <section className="mt-6 overflow-hidden rounded-3xl border border-[#e8d9db] bg-white shadow-sm">
            <div className="bg-[#e94f64] px-6 py-5 text-white md:px-8">
              <p className="text-sm font-semibold uppercase tracking-wider opacity-80">
                Next step
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Your interview is scheduled 📅
              </h2>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#fff8f5] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#746f70]">
                    Date & Time
                  </p>

                  <p className="mt-2 font-semibold text-[#171717]">
                    {new Date(
                      latestInterview.scheduledAt
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fff8f5] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#746f70]">
                    Format
                  </p>

                  <p className="mt-2 font-semibold text-[#171717]">
                    Online · Google Meet
                  </p>
                </div>
              </div>

              {latestInterview.meetingUrl && (
                <a
                  href={latestInterview.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 block rounded-2xl bg-[#171717] px-5 py-4 text-center font-semibold text-white transition hover:opacity-90"
                >
                  Join Google Meet →
                </a>
              )}

              <p className="mt-4 text-center text-xs text-[#746f70]">
                Please be on time. First impressions matter. Apparently.
              </p>
            </div>
          </section>
        )}

        {/* DATE */}
        {latestDate && (
          <section className="mt-6 rounded-3xl border border-[#e8d9db] bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#e94f64]">
              💕 You've made it this far
            </p>

            <h2 className="mt-2 text-2xl font-bold text-[#171717]">
              Your date
            </h2>

            <div className="mt-5 rounded-2xl bg-[#fff8f5] p-5">
              <p className="font-semibold text-[#171717]">
                {new Date(
                  latestDate.scheduledAt
                ).toLocaleString()}
              </p>

              <p className="mt-1 text-sm text-[#746f70]">
                {latestDate.type}
              </p>

              {latestDate.prompt && (
                <div className="mt-4 border-t border-[#e8d9db] pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#746f70]">
                    Your date prompt
                  </p>

                  <p className="mt-1 text-sm text-[#171717]">
                    {latestDate.prompt}
                  </p>
                </div>
              )}
            </div>

            {latestDate.meetingUrl && (
              <a
                href={latestDate.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 block rounded-2xl bg-[#e94f64] px-5 py-4 text-center font-semibold text-white transition hover:opacity-90"
              >
                Join your date →
              </a>
            )}
          </section>
        )}

        {/* APPLICATION INFO */}
        <section className="mt-6 rounded-3xl border border-[#e8d9db] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-bold text-[#171717]">
            Your application
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <InfoCard
              label="Name"
              value={`${candidate.firstName} ${
                candidate.lastName ?? ""
              }`}
            />

            <InfoCard
              label="Location"
              value={candidate.city}
            />

            <InfoCard
              label="Relationship intent"
              value={
                candidate.relationshipIntent
                  ? formatStatus(candidate.relationshipIntent)
                  : "Not provided"
              }
            />

            <InfoCard
              label="Application date"
              value={new Date(
                candidate.createdAt
              ).toLocaleDateString()}
            />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-10 text-center">
          <p className="text-sm text-[#746f70]">
            boyfriend<span className="text-[#e94f64]">.</span> recruitment
          </p>

          <p className="mt-1 text-xs text-[#746f70]">
            Serious recruitment. Questionable methodology.
          </p>
        </footer>
      </div>
    </main>
  );
}

/* ----------------------------- */
/* Helpers                       */
/* ----------------------------- */

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#fff8f5] p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#746f70]">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-[#171717]">
        {value}
      </p>
    </div>
  );
}