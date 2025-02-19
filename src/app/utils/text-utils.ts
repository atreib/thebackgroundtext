export type CanvasContext = CanvasRenderingContext2D;

export interface TextStyle {
  text: string;
  textSize: number;
  textColor: string;
  textOpacity: number;
  fontFamily: string;
  positionX: number;
  positionY: number;
  rotation: number;
  letterSpacing: number;
  wordSpacing: number;
  scaleX: number;
  scaleY: number;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowColor: string;
  shadowOpacity: number;
}

export function setFont(
  ctx: CanvasContext,
  fontFamily: string,
  textSize: number,
  canvasWidth: number
): void {
  const scaledTextSize = (textSize * canvasWidth) / 512;
  ctx.font = `bold ${scaledTextSize}px ${fontFamily}`;
}

export function setTextColor(
  ctx: CanvasContext,
  color: string,
  opacity: number
): void {
  const hexOpacity = Math.round(opacity * 2.55)
    .toString(16)
    .padStart(2, "0");
  ctx.fillStyle = color + hexOpacity;
}

export function setShadow(
  ctx: CanvasContext,
  shadowColor: string,
  shadowOpacity: number,
  shadowBlur: number,
  shadowOffsetX: number,
  shadowOffsetY: number
): void {
  const hexOpacity = Math.round(shadowOpacity * 2.55)
    .toString(16)
    .padStart(2, "0");
  ctx.shadowColor = shadowColor + hexOpacity;
  ctx.shadowBlur = shadowBlur;
  ctx.shadowOffsetX = shadowOffsetX;
  ctx.shadowOffsetY = shadowOffsetY;
}

export function setTextAlignment(ctx: CanvasContext): void {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
}

export function applyTransformations(
  ctx: CanvasContext,
  x: number,
  y: number,
  rotation: number,
  scaleX: number,
  scaleY: number
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(scaleX / 100, scaleY / 100);
  ctx.translate(-x, -y);
}

export function calculatePosition(
  canvasWidth: number,
  canvasHeight: number,
  positionX: number,
  positionY: number
): { x: number; y: number } {
  return {
    x: (canvasWidth * positionX) / 100,
    y: (canvasHeight * positionY) / 100,
  };
}

export function drawTextWithSpacing(
  ctx: CanvasContext,
  text: string,
  x: number,
  y: number,
  letterSpacing: number,
  wordSpacing: number,
  textSize: number
): void {
  const lines = text.split("\n");
  const computedLineHeight = textSize * 1.2; // 120% of text size for line height

  lines.forEach((line, index) => {
    const words = line.split(" ");
    let currentX = x;
    const yOffset = (index - (lines.length - 1) / 2) * computedLineHeight;

    const spaceWidth = ctx.measureText(" ").width + wordSpacing;
    let totalWidth = 0;

    words.forEach((word, wordIndex) => {
      const chars = word.split("");
      let wordWidth = 0;

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
}

export function resetShadow(ctx: CanvasContext): void {
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
}

export function restoreContext(ctx: CanvasContext): void {
  ctx.restore();
}

export function renderText(
  ctx: CanvasContext,
  style: TextStyle,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Set basic text properties
  setFont(ctx, style.fontFamily, style.textSize, canvasWidth);
  setTextColor(ctx, style.textColor, style.textOpacity);
  setTextAlignment(ctx);

  // Set shadow
  setShadow(
    ctx,
    style.shadowColor,
    style.shadowOpacity,
    style.shadowBlur,
    style.shadowOffsetX,
    style.shadowOffsetY
  );

  // Calculate position and apply transformations
  const { x, y } = calculatePosition(
    canvasWidth,
    canvasHeight,
    style.positionX,
    style.positionY
  );

  applyTransformations(ctx, x, y, style.rotation, style.scaleX, style.scaleY);

  // Draw the text
  drawTextWithSpacing(
    ctx,
    style.text,
    x,
    y,
    style.letterSpacing,
    style.wordSpacing,
    (style.textSize * canvasWidth) / 512
  );

  // Reset the context
  restoreContext(ctx);
}
