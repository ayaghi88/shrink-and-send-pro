
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

export const sendEmail = async (emailData: EmailData, compressionLevel: string): Promise<EmailResponse> => {
  try {
    console.log("Sending email via Edge Function:", emailData);
    
    // Convert files to base64
    const filesWithContent = await Promise.all(
      (emailData.files || []).map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          name: file.name,
          content: base64,
          type: file.type,
        };
      })
    );

    const { supabase } = await import("@/integrations/supabase/client");
    
    const { data, error } = await supabase.functions.invoke('send-compressed-files', {
      body: {
        recipients: emailData.recipients,
        subject: emailData.subject,
        message: emailData.message,
        files: filesWithContent,
        compressionLevel: compressionLevel,
        replyTo: emailData.replyTo,
      },
    });

    if (error) {
      console.error("Edge function error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
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

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Compression is now handled on the backend via the Edge Function
export const compressFiles = async (files: any[], compressionLevel: string) => {
  console.log("Files will be compressed during email sending:", files.length, "files");
  
  // Return file info for UI display
  return {
    compressedFiles: files,
    originalSize: files.reduce((total, file) => total + file.size, 0),
    compressedSize: files.reduce((total, file) => total + file.size, 0) * 0.4
  };
};
