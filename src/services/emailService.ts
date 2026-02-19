import JSZip from "jszip";

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

const compressionOptions: Record<string, "STORE" | "DEFLATE"> = {
  basic: "DEFLATE",
  medium: "DEFLATE",
  max: "DEFLATE",
};

const compressionLevels: Record<string, number> = {
  basic: 3,
  medium: 6,
  max: 9,
};

/** Zip all files on-device and return a single base64-encoded .zip */
export const compressFilesToZip = async (
  files: File[],
  compressionLevel: string
): Promise<{ base64: string; blob: Blob; originalSize: number; compressedSize: number }> => {
  const zip = new JSZip();

  let originalSize = 0;
  for (const file of files) {
    zip.file(file.name, file);
    originalSize += file.size;
  }

  const level = compressionLevels[compressionLevel] ?? 6;

  const blob = await zip.generateAsync({
    type: "blob",
    compression: compressionOptions[compressionLevel] ?? "DEFLATE",
    compressionOptions: { level },
  });

  const base64 = await blobToBase64(blob);

  return { base64, blob, originalSize, compressedSize: blob.size };
};

export const sendEmail = async (emailData: EmailData, compressionLevel: string): Promise<EmailResponse> => {
  try {
    const files = emailData.files || [];

    // Compress all files into a single zip on-device
    const { base64, originalSize, compressedSize } = await compressFilesToZip(files, compressionLevel);
    console.log(
      `Compressed ${files.length} files: ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(compressedSize / 1024 / 1024).toFixed(2)} MB`
    );

    const { supabase } = await import("@/integrations/supabase/client");

    const { data, error } = await supabase.functions.invoke("send-compressed-files", {
      body: {
        recipients: emailData.recipients,
        subject: emailData.subject,
        message: emailData.message,
        // Send a single zip attachment instead of individual files
        files: [
          {
            name: "attachments.zip",
            content: base64,
            type: "application/zip",
          },
        ],
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

// Helper: Blob → base64 data-URL
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/** Get real compressed size preview (quick estimate via JSZip) */
export const compressFiles = async (files: { file: File; size: number }[], compressionLevel: string) => {
  const fileObjects = files.map((f) => f.file);
  const { originalSize, compressedSize } = await compressFilesToZip(fileObjects, compressionLevel);
  return { compressedFiles: files, originalSize, compressedSize };
};
