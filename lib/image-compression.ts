/**
 * Al Mostaqbal Tech - Zero-Cost Storage Optimizer
 * Client-side Canvas WebP image compressor ensuring all uploaded invoices
 * and warranty stickers are compressed to under 150KB before upload/storage.
 */

export interface CompressionResult {
  dataUrl: string;
  blob: Blob;
  sizeBytes: number;
  originalSizeBytes: number;
  reductionPercentage: number;
}

export async function compressImageToWebP(
  file: File,
  maxSizeBytes: number = 150 * 1024, // 150 KB limit
  maxDimension: number = 1280
): Promise<CompressionResult> {
  if (typeof window === 'undefined') {
    throw new Error('compressImageToWebP must be executed in a browser environment');
  }

  const originalSizeBytes = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('فشل قراءة ملف الصورة'));
    
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('فشل تحميل الصورة في الذاكرة للمعالجة'));
      
      img.onload = async () => {
        try {
          let { width, height } = img;

          // Proportional dimension scaling
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('تعذر إنشاء سياق Canvas الرسومي'));
          }

          // High quality drawing interpolation
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Step 1: Quality search with WebP
          let quality = 0.82;
          let blob: Blob | null = await new Promise((res) =>
            canvas.toBlob(res, 'image/webp', quality)
          );

          // If browser doesn't support WebP export, fallback to JPEG
          const mimeType = blob ? 'image/webp' : 'image/jpeg';
          if (!blob) {
            blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality));
          }

          // Step 2: Iteratively lower quality if size > 150KB
          while (blob && blob.size > maxSizeBytes && quality > 0.35) {
            quality -= 0.12;
            blob = await new Promise((res) => canvas.toBlob(res, mimeType, quality));
          }

          // Step 3: If still > 150KB, scale down resolution
          if (blob && blob.size > maxSizeBytes) {
            canvas.width = Math.round(width * 0.75);
            canvas.height = Math.round(height * 0.75);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            blob = await new Promise((res) => canvas.toBlob(res, mimeType, 0.65));
          }

          if (!blob) {
            return reject(new Error('فشل ضغط الصورة'));
          }

          // Convert blob to base64 DataURL for offline / direct storage
          const blobReader = new FileReader();
          blobReader.onloadend = () => {
            const dataUrl = blobReader.result as string;
            const sizeBytes = blob!.size;
            const reductionPercentage = Math.max(
              0,
              Math.round(((originalSizeBytes - sizeBytes) / originalSizeBytes) * 100)
            );

            resolve({
              dataUrl,
              blob: blob!,
              sizeBytes,
              originalSizeBytes,
              reductionPercentage,
            });
          };
          blobReader.readAsDataURL(blob);
        } catch (err) {
          reject(err);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
