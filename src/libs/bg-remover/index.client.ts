"use client";

import {
  removeBackground as imglyBackgroundRemoval,
  Config,
} from "@imgly/background-removal";
import {
  applyTransparencyToImageData,
  convertBlobToImageUrl,
  createCanvas2DFromImageData,
  createCanvas2DFromImageElement,
  createImageElementFromUrl,
  createImageURLFromCanvas2D,
  extractContenfulPixelsFromImageData,
  extractImageDataFromCanvas2D,
} from "./utils.client";

export async function extractForegroundURL(
  imageDataUrl: string,
  config: Config = {
    output: {
      format: "image/png" as const,
      quality: 0.8,
    },
  }
): Promise<string> {
  const blob = await imglyBackgroundRemoval(imageDataUrl, config);
  return convertBlobToImageUrl(blob);
}

export async function extractBackgroundURL(props: {
  originalImageUrl: string;
  foregroundImageUrl: string;
}): Promise<string> {
  // Extract data from original and foreground images
  const originalImageEl = await createImageElementFromUrl(
    props.originalImageUrl
  );
  const originalCanvas2D = createCanvas2DFromImageElement(originalImageEl);
  const foregroundImageEl = await createImageElementFromUrl(
    props.foregroundImageUrl
  );
  const foregroundCanvas2D = createCanvas2DFromImageElement(foregroundImageEl);
  const foregroundImageData2D =
    extractImageDataFromCanvas2D(foregroundCanvas2D);

  // Identify mask pixels from foreground
  const foregroundPixels = extractContenfulPixelsFromImageData({
    size: {
      width: foregroundCanvas2D.canvas.width,
      height: foregroundCanvas2D.canvas.height,
    },
    data: foregroundImageData2D,
  });

  // Get difference between original and foreground
  const backgroundData = applyTransparencyToImageData({
    pixelsToMakeTransparent: foregroundPixels,
    baseImageData: extractImageDataFromCanvas2D(originalCanvas2D),
  });

  // Create canvas with only the background data
  const backgroundCanvas2D = createCanvas2DFromImageData({
    data: backgroundData,
    size: {
      width: originalCanvas2D.canvas.width,
      height: originalCanvas2D.canvas.height,
    },
  });

  return createImageURLFromCanvas2D(backgroundCanvas2D);
}
