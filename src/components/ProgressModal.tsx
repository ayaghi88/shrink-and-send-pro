
import { useEffect, useState } from "react";
import { CheckCircle, Loader2, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const ProgressModal = ({ isOpen, onClose, onComplete }: ProgressModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    { name: "Analyzing files", duration: 1000 },
    { name: "Compressing files", duration: 2500 },
    { name: "Creating bundle", duration: 1500 },
    { name: "Sending email", duration: 1000 },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(0);
      setIsComplete(false);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    const runStep = (stepIndex: number) => {
      if (stepIndex >= steps.length) {
        setIsComplete(true);
        setTimeout(() => {
          onComplete();
        }, 1500);
        return;
      }

      setCurrentStep(stepIndex);
      const stepDuration = steps[stepIndex].duration;
      const progressStart = (stepIndex / steps.length) * 100;
      const progressEnd = ((stepIndex + 1) / steps.length) * 100;
      
      let stepProgress = 0;
      intervalId = setInterval(() => {
        stepProgress += 2;
        const currentProgress = progressStart + (stepProgress / 100) * (progressEnd - progressStart);
        setProgress(Math.min(currentProgress, progressEnd));
        
        if (stepProgress >= 100) {
          clearInterval(intervalId);
          timeoutId = setTimeout(() => runStep(stepIndex + 1), 200);
        }
      }, stepDuration / 50);
    };

    runStep(0);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, onComplete]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isComplete ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin text-electric-500" />
            )}
            <span>
              {isComplete ? "Files Sent Successfully!" : "Processing Your Files"}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {!isComplete ? (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {steps[currentStep]?.name}
                  </span>
                  <span className="text-electric-600 font-medium">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div
                    key={step.name}
                    className={`flex items-center space-x-2 text-sm ${
                      index < currentStep
                        ? 'text-green-600'
                        : index === currentStep
                        ? 'text-electric-600'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : index === currentStep ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    <span>{step.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-950/20 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-green-600 font-medium">
                  Your compressed files have been sent successfully!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Recipients will receive the files in their email shortly.
                </p>
              </div>
              <Button onClick={onClose} className="w-full">
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressModal;
