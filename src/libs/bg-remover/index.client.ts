"use client";

import {
  removeBackground as imglyBackgroundRemoval,
  Config,
} from "@imgly/background-removal";

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
  return URL.createObjectURL(blob);
}
