"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useForm,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  firstName: z.string().min(2, "Please enter your first name."),

  lastName: z.string().optional(),

  email: z.string().email("Please enter a valid email."),

  age: z.coerce
    .number()
    .min(18, "Applicants must be 18+.")
    .max(99, "Please enter a valid age."),

  city: z.string().min(2, "Please enter your city."),

  height: z.string().optional(),

  zodiac: z.string().optional(),

  occupation: z.string().optional(),

  // Cloudinary URL gets stored here
  photoUrl: z.string().optional(),

  workoutFrequency: z.string().optional(),

  diet: z.string().optional(),

  weekendPreference: z.string().optional(),

  travels: z.string().optional(),

  hasPets: z.boolean().optional(),

  petType: z.string().optional(),

  personality: z
    .enum(["INTROVERT", "EXTROVERT", "AMBIVERT", "DEPENDS"])
    .optional(),

  conflictStyle: z.string().optional(),

  communication: z.string().optional(),

  friendsDescribe: z.string().optional(),

  relationshipIntent: z
    .enum([
      "CASUAL",
      "SERIOUS",
      "OPEN_TO_SEEING",
      "MARRIAGE",
      "FOR_THE_PLOT",
    ])
    .optional(),

  loveLanguages: z.string().optional(),

  values: z.string().optional(),

  longTermGoals: z.string().optional(),

  relationshipNeeds: z.string().optional(),

  fryProtocol: z.string().optional(),

  fineResponse: z.string().optional(),

  readResponse: z.string().optional(),

  toiletProtocol: z.string().optional(),

  whyGoodBoyfriend: z.string().optional(),

  whatMakesDifferent: z.string().optional(),

  anythingElse: z.string().optional(),
});

/*
 * Important:
 *
 * z.coerce.number() has an INPUT type of unknown,
 * but an OUTPUT type of number.
 *
 * Using z.infer<typeof formSchema> directly with useForm()
 * can therefore cause a production TypeScript error.
 *
 * We explicitly tell react-hook-form:
 *
 * Input  -> z.input<typeof formSchema>
 * Output -> z.output<typeof formSchema>
 */
type FormInput = z.input<typeof formSchema>;
type FormData = z.output<typeof formSchema>;

const steps = [
  "Basic Info",
  "Lifestyle",
  "Personality",
  "Relationship",
  "Important Questions",
];

export default function ApplyPage() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [photoPreview, setPhotoPreview] = useState<string | null>(
    null
  );

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [photoError, setPhotoError] = useState("");

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormInput, any, FormData>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      hasPets: false,
    },
  });

  const hasPets = watch("hasPets");

  async function handlePhotoUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setPhotoError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setPhotoError(
        "Please upload a JPG, PNG, or WEBP image."
      );

      event.target.value = "";

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image must be smaller than 5MB.");

      event.target.value = "";

      return;
    }

    // Local preview
    const previewUrl = URL.createObjectURL(file);

    setPhotoPreview(previewUrl);
    setUploadingPhoto(true);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to upload photo."
        );
      }

      // Save Cloudinary URL into react-hook-form
      setValue("photoUrl", result.url, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error) {
      console.error(error);

      setPhotoError(
        error instanceof Error
          ? error.message
          : "Failed to upload photo."
      );

      setPhotoPreview(null);

      setValue("photoUrl", "");
    } finally {
      setUploadingPhoto(false);

      event.target.value = "";
    }
  }

  function removePhoto() {
    setPhotoPreview(null);
    setPhotoError("");

    setValue("photoUrl", "", {
      shouldDirty: true,
    });
  }

  async function nextStep() {
    if (step >= steps.length - 1) {
      return;
    }

    const fieldsByStep: (keyof FormInput)[][] = [
      ["firstName", "email", "age", "city"],
      [],
      [],
      [],
      [],
    ];

    const fields = fieldsByStep[step];

    if (fields.length > 0) {
      const valid = await trigger(fields);

      if (!valid) {
        return;
      }
    }

    setStep((current) => current + 1);
  }

  function previousStep() {
    setStep((current) => Math.max(current - 1, 0));
  }

  async function submitApplication(data: FormData) {
    if (uploadingPhoto) {
      alert(
        "Please wait for your photo to finish uploading."
      );

      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/apply", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(
          result.error ||
            "Failed to submit application."
        );

        return;
      }

      router.push(`/apply/success?id=${result.id}`);
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong while submitting."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fff8f5] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <a
            href="/"
            className="text-2xl font-bold text-[#171717]"
          >
            boyfriend
            <span className="text-[#e94f64]">.</span>
          </a>

          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#e94f64]">
            Applications are open
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#171717] md:text-5xl">
            Apply for the boyfriend position.
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-[#746f70]">
            Fill out the application honestly. Our recruitment
            department is extremely serious about this.
          </p>
        </div>

        {/* PROGRESS */}
        <div className="mb-6 rounded-2xl border border-[#e8d9db] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            {steps.map((label, index) => (
              <div
                key={label}
                className="flex flex-1 items-center gap-2"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    index <= step
                      ? "bg-[#e94f64] text-white"
                      : "bg-[#f8dde2] text-[#746f70]"
                  }`}
                >
                  {index + 1}
                </div>

                <span
                  className={`hidden text-xs font-semibold sm:block ${
                    index === step
                      ? "text-[#e94f64]"
                      : "text-[#746f70]"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#f8dde2]">
            <div
              className="h-full rounded-full bg-[#e94f64] transition-all"
              style={{
                width: `${
                  ((step + 1) / steps.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(submitApplication)}
          onKeyDown={(event) => {
            /*
             * Prevent accidental implicit form submission
             * when pressing Enter inside a normal input.
             *
             * Textareas are intentionally excluded so users
             * can press Enter while writing their answers.
             */
            if (
              event.key === "Enter" &&
              event.target instanceof HTMLInputElement
            ) {
              event.preventDefault();
            }
          }}
          className="rounded-3xl border border-[#e8d9db] bg-white p-6 shadow-sm md:p-8"
        >

          {/* STEP 1 */}
          {step === 0 && (
            <StepContainer
              title="Let's start with the basics."
              subtitle="The boring HR stuff. We promise it gets better."
            >
              <div className="grid gap-5 sm:grid-cols-2">

                <Field
                  label="First name *"
                  error={errors.firstName?.message}
                >
                  <input
                    {...register("firstName")}
                    placeholder="Arjun"
                    className="input"
                  />
                </Field>

                <Field label="Last name">
                  <input
                    {...register("lastName")}
                    placeholder="Sharma"
                    className="input"
                  />
                </Field>

                <Field
                  label="Email *"
                  error={errors.email?.message}
                >
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="arjun@email.com"
                    className="input"
                  />
                </Field>

                <Field
                  label="Age *"
                  error={errors.age?.message}
                >
                  <input
                    {...register("age")}
                    type="number"
                    placeholder="24"
                    className="input"
                  />
                </Field>

                <Field
                  label="City *"
                  error={errors.city?.message}
                >
                  <input
                    {...register("city")}
                    placeholder="Mumbai"
                    className="input"
                  />
                </Field>

                <Field label="Height">
                  <input
                    {...register("height")}
                    placeholder="5'11"
                    className="input"
                  />
                </Field>

                <Field label="Zodiac">
                  <input
                    {...register("zodiac")}
                    placeholder="Leo"
                    className="input"
                  />
                </Field>

                <Field label="Occupation / Degree">
                  <input
                    {...register("occupation")}
                    placeholder="Engineer / MBA / etc."
                    className="input"
                  />
                </Field>

              </div>

              {/* PHOTO UPLOAD */}
              <div className="mt-5">
                <label className="block text-sm font-semibold text-[#171717]">
                  Profile photo
                </label>

                <p className="mt-1 text-xs text-[#746f70]">
                  Give the recruitment team something to work with.
                  JPG, PNG or WEBP · max 5MB
                </p>

                {!photoPreview ? (
                  <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e8d9db] bg-[#fff8f5] px-6 py-10 text-center transition hover:border-[#e94f64] hover:bg-[#fff1f3]">
                    <span className="text-3xl">
                      📸
                    </span>

                    <span className="mt-3 text-sm font-bold text-[#171717]">
                      Choose a photo
                    </span>

                    <span className="mt-1 text-xs text-[#746f70]">
                      Upload from your device
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-[#e8d9db] bg-[#fff8f5] p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        className="h-32 w-32 rounded-xl object-cover"
                      />

                      <div className="flex-1">
                        {uploadingPhoto ? (
                          <>
                            <p className="font-semibold text-[#171717]">
                              Uploading photo...
                            </p>

                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#f8dde2]">
                              <div className="h-full w-2/3 animate-pulse rounded-full bg-[#e94f64]" />
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-[#171717]">
                              ✓ Photo uploaded
                            </p>

                            <p className="mt-1 text-xs text-[#746f70]">
                              Your photo has been securely uploaded.
                            </p>

                            <div className="mt-3 flex gap-2">
                              <label className="cursor-pointer rounded-lg border border-[#e8d9db] bg-white px-3 py-2 text-xs font-semibold transition hover:border-[#e94f64]">
                                Replace

                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={handlePhotoUpload}
                                  className="hidden"
                                />
                              </label>

                              <button
                                type="button"
                                onClick={removePhoto}
                                className="rounded-lg px-3 py-2 text-xs font-semibold text-[#e94f64] hover:bg-[#f8dde2]"
                              >
                                Remove
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {photoError && (
                  <p className="mt-2 text-xs font-medium text-[#e94f64]">
                    {photoError}
                  </p>
                )}
              </div>
            </StepContainer>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <StepContainer
              title="Tell us about your lifestyle."
              subtitle="We need to know what we're signing up for."
            >
              <div className="space-y-5">

                <Field label="How often do you work out?">
                  <input
                    {...register("workoutFrequency")}
                    placeholder="Gym 5x a week / occasionally / never..."
                    className="input"
                  />
                </Field>

                <Field label="What's your diet like?">
                  <input
                    {...register("diet")}
                    placeholder="Everything / vegetarian / protein enthusiast..."
                    className="input"
                  />
                </Field>

                <Field label="Ideal weekend?">
                  <textarea
                    {...register("weekendPreference")}
                    placeholder="Sleep in, brunch, football, Netflix..."
                    className="textarea"
                  />
                </Field>

                <Field label="How do you feel about travelling?">
                  <textarea
                    {...register("travels")}
                    placeholder="Road trips, international travel, spontaneous plans..."
                    className="textarea"
                  />
                </Field>

                <div>
                  <label className="block text-sm font-semibold text-[#171717]">
                    Do you have pets?
                  </label>

                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setValue("hasPets", true, {
                          shouldDirty: true,
                        })
                      }
                      className={`rounded-xl px-5 py-3 text-sm font-semibold ${
                        hasPets
                          ? "bg-[#e94f64] text-white"
                          : "border border-[#e8d9db] bg-white text-[#171717]"
                      }`}
                    >
                      Yes 🐶
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setValue("hasPets", false, {
                          shouldDirty: true,
                        })
                      }
                      className={`rounded-xl px-5 py-3 text-sm font-semibold ${
                        hasPets === false
                          ? "bg-[#e94f64] text-white"
                          : "border border-[#e8d9db] bg-white text-[#171717]"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {hasPets && (
                  <Field label="What kind?">
                    <input
                      {...register("petType")}
                      placeholder="Dog, cat, hamster..."
                      className="input"
                    />
                  </Field>
                )}

              </div>
            </StepContainer>
          )}

          {/* STEP 3 */}
          {step === 2 && (
            <StepContainer
              title="Personality check."
              subtitle="There are no wrong answers. Probably."
            >
              <div className="space-y-6">

                <div>
                  <label className="block text-sm font-semibold text-[#171717]">
                    How would you describe yourself?
                  </label>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {[
                      ["INTROVERT", "Introvert 🧸"],
                      ["EXTROVERT", "Extrovert 🪩"],
                      ["AMBIVERT", "Ambivert 🌓"],
                      ["DEPENDS", "Depends™"],
                    ].map(([value, label]) => (
                      <label
                        key={value}
                        className="cursor-pointer"
                      >
                        <input
                          {...register("personality")}
                          type="radio"
                          value={value}
                          className="peer sr-only"
                        />

                        <div className="rounded-xl border border-[#e8d9db] p-4 text-sm font-semibold transition peer-checked:border-[#e94f64] peer-checked:bg-[#f8dde2]">
                          {label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <Field label="How do you handle conflict?">
                  <textarea
                    {...register("conflictStyle")}
                    placeholder="Talk it out / need space / avoid it until it disappears..."
                    className="textarea"
                  />
                </Field>

                <Field label="How do you communicate?">
                  <textarea
                    {...register("communication")}
                    placeholder="Texting, calls, voice notes, memes..."
                    className="textarea"
                  />
                </Field>

                <Field label="What would your friends say about you?">
                  <textarea
                    {...register("friendsDescribe")}
                    placeholder="Funny, chaotic, dependable..."
                    className="textarea"
                  />
                </Field>

              </div>
            </StepContainer>
          )}

          {/* STEP 4 */}
          {step === 3 && (
            <StepContainer
              title="Relationship stuff."
              subtitle="Okay, now we're getting serious."
            >
              <div className="space-y-6">

                <div>
                  <label className="block text-sm font-semibold text-[#171717]">
                    What are you looking for?
                  </label>

                  <div className="mt-3 space-y-2">
                    {[
                      ["CASUAL", "Something casual"],
                      ["SERIOUS", "A serious relationship"],
                      [
                        "OPEN_TO_SEEING",
                        "Open to seeing where it goes",
                      ],
                      ["MARRIAGE", "Marriage"],
                      [
                        "FOR_THE_PLOT",
                        "Honestly? For the plot.",
                      ],
                    ].map(([value, label]) => (
                      <label
                        key={value}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e8d9db] p-4"
                      >
                        <input
                          {...register("relationshipIntent")}
                          type="radio"
                          value={value}
                        />

                        <span className="text-sm font-medium">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Field label="Love languages">
                  <input
                    {...register("loveLanguages")}
                    placeholder="Quality time, words, acts of service..."
                    className="input"
                  />
                </Field>

                <Field label="What values matter to you?">
                  <textarea
                    {...register("values")}
                    placeholder="Honesty, ambition, kindness..."
                    className="textarea"
                  />
                </Field>

                <Field label="Long-term goals">
                  <textarea
                    {...register("longTermGoals")}
                    placeholder="Career, family, travel, building something..."
                    className="textarea"
                  />
                </Field>

                <Field label="What do you need from a relationship?">
                  <textarea
                    {...register("relationshipNeeds")}
                    placeholder="Communication, support, space..."
                    className="textarea"
                  />
                </Field>

              </div>
            </StepContainer>
          )}

          {/* STEP 5 — IMPORTANT QUESTIONS */}
          {step === 4 && (
            <StepContainer
              title="The important questions™."
              subtitle="This is where careers are made or destroyed."
            >
              <div className="space-y-6">

                <Question
                  emoji="🍟"
                  question="There is one fry left. What happens?"
                  register={register("fryProtocol")}
                />

                <Question
                  emoji="🙂"
                  question={'Your partner says "I\'m fine." What do you do?'}
                  register={register("fineResponse")}
                />

                <Question
                  emoji="👀"
                  question="You get left on read. What's your move?"
                  register={register("readResponse")}
                />

                <Question
                  emoji="🚽"
                  question="What's your toilet seat policy?"
                  register={register("toiletProtocol")}
                />

                <Question
                  emoji="💼"
                  question="Why should we hire you as a boyfriend?"
                  register={register("whyGoodBoyfriend")}
                />

                <Question
                  emoji="✨"
                  question="What makes you different from the other applicants?"
                  register={register("whatMakesDifferent")}
                />

                <Question
                  emoji="📝"
                  question="Anything else the recruitment team should know?"
                  register={register("anythingElse")}
                />

              </div>

              {/* IMPORTANT: This is NOT a submit button */}
              <div className="mt-6 rounded-xl border border-[#f8dde2] bg-[#fff8f5] p-4">
                <p className="text-xs leading-5 text-[#746f70]">
                  💌 Take your time with these. Your answers are
                  saved as you type and will only be submitted when
                  you click the final button below.
                </p>
              </div>
            </StepContainer>
          )}

          {/* NAVIGATION */}
          <div className="mt-8 flex items-center justify-between border-t border-[#e8d9db] pt-6">

            <button
              type="button"
              onClick={previousStep}
              disabled={step === 0 || submitting}
              className="rounded-xl border border-[#e8d9db] px-5 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[#fff8f5] disabled:invisible"
            >
              ← Back
            </button>

            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={submitting}
                className="rounded-xl bg-[#e94f64] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                Continue →
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting || uploadingPhoto}
                className="rounded-xl bg-[#e94f64] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : uploadingPhoto
                  ? "Uploading photo..."
                  : "Submit Application 💘"}
              </button>
            )}
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-[#746f70]">
          By applying, you acknowledge that this is an extremely
          unserious recruitment process.
        </p>
      </div>

      <style jsx global>{`
        .input {
          margin-top: 0.5rem;
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e8d9db;
          background: #fff8f5;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          outline: none;
        }

        .input:focus,
        .textarea:focus {
          border-color: #e94f64;
        }

        .textarea {
          margin-top: 0.5rem;
          min-height: 110px;
          width: 100%;
          resize: vertical;
          border-radius: 0.75rem;
          border: 1px solid #e8d9db;
          background: #fff8f5;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          outline: none;
        }
      `}</style>
    </main>
  );
}

/* ----------------------------- */
/* Components                    */
/* ----------------------------- */

function StepContainer({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#171717] md:text-3xl">
        {title}
      </h2>

      <p className="mt-2 mb-7 text-sm text-[#746f70]">
        {subtitle}
      </p>

      {children}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#171717]">
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-1 text-xs font-medium text-[#e94f64]">
          {error}
        </p>
      )}
    </div>
  );
}

function Question({
  emoji,
  question,
  register,
}: {
  emoji: string;
  question: string;
  register: UseFormRegisterReturn;
}) {
  return (
    <div className="rounded-2xl bg-[#fff8f5] p-5">
      <p className="font-semibold text-[#171717]">
        {emoji} {question}
      </p>

      <textarea
        {...register}
        className="textarea"
        placeholder="Your answer..."
      />
    </div>
  );
}