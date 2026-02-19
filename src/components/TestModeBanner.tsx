import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, FlaskConical } from "lucide-react";

interface TestModeBannerProps {
  onDisable: () => void;
}

const TestModeBanner = ({ onDisable }: TestModeBannerProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 rounded-full px-4 py-2 shadow-lg">
      <FlaskConical className="w-4 h-4 text-amber-700 dark:text-amber-300" />
      <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
        Test Mode
      </span>
      <Badge variant="secondary" className="bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-xs">
        Premium
      </Badge>
      <Button
        variant="ghost"
        size="icon"
        className="w-6 h-6 text-amber-700 dark:text-amber-300 hover:text-amber-900"
        onClick={onDisable}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
};

export default TestModeBanner;
