import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTestMode } from "@/hooks/useTestMode";
import Header from "@/components/Header";
import FileUploadZone from "@/components/FileUploadZone";
import CompressionSettings, { CompressionLevel } from "@/components/CompressionSettings";
import PricingSection from "@/components/PricingSection";
import TestModeBanner from "@/components/TestModeBanner";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Sparkles, Check, Loader2, Download, FileDown } from "lucide-react";
import { compressFiles, CompressedFile, downloadAllFiles } from "@/services/fileCompressionService";

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
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<CompressedFile[]>([]);
  const [compressionProgress, setCompressionProgress] = useState({ completed: 0, total: 0 });
  const { toast } = useToast();
  const { isTestMode, disableTestMode } = useTestMode();
  const steps = [
    { number: 1, title: "Upload Files", description: "Add your files to compress" },
    { number: 2, title: "Choose Compression", description: "Select compression level" },
    { number: 3, title: "Compress & Download", description: "Get your compressed files" }
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalSize = () => files.reduce((total, file) => total + file.size, 0);

  const getCompressionReduction = () => {
    const reductions = { basic: 0.4, medium: 0.6, max: 0.78 };
    return reductions[compressionLevel];
  };

  const getEstimatedSize = () => getTotalSize() * (1 - getCompressionReduction());

  const handleNextStep = () => {
    if (currentStep === 1 && files.length === 0) {
      toast({ title: "No files selected", description: "Please add some files to continue.", variant: "destructive" });
      return;
    }
    if (currentStep === 2) {
      handleCompressAndDownload();
      return;
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setDownloadComplete(false);
      setCompressedFiles([]);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompressAndDownload = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setCurrentStep(3);
    setCompressionProgress({ completed: 0, total: files.length });
    try {
      const results = await compressFiles(
        files.map((f) => f.file),
        compressionLevel,
        (completed, total) => setCompressionProgress({ completed, total })
      );
      setCompressedFiles(results);
      setIsProcessing(false);
      setDownloadComplete(true);

      const totalOriginal = results.reduce((s, f) => s + f.originalSize, 0);
      const totalCompressed = results.reduce((s, f) => s + f.compressedSize, 0);
      const savedPct = totalOriginal > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0;

      toast({
        title: "Compression complete!",
        description: `${results.length} file(s) ready. Saved ${savedPct}% on images.`,
      });
    } catch (error) {
      console.error("Compression error:", error);
      setIsProcessing(false);
      toast({ title: "Error compressing files", description: "There was a problem compressing your files. Please try again.", variant: "destructive" });
    }
  };

  const handleDownloadAll = async () => {
    if (compressedFiles.length === 0) return;
    await downloadAllFiles(compressedFiles);
  };

  const handleDownloadSingle = (file: CompressedFile) => {
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalOriginal = compressedFiles.reduce((s, f) => s + f.originalSize, 0);
  const totalCompressed = compressedFiles.reduce((s, f) => s + f.compressedSize, 0);
  const savedPct = totalOriginal > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0;
  const progressPct = compressionProgress.total > 0 ? Math.round((compressionProgress.completed / compressionProgress.total) * 100) : 0;

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
            Compress your files and download them instantly — then share however you like.
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
                    {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
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
              <CompressionSettings selectedLevel={compressionLevel} onLevelChange={setCompressionLevel} />
              {files.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm max-w-4xl mx-auto">
                  <h4 className="font-semibold text-foreground mb-4">Compression Preview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">{formatFileSize(getTotalSize())}</p>
                      <p className="text-sm text-muted-foreground">Original Size</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-electric-600">{formatFileSize(getEstimatedSize())}</p>
                      <p className="text-sm text-muted-foreground">Estimated Compressed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{Math.round(getCompressionReduction() * 100)}%</p>
                      <p className="text-sm text-muted-foreground">Estimated Reduction</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="w-full max-w-4xl mx-auto space-y-6">
              {/* Processing State */}
              {isProcessing && (
                <div className="bg-card rounded-xl border border-border p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-electric-500" />
                    <h3 className="text-xl font-semibold text-foreground">Compressing your files…</h3>
                  </div>
                  <Progress value={progressPct} className="h-3" />
                  <p className="text-center text-muted-foreground">
                    {compressionProgress.completed} of {compressionProgress.total} files processed ({progressPct}%)
                  </p>
                </div>
              )}

              {/* Results */}
              {downloadComplete && (
                <>
                  {/* Summary Card */}
                  <div className="bg-card rounded-xl border border-border p-8 shadow-sm text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Compression Complete!</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                      <div>
                        <p className="text-lg font-bold text-slate-600 dark:text-slate-400">{formatFileSize(totalOriginal)}</p>
                        <p className="text-xs text-muted-foreground">Original</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-electric-600">{formatFileSize(totalCompressed)}</p>
                        <p className="text-xs text-muted-foreground">Compressed</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600">{savedPct}%</p>
                        <p className="text-xs text-muted-foreground">Saved</p>
                      </div>
                    </div>
                    <Button onClick={handleDownloadAll} className="bg-electric-500 hover:bg-electric-600 text-white gap-2 mt-2">
                      <Download className="w-4 h-4" />
                      Download All Files
                    </Button>
                  </div>

                  {/* Individual File List */}
                  <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border">
                    {compressedFiles.map((file, idx) => {
                      const fileSaved = file.originalSize > 0 ? Math.round((1 - file.compressedSize / file.originalSize) * 100) : 0;
                      const isImage = /\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(file.name);
                      return (
                        <div key={idx} className="flex items-center justify-between px-5 py-4">
                          <div className="flex-1 min-w-0 mr-4">
                            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.originalSize)} → {formatFileSize(file.compressedSize)}
                              {isImage ? ` (−${fileSaved}%)` : ' (unchanged)'}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleDownloadSingle(file)} className="gap-1.5 shrink-0">
                            <FileDown className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-center text-sm text-muted-foreground">
                    Download your files and share them via email, messaging, or any app you prefer.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-4 mt-12">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePreviousStep} className="px-8">
              Previous
            </Button>
          )}
          {currentStep === 1 && (
            <Button onClick={handleNextStep} className="bg-electric-500 hover:bg-electric-600 text-white px-8">
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {currentStep === 2 && (
            <Button onClick={handleNextStep} className="bg-electric-500 hover:bg-electric-600 text-white px-8">
              Compress & Download
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </main>

      <PricingSection />
      <Footer />
      {isTestMode && <TestModeBanner onDisable={disableTestMode} />}
    </div>
  );
};

export default Index;
