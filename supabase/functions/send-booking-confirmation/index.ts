import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingEmailRequest {
  userEmail: string;
  movieTitle: string;
  showTime: string;
  seats: number;
  totalAmount: number;
  theaterName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not found, skipping email notification');
      return new Response(JSON.stringify({ message: 'Email service not configured' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resend = new Resend(resendApiKey);
    const { userEmail, movieTitle, showTime, seats, totalAmount, theaterName }: BookingEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "BookMyShow <bookings@resend.dev>",
      to: [userEmail],
      subject: `Booking Confirmed: ${movieTitle}`,
      html: `
        <h1>Booking Confirmed!</h1>
        <p>Dear Customer,</p>
        <p>Your booking has been confirmed for:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>${movieTitle}</h2>
          <p><strong>Theater:</strong> ${theaterName}</p>
          <p><strong>Show Time:</strong> ${showTime}</p>
          <p><strong>Number of Seats:</strong> ${seats}</p>
          <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
        </div>
        
        <p>Please arrive at the theater at least 15 minutes before the show time.</p>
        <p>Thank you for choosing BookMyShow!</p>
        
        <p>Best regards,<br>The BookMyShow Team</p>
      `,
    });

    console.log("Booking confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);