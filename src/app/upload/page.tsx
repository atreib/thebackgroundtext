"use client";

import { useState } from "react";
import { removeBackground } from "@imgly/background-removal";
import Image from "next/image";

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

      // Process background
      const backgroundConfig = {
        output: {
          format: "image/png" as const,
          quality: 0.8,
        },
      };
      const backgroundBlob = await removeBackground(
        imageData,
        backgroundConfig
      );
      const backgroundUrl = URL.createObjectURL(backgroundBlob);
      setBackgroundImage(backgroundUrl);
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
