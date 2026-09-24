import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AuthRedirectPage() {
  const { userId, sessionClaims } = await auth();

  // Not logged in
  if (!userId) {
    redirect("/sign-in");
  }

  // Check if this Clerk account already has an application
  const candidate = await prisma.candidate.findUnique({
    where: {
      clerkUserId: userId,
    },
    select: {
      id: true,
    },
  });

  // Existing applicant → their profile
  if (candidate) {
    redirect(`/candidate/${candidate.id}`);
  }

  // Admin → admin dashboard
  const role = sessionClaims?.metadata?.role;

  if (role === "ADMIN") {
    redirect("/admin");
  }

  // New user → normal dashboard/home
  redirect("/");
}