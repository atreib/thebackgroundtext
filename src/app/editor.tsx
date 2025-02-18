"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

type Props = {
  originalImage: string;
  foregroundImage: string;
};

export function Editor({ originalImage, foregroundImage }: Props) {
  const [text, setText] = useState("YOUR TEXT HERE");
  const [textSize, setTextSize] = useState(64);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load images
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.src = src;
      });
    };

    try {
      // Load and draw background
      const bgImage = await loadImage(originalImage);

      // Set canvas size to match original image dimensions
      canvas.width = bgImage.naturalWidth;
      canvas.height = bgImage.naturalHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

      // Draw text
      ctx.font = `bold ${(textSize * canvas.width) / 512}px Arial`; // Scale text size relative to image width
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
      ctx.fillText(
        text,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.9
      );

      // Load and draw foreground
      const fgImage = await loadImage(foregroundImage);
      ctx.drawImage(fgImage, 0, 0, canvas.width, canvas.height);
    } catch (error) {
      console.error("Error creating composition:", error);
    }
  };

  // Update canvas whenever any dependency changes
  useEffect(() => {
    updateCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalImage, foregroundImage, text, textSize, textColor]);

  const downloadComposition = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert to blob and download
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((blob) => resolve(blob!), "image/png")
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${uuidv4()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border rounded-lg p-4 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Preview</h2>
        <button
          onClick={downloadComposition}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Download
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            <label className="block text-sm font-medium mb-1">Text Size</label>
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
            <label className="block text-sm font-medium mb-1">Text Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Canvas preview */}
        <div className="relative aspect-square">
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
        </div>
      </div>
    </div>
  );
}
