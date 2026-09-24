"use client";

import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Heart,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";

const responsibilities = [
  "Communicate like an adult",
  "Remember the little things",
  "Send memes without being asked",
  "Share fries (negotiable)",
];

const qualifications = [
  "Good communication skills",
  "Emotionally available",
  "Can take a joke",
  "Has a personality outside of work",
  "Understands the importance of food",
  "Willing to commit to quality time",
];

const employerTraits = [
  "Professional yapper",
  "Loves good conversations",
  "Will probably steal your hoodie",
  "Strong opinions on where to eat",
];

const H = "font-[family-name:var(--font-heading)]";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e94f64]";

const SCREEN =
  "flex min-h-svh snap-start items-center px-5 pb-12 pt-28 sm:px-8 lg:px-12";

export default function Home() {
  const reduce = useReducedMotion();

  const [hasApplication, setHasApplication] = useState(false);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkApplication() {
      try {
        const response = await fetch("/api/me/candidate", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setHasApplication(Boolean(data.hasApplication));
          setCandidateId(data.candidateId ?? null);
        }
      } catch (error) {
        console.error("Failed to check application:", error);
      } finally {
        if (!cancelled) {
          setCheckingApplication(false);
        }
      }
    }

    checkApplication();

    return () => {
      cancelled = true;
    };
  }, []);

  const applicationHref =
    hasApplication && candidateId
      ? `/candidate/${candidateId}`
      : "/apply";

  const applicationLabel = hasApplication
    ? "View my profile"
    : "Continue application";

  return (
    <main className="h-svh snap-y snap-proximity overflow-y-auto overflow-x-hidden scroll-smooth bg-[#fff8f5] text-[#171717]">
      {/* NAV */}
      <nav className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-[#eadcdf] bg-[#fff8f5]/90 px-5 py-3 backdrop-blur-xl">
          <Link
            href="/"
            className={`${H} text-lg font-bold tracking-tight ${FOCUS}`}
          >
            boyfriend<span className="text-[#e94f64]">.inc</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-semibold md:flex">
            {[
              ["#role", "The role"],
              ["#employer", "Your employer"],
              ["#requirements", "Requirements"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className={`transition hover:text-[#e94f64] ${FOCUS}`}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* LOGGED OUT */}
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className={`hidden rounded-full px-4 py-2 text-sm font-semibold transition hover:text-[#e94f64] sm:block ${FOCUS}`}
              >
                Sign in
              </Link>

              <Link
                href="/sign-up"
                className={`rounded-full bg-[#e94f64] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#d9364f] ${FOCUS}`}
              >
                Apply now
              </Link>
            </Show>

            {/* LOGGED IN */}
            <Show when="signed-in">
              {!checkingApplication && (
                <Link
                  href={applicationHref}
                  className={`hidden rounded-full bg-[#e94f64] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#d9364f] sm:block ${FOCUS}`}
                >
                  {applicationLabel}
                </Link>
              )}

              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              />
            </Show>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className={SCREEN}>
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="order-2 lg:order-1"
          >
            <p className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#eadcdf] bg-white py-1.5 pl-3 pr-4 text-sm font-semibold text-[#746f70]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              Applications are open
            </p>

            <h1
              className={`${H} max-w-xl text-5xl font-bold leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl`}
            >
              Meet your potential employer.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-[#746f70]">
              A highly selective search for the first and hopefully final
              boyfriend position. References may or may not be contacted.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {/* LOGGED OUT */}
              <Show when="signed-out">
                <Link
                  href="/sign-up"
                  className={`group inline-flex items-center justify-center gap-2 rounded-full bg-[#e94f64] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#d9364f] ${FOCUS}`}
                >
                  Submit application
                  <ArrowUpRight
                    size={17}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </Show>

              {/* LOGGED IN */}
              <Show when="signed-in">
                {!checkingApplication && (
                  <Link
                    href={applicationHref}
                    className={`group inline-flex items-center justify-center gap-2 rounded-full bg-[#e94f64] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#d9364f] ${FOCUS}`}
                  >
                    {applicationLabel}
                    <ArrowUpRight
                      size={17}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                )}
              </Show>

              <a
                href="#role"
                className={`inline-flex items-center justify-center gap-2 rounded-full border border-[#d9cacc] bg-white px-7 py-4 text-sm font-bold transition hover:border-[#e94f64] hover:text-[#e94f64] ${FOCUS}`}
              >
                Read the job description
                <ArrowDown size={16} />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: 2 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="order-1 mx-auto w-full max-w-[280px] sm:max-w-[340px] lg:order-2 lg:max-w-[360px]"
          >
            <div className="relative rounded-[28px] bg-white p-3.5 pt-8 shadow-[0_30px_70px_rgba(80,30,40,0.14)] ring-1 ring-[#eadcdf]">
              <span className="absolute left-1/2 top-3 h-2 w-14 -translate-x-1/2 rounded-full bg-[#eadcdf]" />

              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#f8dde2]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/kajal.jpg"
                  alt="Kajal, hiring manager"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex items-end justify-between gap-3 px-2 pb-1 pt-4">
                <div>
                  <h2 className={`${H} text-2xl font-bold leading-none`}>
                    Kajal
                  </h2>

                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#746f70]">
                    <MapPin size={14} />
                    IIT Madras
                  </p>
                </div>

                <p className="text-sm font-bold">Hiring manager</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ROLE */}
      <section id="role" className={SCREEN}>
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e94f64]">
              01 / The role
            </p>

            <h2
              className={`${H} mt-3 max-w-md text-5xl font-bold leading-none tracking-[-0.04em] sm:text-6xl`}
            >
              Boyfriend, full-time.
            </h2>

            <p className="mt-6 max-w-sm leading-7 text-[#746f70]">
              Conversations, adventures, food runs and an unreasonable number
              of inside jokes. Not your average job listing.
            </p>

            <p className="mt-6 text-sm font-semibold text-[#e94f64]">
              Position ID: BF-001
            </p>
          </div>

          <div className="rounded-[28px] border border-[#eadcdf] bg-white p-6 sm:p-8">
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              {[
                ["Location", "Flexible / TBD"],
                ["Type", "Long-term preferred"],
                ["Pay", "Love, food & quality time"],
                ["Start", "As soon as possible"],
              ].map(([key, value]) => (
                <div key={key}>
                  <dt className="text-sm text-[#a09698]">{key}</dt>
                  <dd className="mt-0.5 font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <h3 className={`${H} mb-1 mt-8 text-xl font-bold`}>
              Responsibilities
            </h3>

            <ul>
              {responsibilities.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 border-b border-[#f1e5e1] py-3 last:border-b-0"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f8dde2] text-[#e94f64]">
                    <Check size={14} strokeWidth={3} />
                  </span>

                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* EMPLOYER */}
      <section
        id="employer"
        className={`${SCREEN} bg-[#2a1626] text-white`}
      >
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f49aaa]">
              02 / Your employer
            </p>

            <h2
              className={`${H} mt-4 max-w-xl text-4xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-6xl`}
            >
              A little about the person you&apos;re applying to.
            </h2>

            <p className="mt-6 max-w-md leading-7 text-white/65">
              She&apos;s looking for someone who can match her energy and make
              ordinary days considerably more fun.
            </p>

            <ul className="mt-7 flex flex-wrap gap-2.5">
              {employerTraits.map((trait) => (
                <li
                  key={trait}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium"
                >
                  {trait}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-7">
            <h3 className={`${H} text-3xl font-bold`}>Kajal</h3>

            <p className="mt-1.5 text-sm text-white/50">
              Founder &amp; Chief Everything Officer
            </p>

            <dl className="mt-6 divide-y divide-white/10 border-t border-white/10">
              {[
                ["Primary skill", "Professional overthinking"],
                [
                  "Preferred communication",
                  "Text + unnecessarily long calls",
                ],
                ["Hiring status", "Actively interviewing"],
              ].map(([key, value], index) => (
                <div key={key} className="py-3.5">
                  <dt className="text-sm text-white/40">{key}</dt>

                  <dd
                    className={`mt-0.5 font-semibold ${
                      index === 2 ? "text-[#f49aaa]" : ""
                    }`}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* REQUIREMENTS */}
      <section id="requirements" className={SCREEN}>
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e94f64]">
            03 / Requirements
          </p>

          <h2
            className={`${H} mt-3 max-w-2xl text-5xl font-bold leading-none tracking-[-0.04em] sm:text-6xl`}
          >
            What we&apos;re looking for.
          </h2>

          <p className="mt-5 max-w-xl leading-7 text-[#746f70]">
            Not a space for non-chalant guys — leave rn. If you are not an
            aesthetic person, you are filtered into the priority queue at the
            top. Lastly, being a decent human matters more.
          </p>

          <ul className="mt-10 grid border-b border-[#eadcdf] md:grid-cols-2 md:gap-x-14">
            {qualifications.map((qualification) => (
              <li
                key={qualification}
                className="flex items-center gap-4 border-t border-[#eadcdf] py-4 text-lg font-semibold sm:py-5"
              >
                <Heart
                  size={18}
                  className="shrink-0 text-[#e94f64]"
                  fill="currentColor"
                />

                {qualification}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA + FOOTER */}
      <section className="flex min-h-svh snap-start flex-col bg-[#e94f64] text-white">
        <div className="flex flex-1 items-center justify-center px-5 pb-8 pt-28 text-center sm:px-8">
          <div className="mx-auto max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/65">
              Final question
            </p>

            <h2
              className={`${H} mt-4 text-5xl font-bold leading-[0.98] tracking-[-0.04em] sm:text-7xl`}
            >
              Think you&apos;re qualified?
            </h2>

            <p className="mx-auto mt-6 max-w-md leading-7 text-white/85">
              Applications are reviewed manually. Low-effort answers may
              result in immediate rejection and/or being made fun of.
            </p>

            {/* LOGGED OUT */}
            <Show when="signed-out">
              <Link
                href="/sign-up"
                className="mt-9 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-bold text-[#e94f64] transition hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Submit your application
                <ArrowUpRight size={18} />
              </Link>
            </Show>

            {/* LOGGED IN */}
            <Show when="signed-in">
              {!checkingApplication && (
                <Link
                  href={applicationHref}
                  className="mt-9 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-bold text-[#e94f64] transition hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {hasApplication
                    ? "View my profile"
                    : "Continue application"}
                  <ArrowUpRight size={18} />
                </Link>
              )}
            </Show>
          </div>
        </div>

        <footer className="bg-[#2a1626] px-5 py-6 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className={`${H} text-lg font-bold`}>
              boyfriend<span className="text-[#f49aaa]">.inc</span>

              <span className="ml-3 font-sans text-sm font-normal text-white/40">
                A completely legitimate recruitment company.
              </span>
            </p>

            <p className="text-sm text-white/45">
              Privacy Policy* &ensp; Terms &amp; Conditions* &ensp; *not
              legally binding
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}