"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rateLimit";

export async function submitFeedback(category: string, rating: string, review: string, region?: string, sector?: string) {
  let sentiment = "neutral";
  if (rating === "very-good" || rating === "excellent") sentiment = "positive";
  else if (rating === "needs-improvement" || ["bad", "very-bad"].includes(rating)) sentiment = "negative";

  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : 'localhost';

  // Limit: 50 feedback submissions per 120 minutes per IP (Sensible for testing/NAT)
  const { allowed } = await checkRateLimit(ip, 'submit_feedback', 50, 120);
  
  if (!allowed) {
    throw new Error("ለጊዜው አስተያየት መስጠት አይችሉም፣ እባክዎ ከ2 ሰዓት በኋላ እንደገና ይሞክሩ።");
  }

  const { error } = await supabaseAdmin.from("feedbacks").insert({
    category,
    rating,
    review,
    sentiment,
    region,
    sector,
  });

  if (error) {
    console.error("Error submitting feedback:", error);
    throw new Error("Failed to submit feedback");
  }

  revalidatePath("/dashboard/feedback");
}

export async function getFeedbacks() {
  const { data, error } = await supabaseAdmin
    .from("feedbacks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching feedbacks:", error);
    throw new Error("Failed to fetch feedbacks");
  }

  return data;
}
