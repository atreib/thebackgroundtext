import {
  setFont,
  setTextColor,
  setShadow,
  setTextAlignment,
  applyTransformations,
  calculatePosition,
  drawTextWithSpacing,
  resetShadow,
  restoreContext,
  renderText,
  type CanvasContext,
  type TextStyle,
} from "./text-utils";

describe("Text Utils", () => {
  let ctx: CanvasContext;

  beforeEach(() => {
    // Create a mock canvas context
    ctx = {
      font: "",
      fillStyle: "",
      textAlign: "",
      textBaseline: "",
      shadowColor: "",
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      measureText: jest.fn().mockReturnValue({ width: 10 }),
      fillText: jest.fn(),
    } as unknown as CanvasContext;
  });

  describe("setFont", () => {
    it("should set the correct font string", () => {
      setFont(ctx, "Arial", 64, 512);
      expect(ctx.font).toBe("bold 64px Arial");
    });

    it("should scale font size based on canvas width", () => {
      setFont(ctx, "Arial", 64, 1024);
      expect(ctx.font).toBe("bold 128px Arial");
    });
  });

  describe("setTextColor", () => {
    it("should set the correct fill style with opacity", () => {
      setTextColor(ctx, "#FFFFFF", 50);
      expect(
        typeof ctx.fillStyle === "string" && ctx.fillStyle.toUpperCase()
      ).toBe("#FFFFFF7F");
    });

    it("should handle 100% opacity", () => {
      setTextColor(ctx, "#000000", 100);
      expect(
        typeof ctx.fillStyle === "string" && ctx.fillStyle.toUpperCase()
      ).toBe("#000000FF");
    });
  });

  describe("setShadow", () => {
    it("should set all shadow properties", () => {
      setShadow(ctx, "#000000", 50, 4, 2, 2);
      expect(
        typeof ctx.shadowColor === "string" && ctx.shadowColor.toUpperCase()
      ).toBe("#0000007F");
      expect(ctx.shadowBlur).toBe(4);
      expect(ctx.shadowOffsetX).toBe(2);
      expect(ctx.shadowOffsetY).toBe(2);
    });
  });

  describe("setTextAlignment", () => {
    it("should set correct text alignment properties", () => {
      setTextAlignment(ctx);
      expect(ctx.textAlign).toBe("center");
      expect(ctx.textBaseline).toBe("middle");
    });
  });

  describe("applyTransformations", () => {
    it("should call all transformation methods in correct order", () => {
      applyTransformations(ctx, 100, 100, 45, 100, 100);

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.translate).toHaveBeenCalledWith(100, 100);
      expect(ctx.rotate).toHaveBeenCalledWith((45 * Math.PI) / 180);
      expect(ctx.scale).toHaveBeenCalledWith(1, 1);
      expect(ctx.translate).toHaveBeenCalledWith(-100, -100);
    });
  });

  describe("calculatePosition", () => {
    it("should calculate correct x and y positions based on percentages", () => {
      const result = calculatePosition(1000, 500, 50, 50);
      expect(result).toEqual({ x: 500, y: 250 });
    });

    it("should handle edge cases", () => {
      const result = calculatePosition(1000, 500, 0, 100);
      expect(result).toEqual({ x: 0, y: 500 });
    });
  });

  describe("drawTextWithSpacing", () => {
    it("should handle single line text", () => {
      drawTextWithSpacing(ctx, "Hello", 100, 100, 2, 5, 16);
      expect(ctx.fillText).toHaveBeenCalled();
      expect(ctx.measureText).toHaveBeenCalled();
    });

    it("should handle multiline text", () => {
      drawTextWithSpacing(ctx, "Hello\nWorld", 100, 100, 2, 5, 16);
      expect(ctx.fillText).toHaveBeenCalled();
      expect(ctx.translate).toHaveBeenCalled();
    });
  });

  describe("resetShadow", () => {
    it("should reset shadow properties", () => {
      resetShadow(ctx);
      expect(ctx.shadowBlur).toBe(0);
      expect(ctx.shadowColor).toBe("transparent");
    });
  });

  describe("restoreContext", () => {
    it("should call restore", () => {
      restoreContext(ctx);
      expect(ctx.restore).toHaveBeenCalled();
    });
  });

  describe("renderText", () => {
    it("should apply all text operations in correct order", () => {
      const style: TextStyle = {
        text: "Test Text",
        textSize: 64,
        textColor: "#FFFFFF",
        textOpacity: 100,
        fontFamily: "Arial",
        positionX: 50,
        positionY: 50,
        rotation: 0,
        letterSpacing: 0,
        wordSpacing: 0,
        scaleX: 100,
        scaleY: 100,
        shadowBlur: 4,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowColor: "#000000",
        shadowOpacity: 50,
      };

      renderText(ctx, style, 1000, 500);

      // Verify all operations were called
      expect(ctx.font).toBe("bold 125px Arial"); // (64 * 1000) / 512 ≈ 125
      expect(
        typeof ctx.fillStyle === "string" && ctx.fillStyle.toUpperCase()
      ).toBe("#FFFFFFFF");
      expect(ctx.textAlign).toBe("center");
      expect(ctx.textBaseline).toBe("middle");
      expect(
        typeof ctx.shadowColor === "string" && ctx.shadowColor.toUpperCase()
      ).toBe("#0000007F");
      expect(ctx.shadowBlur).toBe(4);
      expect(ctx.shadowOffsetX).toBe(2);
      expect(ctx.shadowOffsetY).toBe(2);

      // Verify transformations
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.translate).toHaveBeenCalledWith(500, 250); // 50% of 1000x500
      expect(ctx.rotate).toHaveBeenCalledWith(0);
      expect(ctx.scale).toHaveBeenCalledWith(1, 1);

      // Verify text drawing
      expect(ctx.fillText).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });
  });
});
