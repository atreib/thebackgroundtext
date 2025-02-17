import { Canvas2d, ImageSize } from "./type";

export function convertBlobToImageUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export async function createImageElementFromUrl(
  url: string
): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.src = url;
  });
}

export function extractImageDataFromCanvas2D(canvas2d: Canvas2d): ImageData {
  return canvas2d.ctx.getImageData(
    0,
    0,
    canvas2d.canvas.width,
    canvas2d.canvas.height
  );
}

export function createCanvas2DFromImageElement(
  image: HTMLImageElement
): Canvas2d {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  return {
    canvas,
    ctx,
  };
}

export function createCanvas2DFromImageData(props: {
  data: ImageData;
  size: ImageSize;
}): Canvas2d {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = props.size.width;
  canvas.height = props.size.height;
  ctx.putImageData(props.data, 0, 0);
  return {
    canvas,
    ctx,
  };
}

export function extractContenfulPixelsFromImageData(
  props: {
    size: ImageSize;
    data: ImageData;
  },
  config: {
    padding: number;
  } = {
    padding: -20,
  }
): Set<number> {
  // Create a map of pixels to make transparent (including margin)
  const pixelsToMakeTransparent = new Set<number>();
  const margin = config.padding; // Adjust this value to control the margin size

  // First pass: identify foreground pixels
  for (let y = 0; y < props.size.height; y++) {
    for (let x = 0; x < props.size.width; x++) {
      const i = (y * props.size.width + x) * 4;
      if (props.data.data[i + 3] > 0) {
        // Add the pixel and its surrounding pixels within the margin
        for (let my = -margin; my <= margin; my++) {
          for (let mx = -margin; mx <= margin; mx++) {
            const ny = y + my;
            const nx = x + mx;
            if (
              ny >= 0 &&
              ny < props.size.height &&
              nx >= 0 &&
              nx < props.size.width
            ) {
              pixelsToMakeTransparent.add((ny * props.size.width + nx) * 4);
            }
          }
        }
      }
    }
  }

  return pixelsToMakeTransparent;
}

export function applyTransparencyToImageData(props: {
  pixelsToMakeTransparent: Set<number>;
  baseImageData: ImageData;
}) {
  for (const i of props.pixelsToMakeTransparent) {
    props.baseImageData.data[i + 3] = 0;
  }
  return props.baseImageData;
}

export function createImageURLFromCanvas2D(canvas2d: Canvas2d): string {
  return canvas2d.canvas.toDataURL("image/png");
}
