import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Bricolage_Grotesque, Figtree } from "next/font/google";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const body = Figtree({ subsets: ["latin"], variable: "--font-body" });

// Order of the pipeline. Used to work out how many candidates have *reached* each stage.
const pipeline = [
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
  APPLIED: "Applied",
  REVIEWING: "Reviewing",
  SHORTLISTED: "Shortlisted",
  INTERVIEW_SCHEDULED: "Interview scheduled",
  INTERVIEW_COMPLETED: "Interview completed",
  DATE_SCHEDULED: "Date scheduled",
  DATE_COMPLETED: "Date completed",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

// Dot + tint per status, so state reads at a glance without a wall of pastel pills.
const statusStyles: Record<string, { pill: string; dot: string }> = {
  APPLIED: { pill: "bg-[#f1e9ee]", dot: "bg-[#8a7784]" },
  REVIEWING: { pill: "bg-[#fff1d6]", dot: "bg-[#d98a00]" },
  SHORTLISTED: { pill: "bg-[#fde3e8]", dot: "bg-[#d9364f]" },
  INTERVIEW_SCHEDULED: { pill: "bg-[#ece4ff]", dot: "bg-[#7a54d6]" },
  INTERVIEW_COMPLETED: { pill: "bg-[#e0f0ff]", dot: "bg-[#2f7fd1]" },
  DATE_SCHEDULED: { pill: "bg-[#ffe1ec]", dot: "bg-[#d93a7a]" },
  DATE_COMPLETED: { pill: "bg-[#e3f5ea]", dot: "bg-[#2a9a5b]" },
  ACCEPTED: { pill: "bg-[#d6f3e1]", dot: "bg-[#1b7f45]" },
  REJECTED: { pill: "bg-[#efeaea]", dot: "bg-[#8d8586]" },
  WITHDRAWN: { pill: "bg-[#efeaea]", dot: "bg-[#8d8586]" },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminDashboard() {
  // 3 queries instead of 12: one groupBy replaces all the per-status counts.
  const [statusGroups, recentCandidates, cityGroups] = await Promise.all([
    prisma.candidate.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),

    prisma.candidate.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        city: true,
        age: true,
        status: true,
        compatibilityScore: true,
        createdAt: true,
      },
    }),

    prisma.candidate.groupBy({
      by: ["city"],
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
      take: 6,
    }),
  ]);

  const counts: Record<string, number> = {};
  for (const g of statusGroups) counts[g.status] = g._count._all;
  const count = (s: string) => counts[s] ?? 0;

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const closed = count("REJECTED") + count("WITHDRAWN");
  const active = total - closed - count("ACCEPTED");

  // "Reached" = currently at this stage or any later stage.
  // Rejected/withdrawn are only counted in the first bar, since we don't know how far they got.
  const funnel = [
    { label: "Applied", value: total },
    ...pipeline.slice(1).map((stage, i) => ({
      label: statusLabels[stage],
      value: pipeline.slice(i + 1).reduce((sum, s) => sum + count(s), 0),
    })),
  ];

  const topCity = cityGroups[0]?._count.city ?? 1;
  const awaitingReview = count("APPLIED");

  const summary = [
    { label: "Total applicants", value: total },
    { label: "In progress", value: active },
    { label: "Shortlisted", value: count("SHORTLISTED") },
    { label: "Interviews", value: count("INTERVIEW_SCHEDULED") + count("INTERVIEW_COMPLETED") },
    { label: "Dates", value: count("DATE_SCHEDULED") + count("DATE_COMPLETED") },
    { label: "Accepted", value: count("ACCEPTED") },
  ];

  const focus =
    "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d9364f]";

  return (
    <main
      className={`${display.variable} ${body.variable} min-h-screen bg-[#fdf1f3] font-[family-name:var(--font-body)] text-[#2a1626] antialiased`}
    >
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#2a1626]/10 bg-[#fdf1f3]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 md:px-8">
          <div className="flex items-baseline gap-3">
            <h1 className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight">
              Recruitment HQ 💼
            </h1>
            <span className="hidden text-sm text-[#6b5566] sm:inline">Internal, keep it confidential</span>
          </div>

          <Link
            href="/admin/candidates"
            className={`rounded-xl bg-[#2a1626] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 ${focus}`}
          >
            Manage candidates
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-5 py-8 md:space-y-8 md:px-8 md:py-12">
        {/* Hero: what needs doing today */}
        <section className="flex flex-col gap-6 rounded-3xl bg-[#2a1626] p-7 text-white md:flex-row md:items-end md:justify-between md:p-10">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[1] tracking-tight md:text-6xl">
              {awaitingReview > 0
                ? `${awaitingReview} ${awaitingReview === 1 ? "application is" : "applications are"} waiting.`
                : "You’re all caught up."}
            </h2>
            <p className="mt-4 max-w-md leading-7 text-white/70">
              {awaitingReview > 0
                ? "New applications haven’t been reviewed yet. Please maintain professionalism at all times."
                : "Nothing is waiting for a first review. The pipeline is moving."}
            </p>
          </div>

          <Link
            href={awaitingReview > 0 ? "/admin/candidates?status=APPLIED" : "/admin/candidates"}
            className={`w-fit shrink-0 rounded-xl bg-[#ff6b81] px-5 py-3 text-sm font-bold text-[#2a1626] transition hover:opacity-90 ${focus}`}
          >
            {awaitingReview > 0 ? "Review new applicants" : "View all applicants"}
          </Link>
        </section>

        {/* Summary strip */}
        <section aria-label="Summary">
          <dl className="grid grid-cols-2 overflow-hidden rounded-3xl bg-white sm:grid-cols-3 lg:grid-cols-6">
            {summary.map((stat) => (
              <div key={stat.label} className="border-b border-r border-[#2a1626]/8 p-5 lg:border-b-0">
                <dd className="font-[family-name:var(--font-display)] text-4xl font-bold leading-none">
                  {stat.value}
                </dd>
                <dt className="mt-2 text-sm text-[#6b5566]">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </section>

        {/* Funnel + cities */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-3xl bg-white p-7 md:p-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
              Recruitment funnel
            </h2>
            <p className="mt-1 text-sm text-[#6b5566]">
              How many candidates have reached each stage.
            </p>

            <ol className="mt-6 space-y-3">
              {funnel.map((stage) => {
                const pct = total > 0 ? Math.round((stage.value / total) * 100) : 0;
                return (
                  <li key={stage.label} className="grid grid-cols-[7.5rem_1fr_4.5rem] items-center gap-3 text-sm sm:grid-cols-[9rem_1fr_5rem]">
                    <span className="truncate font-medium">{stage.label}</span>
                    <div className="h-6 overflow-hidden rounded-md bg-[#fdf1f3]">
                      <div
                        className="h-full rounded-md bg-[#d9364f]"
                        style={{ width: `${Math.max(pct, stage.value > 0 ? 2 : 0)}%` }}
                        role="img"
                        aria-label={`${stage.value} of ${total}, ${pct}%`}
                      />
                    </div>
                    <span className="text-right tabular-nums text-[#6b5566]">
                      <span className="font-semibold text-[#2a1626]">{stage.value}</span> · {pct}%
                    </span>
                  </li>
                );
              })}
            </ol>

            {closed > 0 && (
              <p className="mt-5 text-sm text-[#6b5566]">
                {closed} closed ({count("REJECTED")} rejected, {count("WITHDRAWN")} withdrawn) are only counted under Applied.
              </p>
            )}
          </section>

          <section className="rounded-3xl bg-white p-7 md:p-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
              Applicants by city
            </h2>

            {cityGroups.length === 0 ? (
              <p className="mt-4 text-sm text-[#6b5566]">Cities will show up once applications come in.</p>
            ) : (
              <ul className="mt-6 space-y-4">
                {cityGroups.map((c) => (
                  <li key={c.city}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-medium">{c.city}</span>
                      <span className="tabular-nums text-[#6b5566]">{c._count.city}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#fdf1f3]">
                      <div
                        className="h-full rounded-full bg-[#2a1626]"
                        style={{ width: `${(c._count.city / topCity) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Recent applications */}
        <section className="rounded-3xl bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 p-7 pb-4 md:px-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
              Recent applications
            </h2>
            <Link
              href="/admin/candidates"
              className={`rounded-md text-sm font-semibold text-[#d9364f] hover:underline ${focus}`}
            >
              View all applicants
            </Link>
          </div>

          {recentCandidates.length === 0 ? (
            <p className="p-10 pt-4 text-sm text-[#6b5566]">
              No applications yet. Share the application link to get started.
            </p>
          ) : (
            <ul className="divide-y divide-[#2a1626]/8">
              {recentCandidates.map((c) => {
                const style = statusStyles[c.status] ?? statusStyles.APPLIED;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/admin/candidates/${c.id}`}
                      className={`flex flex-col gap-3 px-7 py-4 transition hover:bg-[#fdf1f3] md:flex-row md:items-center md:justify-between md:px-8 ${focus}`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fde3e8] font-[family-name:var(--font-display)] font-bold text-[#d9364f]"
                          aria-hidden="true"
                        >
                          {c.firstName.charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {c.firstName} {c.lastName ?? ""}
                          </p>
                          <p className="text-sm text-[#6b5566]">
                            {c.age}, {c.city}. Applied {formatDate(c.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pl-14 md:pl-0">
                        {c.compatibilityScore !== null && (
                          <span className="text-sm font-semibold tabular-nums">
                            {c.compatibilityScore}% match
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${style.pill}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden="true" />
                          {statusLabels[c.status] ?? c.status}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Shortcuts */}
        <nav aria-label="Shortcuts" className="grid gap-3 md:grid-cols-3">
          {[
            { href: "/admin/candidates", title: "All candidates", note: "Search, filter and review everyone.", n: total },
            { href: "/admin/candidates?status=SHORTLISTED", title: "Shortlist", note: "Candidates past the first cut.", n: count("SHORTLISTED") },
            { href: "/admin/candidates?status=INTERVIEW_SCHEDULED", title: "Upcoming interviews", note: "Interviews still to happen.", n: count("INTERVIEW_SCHEDULED") },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={`group flex items-start justify-between gap-4 rounded-2xl border border-[#2a1626]/10 p-5 transition hover:border-[#d9364f] hover:bg-white ${focus}`}
            >
              <div>
                <p className="font-semibold group-hover:text-[#d9364f]">{a.title}</p>
                <p className="mt-1 text-sm text-[#6b5566]">{a.note}</p>
              </div>
              <span className="font-[family-name:var(--font-display)] text-2xl font-bold tabular-nums">
                {a.n}
              </span>
            </Link>
          ))}
        </nav>

        <footer className="pt-2 text-center text-xs text-[#6b5566]">
          Internal recruitment system. Please keep candidate data confidential, and do not fall in love with the applicants.
        </footer>
      </div>
    </main>
  );
}