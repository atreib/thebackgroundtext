"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { extractForegroundURL } from "@/libs/bg-remover/index.client";
import { Editor } from "./editor";

export default function UploadPage() {
  const [state, setState] = useState<"idle" | "loading">("idle");
  const [foregroundImage, setForegroundImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  const cleanUp = useCallback(() => {
    setForegroundImage(null);
    setOriginalImage(null);
  }, []);

  const processForegroundExtraction = async (originalImageUrl: string) => {
    setState("loading");
    try {
      const foregroundImageUrl = await extractForegroundURL(originalImageUrl);
      setForegroundImage(foregroundImageUrl);
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setState("idle");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    cleanUp();
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setOriginalImage(imageData);
        processForegroundExtraction(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        <header>
          <Image
            src="/logo-white.png"
            alt="The Background Text"
            width={200}
            height={200}
          />
        </header>

        <form className="space-y-4 mb-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
              disabled={state === "loading"}
            />
          </div>
          <p className="text-sm text-gray-500">Supported formats: JPG, PNG</p>
        </form>

        {originalImage && foregroundImage ? (
          <Editor
            originalImage={originalImage}
            foregroundImage={foregroundImage}
          />
        ) : null}

        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {originalImage ? (
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
            ) : null}
            {state === "loading" || foregroundImage ? (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Extraction</h3>
                <div className="relative aspect-square bg-gray-100">
                  {state === "loading" ? (
                    <div className="w-full h-full animate-pulse flex items-center justify-center">
                      <span className="text-gray-500 animate-pulse">
                        Extracting...
                      </span>
                    </div>
                  ) : (
                    <Image
                      src={foregroundImage!}
                      alt="Foreground"
                      fill
                      className="object-contain"
                    />
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
