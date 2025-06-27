
import { useState } from "react";
import { Settings, Zap, Shield, Maximize } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type CompressionLevel = 'basic' | 'medium' | 'max';

interface CompressionSettingsProps {
  selectedLevel: CompressionLevel;
  onLevelChange: (level: CompressionLevel) => void;
}

const CompressionSettings = ({ selectedLevel, onLevelChange }: CompressionSettingsProps) => {
  const compressionOptions = [
    {
      id: 'basic' as CompressionLevel,
      name: 'Basic',
      icon: Zap,
      description: 'Quick compression for everyday use',
      reduction: '30-50%',
      speed: 'Fastest',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      id: 'medium' as CompressionLevel,
      name: 'Medium',
      icon: Settings,
      description: 'Balanced compression and quality',
      reduction: '50-70%',
      speed: 'Moderate',
      color: 'text-electric-600 dark:text-electric-400',
      bgColor: 'bg-electric-50 dark:bg-electric-950/20',
      borderColor: 'border-electric-200 dark:border-electric-800'
    },
    {
      id: 'max' as CompressionLevel,
      name: 'Maximum',
      icon: Maximize,
      description: 'Highest compression for large files',
      reduction: '70-85%',
      speed: 'Slower',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="w-5 h-5 text-electric-600" />
        <h3 className="text-lg font-semibold text-foreground">Choose Compression Level</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {compressionOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedLevel === option.id;
          
          return (
            <Card
              key={option.id}
              className={`
                relative cursor-pointer transition-all duration-300 p-6 hover:shadow-md
                ${isSelected 
                  ? `${option.bgColor} ${option.borderColor} border-2 shadow-lg scale-[1.02]` 
                  : 'border border-border hover:border-electric-300 dark:hover:border-electric-700'
                }
              `}
              onClick={() => onLevelChange(option.id)}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-electric-500 text-white">Selected</Badge>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg ${option.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${option.color}`} />
                  </div>
                  <h4 className="font-semibold text-foreground">{option.name}</h4>
                </div>
                
                <p className="text-sm text-muted-foreground">{option.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Size Reduction:</span>
                    <span className={`font-medium ${option.color}`}>{option.reduction}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Speed:</span>
                    <span className="font-medium text-foreground">{option.speed}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CompressionSettings;
