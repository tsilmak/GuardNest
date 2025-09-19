"use client";
import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getDisplacementFilter } from "@/components/GlassElement/getDisplacementFilter";
import { getDisplacementMap } from "@/components/GlassElement/getDisplacementMap";
import styles from "./GlassElement.module.css";

type GlassElementProps = {
  children?: ReactNode | undefined;
  blur?: number;
  debug?: boolean;
  radius?: number;
  depth?: number;
  strength?: number;
  chromaticAberration?: number;
  /**
   * Optional CSS clip-path to support arbitrary shapes beyond rounded rectangles and circles.
   * Example: 'path("M10,80 Q52.5,10 95,80 T180,80")' or 'circle(50% at 50% 50%)'
   */
  clipPath?: string;
  /**
   * Adds a subtle scrim to improve content readability over unpredictable backgrounds.
   * 0 disables the scrim; typical values are 0.06 - 0.22.
   */
  scrimOpacity?: number;
  /**
   * Background color for the glass element. Can be any valid CSS background value.
   * Examples: 'rgba(0,0,0,0.4)', '#00000040', 'transparent'
   */
  background?: string;
  /**
   * Border color for the glass element. If not provided, will use a lighter version of the background.
   * Examples: 'rgba(255,255,255,0.2)', 'transparent'
   */
  borderColor?: string;
};

export const GlassElement = ({
  depth: baseDepth = 0.8,
  radius = 16,
  children,
  strength = 0.3,
  chromaticAberration = 0,
  blur = 2,
  debug = false,
  clipPath,
  scrimOpacity = 0.12,
  background = "transparent",
  borderColor,
}: GlassElementProps) => {
  // Change element depth on click
  const [clicked, setClicked] = useState(false);
  const resolvedDepth = useMemo(
    () => baseDepth / (clicked ? 0.7 : 1),
    [baseDepth, clicked]
  );

  // Ensure SSR and first client render match to prevent hydration mismatches.
  // Only after hydration, we enable environment-dependent features like CSS.supports.
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Measure actual rendered size to avoid 1px fallback and follow content instantly
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredSize, setMeasuredSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isEffectReady, setIsEffectReady] = useState(false);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Prefer measuring the parent that defines layout for this overlay box
    const measureTarget = element.parentElement ?? element;

    let rafId: number | null = null;
    const measure = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const rect = measureTarget.getBoundingClientRect();
        const next = {
          width: Math.ceil(rect.width),
          height: Math.ceil(rect.height),
        };
        setMeasuredSize((prev) =>
          prev && prev.width === next.width && prev.height === next.height
            ? prev
            : next
        );
      });
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(measureTarget);
    return () => {
      resizeObserver.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // Defer enabling the heavy visual effect until after hydration and measurement
  useEffect(() => {
    if (!isHydrated) return;
    if (!measuredSize || measuredSize.width <= 1 || measuredSize.height <= 1)
      return;
    const rafId = requestAnimationFrame(() => setIsEffectReady(true));
    return () => cancelAnimationFrame(rafId);
  }, [isHydrated, measuredSize]);

  // Feature detection for broader compatibility
  const supportsBackdrop = useMemo(() => {
    if (!isHydrated || typeof CSS === "undefined") return false;
    return (
      CSS.supports("backdrop-filter", "blur(1px)") ||
      CSS.supports("-webkit-backdrop-filter", "blur(1px)")
    );
  }, [isHydrated]);
  const supportsBackdropUrl = useMemo(() => {
    if (!isHydrated || typeof CSS === "undefined") return false;
    return (
      CSS.supports("backdrop-filter", "url(#x)") ||
      CSS.supports("-webkit-backdrop-filter", "url(#x)")
    );
  }, [isHydrated]);

  // Render at a higher internal resolution to reduce edge pixelation when zoomed or on HiDPI screens
  const [renderScale, setRenderScale] = useState(1);
  useEffect(() => {
    if (!isHydrated) return;
    const updateScale = () => {
      const dpr =
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      // Clamp to avoid excessively large data URLs
      setRenderScale(Math.min(2, Math.max(1, dpr)));
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [isHydrated]);

  // Build filter strings with graceful fallbacks
  const effectiveWidth = useMemo(
    () =>
      measuredSize?.width && measuredSize.width > 1 ? measuredSize.width : 300,
    [measuredSize]
  );
  const effectiveHeight = useMemo(
    () =>
      measuredSize?.height && measuredSize.height > 1
        ? measuredSize.height
        : 100,
    [measuredSize]
  );

  // Use the specified radius value
  const effectiveRadius = useMemo(() => radius, [radius]);

  const displacementUrl = useMemo(() => {
    if (!supportsBackdropUrl || !isEffectReady) return undefined;
    return `url('${getDisplacementFilter({
      height: effectiveHeight,
      width: effectiveWidth,
      radius: effectiveRadius,
      depth: resolvedDepth,
      strength,
      chromaticAberration,
      scale: renderScale,
    })}')`;
  }, [
    supportsBackdropUrl,
    isEffectReady,
    effectiveHeight,
    effectiveWidth,
    effectiveRadius,
    resolvedDepth,
    strength,
    chromaticAberration,
    renderScale,
  ]);

  const clampedBlur = Math.max(0, blur);
  const fullBackdrop = useMemo(() => {
    if (!displacementUrl) {
      return `blur(${clampedBlur}px) brightness(1.04) saturate(1.06)`;
    }
    const halfBlur = Math.max(0, blur / 2);
    return `blur(${halfBlur}px) ${displacementUrl} blur(${clampedBlur}px) brightness(1.06) saturate(1.12)`;
  }, [displacementUrl, clampedBlur, blur]);
  const simpleBackdrop = useMemo(
    () => `blur(${clampedBlur}px) brightness(1.04) saturate(1.06)`,
    [clampedBlur]
  );

  const style: CSSProperties = useMemo(() => {
    const style: CSSProperties = {
      height: "100%",
      width: "100%",
      minHeight: "100%",
      minWidth: "100%",
      position: "relative",
      display: "block",
      borderRadius: `${effectiveRadius}px`,
      background: background,
      border: `0px solid transparent`,
      boxShadow: `
        inset 0 0 0 1px rgba(255, 255, 255, 0.1),
        0 0 20px rgba(255, 255, 255, 0.05),
        0 0 40px rgba(255, 255, 255, 0.02)
      `,
      // Apply a full blur even before hydration to avoid a sharp, unstyled initial render.
      backdropFilter:
        isEffectReady && supportsBackdrop
          ? supportsBackdropUrl
            ? fullBackdrop
            : simpleBackdrop
          : simpleBackdrop,
      WebkitBackdropFilter:
        isEffectReady && supportsBackdrop
          ? supportsBackdropUrl
            ? fullBackdrop
            : simpleBackdrop
          : simpleBackdrop,
      // If backdrop 'url()' is not supported, gracefully degrade to simple blur without displacement
      filter: undefined,
      clipPath: clipPath,
      willChange:
        isEffectReady && supportsBackdrop
          ? "backdrop-filter, -webkit-backdrop-filter"
          : undefined,
    };

    // Debug mode: display the displacement map instead of actual effect
    if (debug === true) {
      style.background = `url("${getDisplacementMap({
        height: effectiveHeight,
        width: effectiveWidth,
        radius,
        depth: resolvedDepth,
        scale: renderScale,
      })}")`;
      style.boxShadow = "none";
    }
    return style;
  }, [
    effectiveRadius,
    background,
    isEffectReady,
    supportsBackdrop,
    supportsBackdropUrl,
    fullBackdrop,
    simpleBackdrop,
    clipPath,
    debug,
    effectiveHeight,
    effectiveWidth,
    radius,
    resolvedDepth,
    renderScale,
  ]);

  const scrimOpacityNormalized = useMemo(
    () => Math.max(0, Math.min(1, scrimOpacity)),
    [scrimOpacity]
  );
  const handlePointerDown = useCallback(() => setClicked(true), []);
  const handlePointerUp = useCallback(() => setClicked(false), []);

  return (
    <div
      ref={containerRef}
      className={styles.box}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {scrimOpacity > 0 && (
        <div
          className={styles.scrim}
          style={{ opacity: scrimOpacityNormalized }}
        />
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
};
