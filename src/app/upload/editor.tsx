"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  originalImage: string;
  foregroundImage: string;
};

export function Editor({ originalImage, foregroundImage }: Props) {
  const [text, setText] = useState("YOUR TEXT HERE");
  const [textSize, setTextSize] = useState(64);
  const [textColor, setTextColor] = useState("#FFFFFF");

  return (
    <div className="border rounded-lg p-4 flex flex-col gap-8">
      <h2 className="text-xl font-semibold">Preview</h2>

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

        <div className="">
          <div className="relative aspect-square">
            {/* Background layer */}
            <Image
              src={originalImage}
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
    </div>
  );
}
