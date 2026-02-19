import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendEmailRequest {
  recipients: string[];
  subject: string;
  message: string;
  files: Array<{
    name: string;
    content: string;
    type: string;
  }>;
  compressionLevel: string;
  replyTo?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validCompressionLevels = ["basic", "medium", "max"];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipients, subject, message, files, compressionLevel, replyTo }: SendEmailRequest = await req.json();

    // --- Input validation ---
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "At least one recipient is required" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (recipients.length > 10) {
      return new Response(JSON.stringify({ success: false, error: "Maximum 10 recipients allowed" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    for (const email of recipients) {
      if (typeof email !== "string" || !emailRegex.test(email) || email.length > 255) {
        return new Response(JSON.stringify({ success: false, error: `Invalid recipient email: ${email}` }), {
          status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }
    if (replyTo && (typeof replyTo !== "string" || !emailRegex.test(replyTo) || replyTo.length > 255)) {
      return new Response(JSON.stringify({ success: false, error: "Invalid reply-to email" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (!subject || typeof subject !== "string" || subject.length > 200) {
      return new Response(JSON.stringify({ success: false, error: "Subject is required (max 200 chars)" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (message && typeof message === "string" && message.length > 5000) {
      return new Response(JSON.stringify({ success: false, error: "Message too long (max 5000 chars)" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (!files || !Array.isArray(files) || files.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "At least one file is required" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (files.length > 50) {
      return new Response(JSON.stringify({ success: false, error: "Maximum 50 files allowed" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (compressionLevel && !validCompressionLevels.includes(compressionLevel)) {
      return new Response(JSON.stringify({ success: false, error: "Invalid compression level" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Sanitize message for HTML injection
    const sanitizedMessage = (message || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    console.log(`Processing ${files.length} files with ${compressionLevel} compression`);
    console.log(`Sending to: ${recipients.join(', ')}${replyTo ? ` | reply-to: ${replyTo}` : ''}`);

    // Convert base64 files to attachments format for Resend
    const attachments = files.map(file => ({
      filename: file.name,
      content: file.content.split(',')[1],
    }));

    // Calculate sizes for logging
    const totalSize = files.reduce((sum, file) => {
      const base64Length = file.content.split(',')[1]?.length || 0;
      return sum + (base64Length * 0.75);
    }, 0);

    console.log(`Total file size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    // Send email with attachments
    const emailResponse = await resend.emails.send({
      from: "Shrink & Send <customer.service@shrinkandsend.com>",
      to: recipients,
      subject: subject,
      reply_to: replyTo || "customer.service@shrinkandsend.com",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Files Delivered</h2>
          <p style="color: #666; line-height: 1.6;">${sanitizedMessage}</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
            <p style="margin: 0; color: #666;">
              <strong>${files.length}</strong> file(s) attached
              <br />
              Compression level: <strong>${compressionLevel}</strong>
            </p>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Sent via professional file delivery service
          </p>
        </div>
      `,
      attachments: attachments,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sent successfully to ${recipients.length} recipient(s)`,
        emailId: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-compressed-files function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Failed to send email"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
