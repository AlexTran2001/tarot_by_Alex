import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function checkVIPStatus(userId: string): Promise<boolean> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data, error } = await supabaseAdmin
      .from("vip_users")
      .select("is_vip, vip_expires_at")
      .eq("user_id", userId)
      .single();

    if (error) {
      // Log the error but don't fail if it's just "no rows returned"
      if (error.code === "PGRST116") {
        console.log("No VIP record found for user:", userId);
      } else {
        console.error("Error checking VIP status:", error);
      }
      return false;
    }

    if (!data) {
      console.log("No VIP data found for user:", userId);
      return false;
    }

    // Check if VIP is active and not expired
    if (!data.is_vip) {
      console.log("User VIP status is false for user:", userId);
      return false;
    }

    // If no expiration date, VIP is permanent
    if (!data.vip_expires_at) {
      console.log("User has permanent VIP status:", userId);
      return true;
    }

    // Check if VIP has expired (compare dates properly)
    const expiresAt = new Date(data.vip_expires_at);
    const now = new Date();
    const isValid = expiresAt > now;
    
    if (!isValid) {
      console.log("User VIP has expired:", userId, {
        expiresAt: expiresAt.toISOString(),
        now: now.toISOString(),
      });
    }
    
    return isValid;
  } catch (error) {
    console.error("Error checking VIP status:", error);
    return false;
  }
}

export async function setVIPStatus(
  userId: string,
  isVip: boolean,
  expiresAt?: string
): Promise<boolean> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const updateData: any = {
      user_id: userId,
      is_vip: isVip,
      updated_at: new Date().toISOString(),
    };
    
    // Only set expiresAt if provided, otherwise set to null for permanent VIP
    if (expiresAt) {
      updateData.vip_expires_at = expiresAt;
    } else {
      updateData.vip_expires_at = null;
    }
    
    const { data, error } = await supabaseAdmin
      .from("vip_users")
      .upsert(updateData, {
        onConflict: "user_id",
      })
      .select()
      .single();

    if (error) {
      console.error("Error setting VIP status:", error);
      return false;
    }

    console.log("VIP status updated successfully:", {
      userId,
      isVip,
      expiresAt,
      data,
    });

    return true;
  } catch (error) {
    console.error("Error setting VIP status:", error);
    return false;
  }
}

