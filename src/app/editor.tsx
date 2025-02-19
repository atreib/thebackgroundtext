"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

type Props = {
  originalImage: string;
  foregroundImage: string;
};

const FONT_OPTIONS = [
  "Arial",
  "Times New Roman",
  "Helvetica",
  "Georgia",
  "Verdana",
  "Impact",
];

export function Editor({ originalImage, foregroundImage }: Props) {
  const [text, setText] = useState("YOUR TEXT HERE");
  const [textSize, setTextSize] = useState(64);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [textOpacity, setTextOpacity] = useState(100);
  const [positionX, setPositionX] = useState(50); // percentage
  const [positionY, setPositionY] = useState(50); // percentage
  const [fontFamily, setFontFamily] = useState("Arial");
  const [shadowBlur, setShadowBlur] = useState(4);
  const [shadowOffsetX, setShadowOffsetX] = useState(4);
  const [shadowOffsetY, setShadowOffsetY] = useState(4);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowOpacity, setShadowOpacity] = useState(50);
  const [rotation, setRotation] = useState(0); // Add rotation state
  const [letterSpacing, setLetterSpacing] = useState(0); // New: letter spacing in pixels
  const [wordSpacing, setWordSpacing] = useState(0); // New: word spacing in pixels
  const [scaleX, setScaleX] = useState(100); // New: horizontal scale percentage
  const [scaleY, setScaleY] = useState(100); // New: vertical scale percentage
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

      // Draw text with all customizations
      const scaledTextSize = (textSize * canvas.width) / 512;
      ctx.font = `bold ${scaledTextSize}px ${fontFamily}`;
      const color =
        textColor +
        Math.round(textOpacity * 2.55)
          .toString(16)
          .padStart(2, "0");
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Shadow settings
      const shadowColorHex =
        shadowColor +
        Math.round(shadowOpacity * 2.55)
          .toString(16)
          .padStart(2, "0");
      ctx.shadowColor = shadowColorHex;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetX = shadowOffsetX;
      ctx.shadowOffsetY = shadowOffsetY;

      // Apply transformations
      const x = (canvas.width * positionX) / 100;
      const y = (canvas.height * positionY) / 100;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scaleX / 100, scaleY / 100);
      ctx.translate(-x, -y);

      // Handle multiline text with letter spacing and word spacing
      const lines = text.split("\n");
      const computedLineHeight = (scaledTextSize * 1) / 100;

      lines.forEach((line, index) => {
        const words = line.split(" ");
        let currentX = x;
        const yOffset = (index - (lines.length - 1) / 2) * computedLineHeight;

        // Apply word spacing
        const spaceWidth = ctx.measureText(" ").width + wordSpacing;
        let totalWidth = 0;

        words.forEach((word, wordIndex) => {
          const chars = word.split("");
          let wordWidth = 0;

          // Apply letter spacing within each word
          chars.forEach((char) => {
            const charWidth = ctx.measureText(char).width;
            ctx.fillText(char, currentX + wordWidth, y + yOffset);
            wordWidth += charWidth + letterSpacing;
          });

          currentX += wordWidth;
          if (wordIndex < words.length - 1) {
            currentX += spaceWidth;
          }
          totalWidth = currentX - x;
        });

        // Center the line by adjusting x position
        const adjustment = totalWidth / 2;
        ctx.translate(-adjustment, 0);
      });

      ctx.restore();

      // Load and draw foreground
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
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
  }, [
    originalImage,
    foregroundImage,
    text,
    textSize,
    textColor,
    textOpacity,
    positionX,
    positionY,
    fontFamily,
    shadowBlur,
    shadowOffsetX,
    shadowOffsetY,
    shadowColor,
    shadowOpacity,
    rotation,
    letterSpacing,
    wordSpacing,
    scaleX,
    scaleY,
  ]);

  const downloadComposition = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
        <div className="space-y-4 max-h-[500px] overflow-y-auto border-b shadow p-8 bg-gray-50">
          <div>
            <label className="block text-sm font-medium mb-1">Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 border rounded min-h-[100px]"
              placeholder="Enter your text here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Font</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Text Size</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="32"
                max="256"
                value={textSize}
                onChange={(e) => setTextSize(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">{textSize}px</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium mb-1">
                Text Opacity (%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={textOpacity}
                onChange={(e) => setTextOpacity(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Position X (%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={positionX}
                onChange={(e) => setPositionX(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Position Y (%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={positionY}
                onChange={(e) => setPositionY(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Text Rotation</h3>
            <div>
              <label className="block text-sm font-medium mb-1">
                Rotation (degrees)
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
              <div className="text-sm text-gray-600 mt-1">{rotation}°</div>
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Shadow Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Shadow Color
                </label>
                <input
                  type="color"
                  value={shadowColor}
                  onChange={(e) => setShadowColor(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Shadow Opacity (%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={shadowOpacity}
                  onChange={(e) => setShadowOpacity(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Shadow Blur
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={shadowBlur}
                  onChange={(e) => setShadowBlur(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Shadow X Offset
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={shadowOffsetX}
                  onChange={(e) => setShadowOffsetX(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Shadow Y Offset
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={shadowOffsetY}
                  onChange={(e) => setShadowOffsetY(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Advanced Text Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Letter Spacing
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="-20"
                    max="100"
                    value={letterSpacing}
                    onChange={(e) => setLetterSpacing(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12">
                    {letterSpacing}px
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Word Spacing
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={wordSpacing}
                    onChange={(e) => setWordSpacing(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12">
                    {wordSpacing}px
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Horizontal Scale
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="300"
                      value={scaleX}
                      onChange={(e) => setScaleX(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-12">
                      {scaleX}%
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Vertical Scale
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="300"
                      value={scaleY}
                      onChange={(e) => setScaleY(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-12">
                      {scaleY}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
