import { compressFiles as compressImages, CompressedFile } from "@/services/fileCompressionService";

interface EmailData {
  recipients: string[];
  subject: string;
  message: string;
  files?: File[];
  replyTo?: string;
}

interface EmailResponse {
  success: boolean;
  message: string;
  error?: string;
}

/** Convert a Blob to a base64 data-URL */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const sendEmail = async (emailData: EmailData, compressionLevel: string): Promise<EmailResponse> => {
  try {
    const rawFiles = emailData.files || [];
    if (rawFiles.length === 0) {
      return { success: false, message: "No files to send", error: "No files provided" };
    }

    // Compress images on-device (videos/other files pass through as-is)
    const compressed: CompressedFile[] = await compressImages(rawFiles, compressionLevel);

    // Convert each file to a base64 attachment — NO zipping
    const attachments: Array<{ name: string; content: string; type: string }> = [];
    let totalBytes = 0;

    for (const file of compressed) {
      const base64 = await blobToBase64(file.blob);
      totalBytes += file.compressedSize;
      attachments.push({
        name: file.name,
        content: base64,
        type: file.blob.type || "application/octet-stream",
      });
    }

    console.log(
      `Sending ${attachments.length} individual files (${(totalBytes / 1024 / 1024).toFixed(2)} MB total)`
    );

    // Resend 40 MB attachment cap; base64 inflates ~33 %
    if (totalBytes > 25 * 1024 * 1024) {
      return {
        success: false,
        message: "Files are too large to email (max ~25 MB total). Use the download option instead.",
        error: "File too large for email delivery",
      };
    }

    const { supabase } = await import("@/integrations/supabase/client");

    const { data, error } = await supabase.functions.invoke("send-compressed-files", {
      body: {
        recipients: emailData.recipients,
        subject: emailData.subject,
        message: emailData.message,
        files: attachments,
        compressionLevel,
        replyTo: emailData.replyTo,
      },
    });

    if (error) {
      console.error("Edge function error:", error);
      return {
        success: false,
        message: "Failed to send email",
        error: error.message || JSON.stringify(error),
      };
    }

    if (!data || !data.success) {
      console.error("Email send failed:", data);
      return {
        success: false,
        message: data?.message || "Email service returned an error",
        error: data?.error || "Unknown error",
      };
    }

    console.log("Email sent successfully:", data);
    return data;
  } catch (error: any) {
    console.error("Email service error:", error);
    return {
      success: false,
      message: "Failed to send email",
      error: error.message,
    };
  }
};
