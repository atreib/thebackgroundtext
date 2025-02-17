"use client";

import { useState } from "react";
import { removeBackground } from "@imgly/background-removal";
import Image from "next/image";

function extractBackgroundFromOriginalAndForeground(
  originalImageUrl: string,
  foregroundImageUrl: string
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const original = new window.Image();
    const foreground = new window.Image();

    original.onload = () => {
      canvas.width = original.width;
      canvas.height = original.height;
      ctx.drawImage(original, 0, 0);

      foreground.onload = () => {
        // Create a temporary canvas for the foreground
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d")!;
        tempCtx.drawImage(foreground, 0, 0);

        // Get foreground pixel data
        const fgData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

        // Get original image data
        const originalData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Create background by keeping original pixels and making the subject area transparent
        for (let i = 0; i < originalData.data.length; i += 4) {
          // If the pixel in foreground has any opacity (part of the subject)
          if (fgData.data[i + 3] > 0) {
            // This pixel is part of the subject in foreground, so make it transparent in background
            originalData.data[i + 3] = 0;
          }
          // Otherwise, keep the original pixel (it's part of the background)
        }

        ctx.putImageData(originalData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      foreground.src = foregroundImageUrl;
    };
    original.src = originalImageUrl;
  });
}

export default function UploadPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [foregroundImage, setForegroundImage] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    try {
      // Process foreground (subject)
      const foregroundConfig = {
        output: {
          format: "image/png" as const,
          quality: 0.8,
        },
      };
      const foregroundBlob = await removeBackground(
        imageData,
        foregroundConfig
      );
      const foregroundUrl = URL.createObjectURL(foregroundBlob);
      setForegroundImage(foregroundUrl);

      // Extract background by subtracting foreground from original
      const backgroundUrl = await extractBackgroundFromOriginalAndForeground(
        imageData,
        foregroundUrl
      );
      setBackgroundImage(backgroundUrl);

      // Clean up the temporary blob URL
      URL.revokeObjectURL(foregroundUrl);
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setOriginalImage(imageData);
        processImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Background Removal Tool</h1>

        <form className="space-y-4 mb-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
              disabled={isProcessing}
            />
          </div>
          <p className="text-sm text-gray-500">Supported formats: JPG, PNG</p>
        </form>

        {isProcessing && (
          <div className="text-center py-4">
            <p>Processing image... This may take a few moments.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {originalImage && (
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Original Image</h2>
              <div className="relative aspect-square">
                <Image
                  src={originalImage}
                  alt="Original"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {foregroundImage && (
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">
                Foreground (Subject)
              </h2>
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={foregroundImage}
                  alt="Foreground"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {backgroundImage && (
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Background</h2>
              <div className="relative aspect-square">
                <Image
                  src={backgroundImage}
                  alt="Background"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
