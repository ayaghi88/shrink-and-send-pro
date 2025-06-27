
import { useState, useRef } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface FileUploadZoneProps {
  files: FileItem[];
  onFilesChange: (files: FileItem[]) => void;
}

const FileUploadZone = ({ files, onFilesChange }: FileUploadZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const fileItems: FileItem[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    
    onFilesChange([...files, ...fileItems]);
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter(file => file.id !== id));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer
          ${isDragOver 
            ? 'border-electric-500 bg-electric-50 dark:bg-electric-950/20 scale-[1.02]' 
            : 'border-slate-300 dark:border-slate-600 hover:border-electric-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-electric-500 to-electric-600 flex items-center justify-center transition-transform duration-300 ${isDragOver ? 'animate-bounce-gentle' : ''}`}>
            <Upload className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {isDragOver ? 'Drop your files here!' : 'Drag & drop your files'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Or click to browse your computer
            </p>
            <Button variant="outline" className="bg-background">
              Choose Files
            </Button>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h4 className="font-semibold text-foreground mb-4 flex items-center">
            <File className="w-4 h-4 mr-2" />
            Selected Files ({files.length})
          </h4>
          
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 bg-electric-100 dark:bg-electric-900 rounded-lg flex items-center justify-center">
                    <File className="w-4 h-4 text-electric-600 dark:text-electric-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {file.type.split('/')[0] || 'file'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="w-8 h-8 text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
