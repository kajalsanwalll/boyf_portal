import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Bricolage_Grotesque, Figtree } from "next/font/google";

// This page depends on the current time, so it must never be prerendered at build time.
export const dynamic = "force-dynamic";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const body = Figtree({ subsets: ["latin"], variable: "--font-body" });

// Group and label days in the same timezone the schedule is meant to be read in.
const TZ = "Asia/Kolkata";

const dayKey = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d); // YYYY-MM-DD

const formatTime = (d: Date) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(d);

const formatFullDate = (d: Date) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" }).format(d);

const formatShortDate = (d: Date) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: TZ, day: "numeric", month: "short" }).format(d);

function getDateTypeLabel(type: string) {
  switch (type) {
    case "ONLINE":
      return "Online date";
    case "COFFEE":
      return "Coffee date";
    case "DINNER":
      return "Dinner date";
    case "WALK":
      return "Walk date";
    default:
      return "Date";
  }
}

const focus =
  "outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d9364f]";

const candidateSelect = {
  id: true,
  firstName: true,
  lastName: true,
  photoUrl: true,
  city: true,
} as const;

export default async function AdminCalendarPage() {
  const now = new Date();
  const todayKey = dayKey(now);
  const tomorrowKey = dayKey(new Date(now.getTime() + 24 * 60 * 60 * 1000));

  const [interviews, dates] = await Promise.all([
    prisma.interview.findMany({
      where: { status: "SCHEDULED", scheduledAt: { gte: now } },
      include: { candidate: { select: candidateSelect } },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.date.findMany({
      where: { status: "SCHEDULED", scheduledAt: { gte: now } },
      include: { candidate: { select: candidateSelect } },
      orderBy: { scheduledAt: "asc" },
    }),
  ]);

  const events = [
    ...interviews.map((i) => ({
      id: i.id,
      kind: "INTERVIEW" as const,
      scheduledAt: i.scheduledAt,
      meetingUrl: i.meetingUrl,
      candidate: i.candidate,
      label: "Interview",
      description: "Boyfriend interview",
    })),
    ...dates.map((d) => ({
      id: d.id,
      kind: "DATE" as const,
      scheduledAt: d.scheduledAt,
      meetingUrl: d.meetingUrl,
      candidate: d.candidate,
      label: getDateTypeLabel(d.type),
      description: d.prompt || "Scheduled date",
    })),
  ].sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

  const groupedEvents = events.reduce<Record<string, typeof events>>((groups, event) => {
    const key = dayKey(event.scheduledAt);
    (groups[key] ??= []).push(event);
    return groups;
  }, {});

  const next = events[0];

  return (
    <main
      className={`${display.variable} ${body.variable} min-h-screen bg-[#fdf1f3] font-[family-name:var(--font-body)] text-[#2a1626] antialiased`}
    >
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#2a1626]/10 bg-[#fdf1f3]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 md:px-8">
          <Link
            href="/admin"
            className={`rounded-md font-[family-name:var(--font-display)] text-lg font-bold tracking-tight hover:text-[#d9364f] ${focus}`}
          >
            Recruitment HQ 💼
          </Link>

          <Link
            href="/admin/candidates"
            className={`rounded-xl bg-white px-4 py-2 text-sm font-semibold hover:text-[#d9364f] ${focus}`}
          >
            ← Candidates
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">
        {/* Page heading */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight md:text-6xl">
              The schedule.
            </h1>
            <p className="mt-3 max-w-xl leading-7 text-[#6b5566]">
              {next
                ? `Next up: ${next.candidate.firstName}, ${
                    dayKey(next.scheduledAt) === todayKey ? "today" : formatShortDate(next.scheduledAt)
                  } at ${formatTime(next.scheduledAt)}.`
                : "Upcoming interviews and dates will show up here."}
            </p>
          </div>

          <dl className="flex overflow-hidden rounded-2xl bg-white">
            <div className="px-6 py-3">
              <dd className="font-[family-name:var(--font-display)] text-3xl font-bold leading-none">
                {interviews.length}
              </dd>
              <dt className="mt-1 text-sm text-[#6b5566]">Interviews</dt>
            </div>
            <div className="border-l border-[#2a1626]/10 px-6 py-3">
              <dd className="font-[family-name:var(--font-display)] text-3xl font-bold leading-none">
                {dates.length}
              </dd>
              <dt className="mt-1 text-sm text-[#6b5566]">Dates</dt>
            </div>
          </dl>
        </div>

        {events.length === 0 ? (
          <section className="rounded-3xl bg-white p-10 md:p-14">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold">
              Nothing scheduled.
            </h2>
            <p className="mt-3 max-w-md leading-7 text-[#6b5566]">
              The committee is free. Suspiciously free. Open a candidate to
              schedule an interview or a date.
            </p>
            <Link
              href="/admin/candidates"
              className={`mt-6 inline-flex rounded-xl bg-[#d9364f] px-5 py-3 text-sm font-bold text-white hover:opacity-90 ${focus}`}
            >
              View candidates
            </Link>
          </section>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedEvents).map(([key, dayEvents]) => {
              const day = dayEvents[0].scheduledAt;
              const title =
                key === todayKey ? "Today" : key === tomorrowKey ? "Tomorrow" : formatFullDate(day);
              const subtitle = key === todayKey || key === tomorrowKey ? formatFullDate(day) : null;

              return (
                <section key={key} aria-labelledby={`day-${key}`}>
                  <div className="mb-3 flex flex-wrap items-baseline gap-x-3">
                    <h2
                      id={`day-${key}`}
                      className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight"
                    >
                      {title}
                    </h2>
                    {subtitle && <p className="text-[#6b5566]">{subtitle}</p>}
                  </div>

                  <ul className="divide-y divide-[#2a1626]/8 overflow-hidden rounded-3xl bg-white">
                    {dayEvents.map((event) => {
                      const isInterview = event.kind === "INTERVIEW";
                      const c = event.candidate;
                      const name = `${c.firstName} ${c.lastName ?? ""}`.trim();

                      return (
                        <li
                          key={`${event.kind}-${event.id}`}
                          className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:gap-6 md:px-7"
                        >
                          <p className="w-24 shrink-0 font-[family-name:var(--font-display)] text-xl font-bold tabular-nums">
                            {formatTime(event.scheduledAt)}
                          </p>

                          <Link
                            href={`/admin/candidates/${c.id}`}
                            className={`flex min-w-0 flex-1 items-center gap-4 rounded-xl ${focus}`}
                          >
                            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#fde3e8] font-[family-name:var(--font-display)] text-xl font-bold text-[#d9364f]">
                              {c.photoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={c.photoUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                c.firstName.charAt(0)
                              )}
                            </span>

                            <span className="min-w-0">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="font-[family-name:var(--font-display)] text-lg font-bold">
                                  {name}
                                </span>
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${
                                    isInterview ? "bg-[#fde3e8] text-[#b3243b]" : "bg-[#ece4ff] text-[#5b3bb0]"
                                  }`}
                                >
                                  {event.label}
                                </span>
                              </span>
                              <span className="mt-0.5 block truncate text-sm text-[#6b5566]">
                                {c.city}. {event.description}
                              </span>
                            </span>
                          </Link>

                          {event.meetingUrl ? (
                            <a
                              href={event.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={`inline-flex shrink-0 items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white hover:opacity-90 ${focus} ${
                                isInterview ? "bg-[#d9364f]" : "bg-[#2a1626]"
                              }`}
                            >
                              {isInterview ? "Join interview" : "Join date"} →
                            </a>
                          ) : (
                            <Link
                              href={`/admin/candidates/${c.id}`}
                              className={`inline-flex shrink-0 items-center justify-center rounded-xl border border-[#2a1626]/15 px-5 py-3 text-sm font-bold hover:border-[#d9364f] hover:text-[#d9364f] ${focus}`}
                            >
                              Add meeting link
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}

        <p className="mt-10 text-center text-sm text-[#6b5566]">
          Only upcoming, scheduled events appear here. Completed ones move out of the schedule.
        </p>
      </div>
    </main>
  );
}