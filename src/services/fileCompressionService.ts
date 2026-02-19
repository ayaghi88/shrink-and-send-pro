import imageCompression from "browser-image-compression";

export interface CompressedFile {
  name: string;
  blob: Blob;
  originalSize: number;
  compressedSize: number;
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/gif"];

const qualitySettings: Record<string, number> = {
  basic: 0.5,
  medium: 0.3,
  max: 0.15,
};

const maxWidthSettings: Record<string, number> = {
  basic: 2560,
  medium: 1920,
  max: 1280,
};

/** Compress a single image using canvas-based re-encoding */
async function compressImage(file: File, compressionLevel: string): Promise<CompressedFile> {
  const quality = qualitySettings[compressionLevel] ?? 0.5;
  const maxWidthOrHeight = maxWidthSettings[compressionLevel] ?? 2560;

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: compressionLevel === "max" ? 0.5 : compressionLevel === "medium" ? 1 : 3,
      maxWidthOrHeight,
      useWebWorker: true,
      fileType: file.type as any,
      initialQuality: quality,
    });

    return {
      name: file.name,
      blob: compressed,
      originalSize: file.size,
      compressedSize: compressed.size,
    };
  } catch (err) {
    console.warn(`Image compression failed for ${file.name}, using original`, err);
    return {
      name: file.name,
      blob: file,
      originalSize: file.size,
      compressedSize: file.size,
    };
  }
}

/** Compress all files — images get re-encoded, others pass through as-is */
export async function compressFiles(
  files: File[],
  compressionLevel: string,
  onProgress?: (completed: number, total: number) => void
): Promise<CompressedFile[]> {
  const results: CompressedFile[] = [];
  let completed = 0;

  for (const file of files) {
    if (IMAGE_TYPES.includes(file.type)) {
      const result = await compressImage(file, compressionLevel);
      results.push(result);
    } else {
      // Non-image files pass through unchanged
      results.push({
        name: file.name,
        blob: file,
        originalSize: file.size,
        compressedSize: file.size,
      });
    }
    completed++;
    onProgress?.(completed, files.length);
  }

  return results;
}

/** Trigger browser download for a single blob */
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Download all compressed files individually with a small delay between each */
export async function downloadAllFiles(files: CompressedFile[]) {
  for (let i = 0; i < files.length; i++) {
    downloadFile(files[i].blob, files[i].name);
    // Small delay between downloads so browser doesn't block them
    if (i < files.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}
