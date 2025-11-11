import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  recipients: string[];
  subject: string;
  message: string;
  files: Array<{
    name: string;
    content: string; // base64 encoded
    type: string;
  }>;
  compressionLevel: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipients, subject, message, files, compressionLevel }: SendEmailRequest = await req.json();

    console.log(`Processing ${files.length} files with ${compressionLevel} compression`);
    console.log(`Sending to: ${recipients.join(', ')}`);

    // Convert base64 files to attachments format for Resend
    const attachments = files.map(file => ({
      filename: file.name,
      content: file.content.split(',')[1], // Remove data:type/subtype;base64, prefix
    }));

    // Calculate sizes for logging
    const totalSize = files.reduce((sum, file) => {
      const base64Length = file.content.split(',')[1]?.length || 0;
      return sum + (base64Length * 0.75); // Approximate original size
    }, 0);

    console.log(`Total file size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    // Send email with attachments
    const emailResponse = await resend.emails.send({
      from: "File Delivery <hello@amberyaghi.org>",
      to: recipients,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Files Delivered</h2>
          <p style="color: #666; line-height: 1.6;">${message}</p>
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
        error: error.message || "Failed to send email"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
