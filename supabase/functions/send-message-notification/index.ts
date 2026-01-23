import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationPayload {
  sender_id: string;
  receiver_id: string;
  car_id: string;
  message: string;
  car_title?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json();
    const { sender_id, receiver_id, car_id, message, car_title } = payload;

    const { data: senderProfile } = await supabase
      .from("user_profiles")
      .select("is_premium, nickname, avatar_url")
      .eq("id", sender_id)
      .maybeSingle();

    if (!senderProfile?.is_premium) {
      return new Response(
        JSON.stringify({ success: false, message: "Sender is not premium" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: receiverAuth } = await supabase.auth.admin.getUserById(receiver_id);

    if (!receiverAuth?.user?.email) {
      return new Response(
        JSON.stringify({ success: false, message: "Receiver email not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const emailContent = {
      to: receiverAuth.user.email,
      subject: `Nova poruka od Premium korisnika ${senderProfile.nickname || 'Car Swap'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🚗 Car Swap</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Nova poruka od Premium korisnika!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Korisnik <strong>${senderProfile.nickname || 'Car Swap korisnik'}</strong> vam je poslao/la poruku ${car_title ? `vezanu za automobil: <strong>${car_title}</strong>` : ''}:
            </p>
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px;">
              <p style="color: #333; margin: 0; font-style: italic;">"${message.substring(0, 200)}${message.length > 200 ? '...' : ''}"</p>
            </div>
            <a href="${supabaseUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">
              Odgovori sada
            </a>
            <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              Ova notifikacija je poslana jer je Premium korisnik poslao upit o vašem oglasu. Obični korisnici ne šalju email notifikacije.
            </p>
          </div>
        </div>
      `,
    };

    console.log(`Email notification prepared for ${receiverAuth.user.email}`);
    console.log(`From: ${senderProfile.nickname} (Premium)`);
    console.log(`Message: ${message.substring(0, 100)}...`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email notification prepared",
        email_data: emailContent
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
