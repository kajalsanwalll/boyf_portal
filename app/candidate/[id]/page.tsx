import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const statusLabels: Record<string, string> = {
  APPLIED: "Application Received",
  REVIEWING: "Application Under Review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  INTERVIEW_COMPLETED: "Interview Completed",
  DATE_SCHEDULED: "Date Scheduled",
  DATE_COMPLETED: "Date Completed",
  ACCEPTED: "Accepted 💖",
  REJECTED: "Application Closed",
  WITHDRAWN: "Application Withdrawn",
};

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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStageIndex(status: string) {
  const index = timeline.indexOf(status);

  if (status === "REJECTED" || status === "WITHDRAWN") {
    return -1;
  }

  return index;
}

export default async function CandidatePage({ params }: Props) {
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
      },
      dates: {
        orderBy: {
          scheduledAt: "desc",
        },
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

  const currentStage = getStageIndex(candidate.status);

  const latestInterview = candidate.interviews[0];
  const latestDate = candidate.dates[0];

  const isRejected =
    candidate.status === "REJECTED" ||
    candidate.status === "WITHDRAWN";

  const isAccepted = candidate.status === "ACCEPTED";

  return (
    <main className="min-h-screen bg-[#fff8f5] text-[#171717]">

      {/* HEADER */}

      <header className="border-b border-[#e8d9db] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">

          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            Boyfriend<span className="text-[#e94f64]">.co</span>
          </Link>

          <span className="rounded-full bg-[#f8dde2] px-4 py-2 text-xs font-semibold text-[#e94f64]">
            Candidate Portal
          </span>

        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">

        {/* HERO */}

        <section className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e94f64]">
            Candidate Portal
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Hi, {candidate.firstName}. 👋
          </h1>

          <p className="mt-3 max-w-2xl text-[#746f70]">
            Here's everything happening with your boyfriend
            application.
          </p>

          <div className="mt-5 inline-flex items-center rounded-full border border-[#e8d9db] bg-white px-4 py-2 text-xs text-[#746f70]">
            Candidate ID:
            <span className="ml-2 font-mono font-semibold text-[#171717]">
              {candidate.id}
            </span>
          </div>

        </section>

        {/* FINAL RESULT */}

        {isAccepted && (
          <section className="mb-8 rounded-3xl bg-[#171717] p-8 text-white shadow-sm">

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f8dde2]">
              Final Decision
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              You're in. 💖
            </h2>

            <p className="mt-3 max-w-xl text-white/70">
              Congratulations. You have successfully cleared
              the boyfriend recruitment pipeline.
            </p>

          </section>
        )}

        {isRejected && (
          <section className="mb-8 rounded-3xl border border-[#e8d9db] bg-white p-8">

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#746f70]">
              Final Decision
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Application closed 🫡
            </h2>

            <p className="mt-3 max-w-xl text-[#746f70]">
              Thank you for making it through the process.
              The recruitment team has closed this application.
            </p>

          </section>
        )}

        {/* CURRENT STATUS */}

        {!isAccepted && !isRejected && (
          <section className="mb-8 rounded-3xl border border-[#e8d9db] bg-white p-7 shadow-sm">

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

              <div>
                <p className="text-sm text-[#746f70]">
                  Current status
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {statusLabels[candidate.status] ??
                    candidate.status}
                </h2>
              </div>

              <div className="rounded-full bg-[#f8dde2] px-5 py-3 text-sm font-semibold text-[#e94f64]">
                {candidate.compatibilityScore
                  ? `${candidate.compatibilityScore}% compatibility`
                  : "Application in progress"}
              </div>

            </div>

          </section>
        )}

        {/* PIPELINE */}

        <section className="mb-8 rounded-3xl border border-[#e8d9db] bg-white p-7 shadow-sm">

          <div className="mb-7">

            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e94f64]">
              Your journey
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Recruitment pipeline
            </h2>

          </div>

          <div className="space-y-0">

            {timeline.map((stage, index) => {

              const completed =
                currentStage >= index;

              const active =
                candidate.status === stage;

              const isLast =
                index === timeline.length - 1;

              return (
                <div
                  key={stage}
                  className="flex gap-4"
                >

                  {/* DOT + LINE */}

                  <div className="flex flex-col items-center">

                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                        completed
                          ? "border-[#e94f64] bg-[#e94f64] text-white"
                          : "border-[#e8d9db] bg-white text-[#b8afb0]"
                      }`}
                    >
                      {completed ? "✓" : index + 1}
                    </div>

                    {!isLast && (
                      <div
                        className={`h-12 w-[2px] ${
                          currentStage > index
                            ? "bg-[#e94f64]"
                            : "bg-[#e8d9db]"
                        }`}
                      />
                    )}

                  </div>

                  {/* CONTENT */}

                  <div className="pb-8">

                    <p
                      className={`font-semibold ${
                        active
                          ? "text-[#e94f64]"
                          : completed
                          ? "text-[#171717]"
                          : "text-[#746f70]"
                      }`}
                    >
                      {statusLabels[stage]}
                    </p>

                    {active && (
                      <p className="mt-1 text-sm text-[#746f70]">
                        This is your current stage.
                      </p>
                    )}

                  </div>

                </div>
              );
            })}

          </div>

        </section>

        {/* INTERVIEW */}

        {latestInterview && (
          <section className="mb-8 rounded-3xl border border-[#e8d9db] bg-white p-7 shadow-sm">

            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e94f64]">
              Interview
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Let's talk. 🎤
            </h2>

            <div className="mt-5 rounded-2xl bg-[#fff8f5] p-5">

              <p className="text-sm text-[#746f70]">
                Scheduled for
              </p>

              <p className="mt-1 text-lg font-bold">
                {formatDate(latestInterview.scheduledAt)}
              </p>

              {latestInterview.status === "SCHEDULED" &&
                latestInterview.meetingUrl && (
                  <a
                    href={latestInterview.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex rounded-xl bg-[#e94f64] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Join Google Meet →
                  </a>
                )}

              {latestInterview.status === "COMPLETED" && (
                <p className="mt-3 text-sm font-semibold text-[#e94f64]">
                  ✓ Interview completed
                </p>
              )}

            </div>

          </section>
        )}

        {/* DATE */}

        {latestDate && (
          <section className="mb-8 rounded-3xl border border-[#f8dde2] bg-white p-7 shadow-sm">

            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e94f64]">
              The Date
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              This is getting serious. 💕
            </h2>

            <div className="mt-5 rounded-2xl bg-[#fff8f5] p-5">

              <p className="text-sm text-[#746f70]">
                Scheduled for
              </p>

              <p className="mt-1 text-lg font-bold">
                {formatDate(latestDate.scheduledAt)}
              </p>

              <p className="mt-2 text-sm text-[#746f70]">
                {latestDate.type === "ONLINE"
                  ? "Online date 💻"
                  : `${latestDate.type
                      .charAt(0)
                      .toUpperCase()}${latestDate.type
                      .slice(1)
                      .toLowerCase()} date`}
              </p>

              {latestDate.prompt && (
                <div className="mt-4 rounded-xl border border-[#e8d9db] bg-white p-4">

                  <p className="text-xs font-semibold uppercase tracking-wider text-[#746f70]">
                    Your date prompt
                  </p>

                  <p className="mt-1 font-semibold">
                    {latestDate.prompt}
                  </p>

                </div>
              )}

              {latestDate.status === "SCHEDULED" &&
                latestDate.meetingUrl && (
                  <a
                    href={latestDate.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex rounded-xl bg-[#e94f64] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Join Online Date →
                  </a>
                )}

              {latestDate.status === "COMPLETED" && (
                <p className="mt-4 text-sm font-semibold text-[#e94f64]">
                  ✓ Date completed
                </p>
              )}

            </div>

          </section>
        )}

        {/* APPLICATION DETAILS */}

        <section className="rounded-3xl border border-[#e8d9db] bg-white p-7 shadow-sm">

          <div className="mb-6">

            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e94f64]">
              Your application
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Candidate details
            </h2>

          </div>

          <div className="grid gap-5 sm:grid-cols-2">

            <div>
              <p className="text-xs uppercase tracking-wider text-[#746f70]">
                Name
              </p>
              <p className="mt-1 font-semibold">
                {candidate.firstName}{" "}
                {candidate.lastName ?? ""}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-[#746f70]">
                City
              </p>
              <p className="mt-1 font-semibold">
                {candidate.city}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-[#746f70]">
                Age
              </p>
              <p className="mt-1 font-semibold">
                {candidate.age}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-[#746f70]">
                Occupation
              </p>
              <p className="mt-1 font-semibold">
                {candidate.occupation || "—"}
              </p>
            </div>

          </div>

        </section>

        {/* FOOTER */}

        <div className="py-10 text-center">

          <Link
            href="/"
            className="text-sm font-semibold text-[#e94f64] hover:underline"
          >
            ← Back to Boyfriend.co
          </Link>

        </div>

      </div>
    </main>
  );
}