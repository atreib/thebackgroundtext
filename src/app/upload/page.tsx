"use client";

import { useState, useEffect } from "react";
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

        // Create a map of pixels to make transparent (including margin)
        const width = canvas.width;
        const height = canvas.height;
        const pixelsToMakeTransparent = new Set<number>();
        const margin = -20; // Adjust this value to control the margin size

        // First pass: identify foreground pixels
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            if (fgData.data[i + 3] > 0) {
              // Add the pixel and its surrounding pixels within the margin
              for (let my = -margin; my <= margin; my++) {
                for (let mx = -margin; mx <= margin; mx++) {
                  const ny = y + my;
                  const nx = x + mx;
                  if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                    pixelsToMakeTransparent.add((ny * width + nx) * 4);
                  }
                }
              }
            }
          }
        }

        // Second pass: apply transparency
        for (const i of pixelsToMakeTransparent) {
          originalData.data[i + 3] = 0;
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
  const [text, setText] = useState("YOUR TEXT HERE");
  const [textSize, setTextSize] = useState(64);
  const [textColor, setTextColor] = useState("#FFFFFF");

  // Cleanup previous URLs when new image is processed
  useEffect(() => {
    return () => {
      if (foregroundImage && foregroundImage.startsWith("blob:")) {
        URL.revokeObjectURL(foregroundImage);
      }
      if (backgroundImage && backgroundImage.startsWith("blob:")) {
        URL.revokeObjectURL(backgroundImage);
      }
    };
  }, [foregroundImage, backgroundImage]);

  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    try {
      // Cleanup previous URLs
      if (foregroundImage && foregroundImage.startsWith("blob:")) {
        URL.revokeObjectURL(foregroundImage);
      }
      if (backgroundImage && backgroundImage.startsWith("blob:")) {
        URL.revokeObjectURL(backgroundImage);
      }

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

      // Remove the URL revocation since we need to keep using the URLs
      // URL.revokeObjectURL(foregroundUrl);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Original images preview */}
          <div className="space-y-8">
            <h2 className="text-xl font-semibold">Original Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {originalImage && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Original</h3>
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
                  <h3 className="text-lg font-semibold mb-2">Foreground</h3>
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
                  <h3 className="text-lg font-semibold mb-2">Background</h3>
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

          {/* Layered composition */}
          {backgroundImage && foregroundImage && (
            <div className="space-y-8">
              <h2 className="text-xl font-semibold">Layered Composition</h2>

              {/* Text controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Text</label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Text Size
                  </label>
                  <input
                    type="range"
                    min="32"
                    max="128"
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Layered preview */}
              <div className="border rounded-lg p-4">
                <div className="relative aspect-square">
                  {/* Background layer */}
                  <Image
                    src={backgroundImage}
                    alt="Background Layer"
                    fill
                    className="object-contain z-0"
                  />

                  {/* Text layer */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div
                      style={{
                        fontSize: `${textSize}px`,
                        color: textColor,
                        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                        fontWeight: "bold",
                        textAlign: "center",
                        maxWidth: "90%",
                        wordBreak: "break-word",
                      }}
                    >
                      {text}
                    </div>
                  </div>

                  {/* Foreground layer */}
                  <Image
                    src={foregroundImage}
                    alt="Foreground Layer"
                    fill
                    className="object-contain z-20"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
