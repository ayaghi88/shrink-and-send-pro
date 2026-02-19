import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTestMode } from "@/hooks/useTestMode";
import Header from "@/components/Header";
import FileUploadZone from "@/components/FileUploadZone";
import CompressionSettings, { CompressionLevel } from "@/components/CompressionSettings";
import EmailComposer from "@/components/EmailComposer";
import ProgressModal from "@/components/ProgressModal";
import PricingSection from "@/components/PricingSection";
import TestModeBanner from "@/components/TestModeBanner";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { sendEmail, compressFiles, compressFilesToZip } from "@/services/emailService";

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

const Index = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { isTestMode, disableTestMode } = useTestMode();
  const steps = [
    { number: 1, title: "Upload Files", description: "Add your files to compress" },
    { number: 2, title: "Choose Compression", description: "Select compression level" },
    { number: 3, title: "Email Delivery", description: "Send to recipients" }
  ];

  const getTotalSize = () => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompressionReduction = () => {
    const reductions = {
      basic: 0.4,
      medium: 0.6,
      max: 0.78
    };
    return reductions[compressionLevel];
  };

  const getEstimatedSize = () => {
    const totalSize = getTotalSize();
    const reduction = getCompressionReduction();
    return totalSize * (1 - reduction);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please add some files to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const MAX_TOTAL_SIZE = isTestMode ? 2 * 1024 * 1024 * 1024 : 20 * 1024 * 1024; // 2GB in test mode, 20MB otherwise

  const totalSizeExceeded = getTotalSize() > MAX_TOTAL_SIZE;

  const handleDownload = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const { blob } = await compressFilesToZip(
        files.map((f) => f.file),
        compressionLevel
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed-files.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      handleProcessingComplete();
    } catch (error) {
      console.error("Download error:", error);
      setIsProcessing(false);
      toast({
        title: "Error compressing files",
        description: "There was a problem compressing your files. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async (emailData: {
    recipients: string[];
    subject: string;
    message: string;
    replyTo?: string;
  }) => {
    if (totalSizeExceeded) {
      toast({
        title: "Files too large",
        description: `Total attachment size exceeds ${isTestMode ? "2 GB" : "20 MB"}. Please remove some files or use smaller ones.`,
        variant: "destructive",
      });
      return;
    }
    console.log("Sending email with data:", emailData);
    console.log("Files to compress:", files);
    console.log("Compression level:", compressionLevel);
    
    setIsProcessing(true);
    
    try {
      // Send the email with files
      const emailResult = await sendEmail({
        ...emailData,
        files: files.map(f => f.file) as any
      }, compressionLevel);
      
      if (emailResult.success) {
        console.log("Email sent successfully:", emailResult.message);
        handleProcessingComplete();
      } else {
        throw new Error(emailResult.error || "Failed to send email");
      }
      
    } catch (error) {
      console.error("Error in email process:", error);
      setIsProcessing(false);
      toast({
        title: "Error sending email",
        description: (error as any)?.message || "There was a problem sending your files. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    setFiles([]);
    setCurrentStep(1);
    
    toast({
      title: "Files sent successfully!",
      description: "Your compressed files have been delivered.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-electric-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-electric-100 dark:bg-electric-950/20 text-electric-700 dark:text-electric-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Big Files. One Click. No Stress.</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Professional delivery<br />
            <span className="bg-gradient-to-r from-electric-600 to-electric-500 bg-clip-text text-transparent">
              made simple
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Send portfolios, pitches, or proof — without ever shrinking your standards.
            Compress multiple files and deliver them via secure email.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      currentStep >= step.number
                        ? 'bg-electric-500 text-white shadow-lg'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {step.number}
                  </div>
                  <div className="hidden md:block">
                    <p className={`font-medium ${currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-muted-foreground mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-8">
          {currentStep === 1 && (
            <FileUploadZone files={files} onFilesChange={setFiles} />
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <CompressionSettings
                selectedLevel={compressionLevel}
                onLevelChange={setCompressionLevel}
              />
              
              {files.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm max-w-4xl mx-auto">
                  <h4 className="font-semibold text-foreground mb-4">Compression Preview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                        {formatFileSize(getTotalSize())}
                      </p>
                      <p className="text-sm text-muted-foreground">Original Size</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-electric-600">
                        {formatFileSize(getEstimatedSize())}
                      </p>
                      <p className="text-sm text-muted-foreground">Compressed Size</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round(getCompressionReduction() * 100)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Size Reduction</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <EmailComposer onSend={handleSendEmail} />
              
              <div className="w-full max-w-4xl mx-auto">
                <div className="relative flex items-center justify-center my-6">
                  <div className="border-t border-border w-full" />
                  <span className="bg-background px-4 text-sm text-muted-foreground absolute">or</span>
                </div>
                
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full py-6 text-base"
                  disabled={files.length === 0}
                >
                  <ArrowRight className="w-5 h-5 mr-2 rotate-90" />
                  Download Compressed ZIP
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-4 mt-12">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              className="px-8"
            >
              Previous
            </Button>
          )}
          
          {currentStep < 3 && (
            <Button
              onClick={handleNextStep}
              className="bg-electric-500 hover:bg-electric-600 text-white px-8"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Size warning */}
        {files.length > 0 && totalSizeExceeded && (
          <div className="flex justify-center mt-4">
            <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-5 py-3 text-sm max-w-xl text-center">
              ⚠️ Total attachment size ({formatFileSize(getTotalSize())}) exceeds the 20 MB limit. Please remove some files before sending.
            </div>
          </div>
        )}
      </main>

      {/* Pricing Section */}
      <PricingSection />

      <ProgressModal
        isOpen={isProcessing}
        onClose={() => setIsProcessing(false)}
        onComplete={handleProcessingComplete}
      />

      {isTestMode && <TestModeBanner onDisable={disableTestMode} />}
    </div>
  );
};

export default Index;
