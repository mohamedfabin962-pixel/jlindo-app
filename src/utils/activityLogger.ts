import { supabase } from "@/integrations/supabase/client";

export interface ActivityLogPayload {
  actorName: string;
  targetId?: string;
  targetName?: string;
  jobId?: string;
  jobTitle?: string;
  details: string;
}

export async function createActivityLog({
  type,
  actorId,
  actorName,
  targetId,
  targetName,
  jobId,
  jobTitle,
  details
}: {
  type: string;
  actorId: string;
  actorName: string;
  targetId?: string;
  targetName?: string;
  jobId?: string;
  jobTitle?: string;
  details: string;
}) {
  try {
    const { error } = await supabase.from("feedback").insert({
      user_id: actorId,
      type,
      message: JSON.stringify({
        actorName,
        targetId,
        targetName,
        jobId,
        jobTitle,
        details
      })
    });
    if (error) console.error("Error creating activity log in database:", error.message);
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
}
