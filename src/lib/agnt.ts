import { createClient } from "@supabase/supabase-js";

// AGNT earning rewards constants
export const AGNT_REWARDS = {
  PLAY_100: 10,           // Every 100 plays on a track
  LIKE: 1,                // Per like received
  FEATURED: 50,           // Track featured on homepage
  FOUNDING_CREATOR: 500,  // Founding Creator signup bonus
  REFERRAL: 25,           // Referring another creator
};

// Get service role client for AGNT operations
function getSupabaseServiceClient() {
  return createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

/**
 * Award AGNT tokens to a user
 * @param userId - User ID (can be null for pre-auth applications, use email in reason)
 * @param amount - Amount of AGNT to award
 * @param reason - Reason for award (e.g., "FOUNDING_CREATOR_SIGNUP", "PLAY_100", etc.)
 * @returns New AGNT balance, or null if error
 */
export async function awardAGNT(
  userId: string | null,
  amount: number,
  reason: string
): Promise<number | null> {
  try {
    const supabase = getSupabaseServiceClient();

    // Insert transaction record
    const { error: txError } = await supabase
      .from("agnt_transactions")
      .insert({
        user_id: userId,
        amount,
        reason,
        created_at: new Date().toISOString(),
      });

    if (txError) {
      console.error("[AGNT] Error inserting transaction:", txError);
      return null;
    }

    // If user_id is provided, update balance in profiles
    if (userId) {
      const { data, error: updateError } = await supabase.rpc(
        "increment_agnt_balance",
        {
          user_id: userId,
          amount,
        }
      );

      if (updateError) {
        console.error("[AGNT] Error updating balance:", updateError);
        return null;
      }

      return data as number;
    }

    // No user_id means this is pre-auth (from email), balance tracked in transaction
    return amount;
  } catch (error) {
    console.error("[AGNT] Error awarding AGNT:", error);
    return null;
  }
}

/**
 * Get AGNT balance for a user
 * @param userId - User ID
 * @returns Current AGNT balance
 */
export async function getAGNTBalance(userId: string): Promise<number> {
  try {
    const supabase = getSupabaseServiceClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("agnt_balance")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("[AGNT] Error fetching balance:", error);
      return 0;
    }

    return data?.agnt_balance || 0;
  } catch (error) {
    console.error("[AGNT] Error getting balance:", error);
    return 0;
  }
}

/**
 * Get AGNT transaction history for a user
 * @param userId - User ID
 * @param limit - Max transactions to return (default 50)
 * @returns Array of transactions
 */
export async function getAGNTTransactionHistory(
  userId: string,
  limit: number = 50
): Promise<Array<{ id: string; amount: number; reason: string; created_at: string }>> {
  try {
    const supabase = getSupabaseServiceClient();

    const { data, error } = await supabase
      .from("agnt_transactions")
      .select("id, amount, reason, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[AGNT] Error fetching transaction history:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[AGNT] Error getting transaction history:", error);
    return [];
  }
}
