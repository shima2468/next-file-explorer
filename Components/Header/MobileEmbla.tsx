"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { EmblaOptionsType, EmblaCarouselType } from "embla-carousel";

type MobileEmblaProps<T> = {
  items: T[];
  renderItem: (item: T, idx: number) => React.ReactNode;
  delayMs?: number;
  options?: EmblaOptionsType;
};

export default function MobileEmbla<T>({
  items,
  renderItem,
  delayMs = 2400,
  options,
}: MobileEmblaProps<T>) {
  const autoplayRef = useRef(
    Autoplay({
      delay: delayMs,
      stopOnMouseEnter: true,
      stopOnInteraction: false,
      stopOnFocusIn: true,
    })
  );

  const [viewportRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", containScroll: "trimSnaps", skipSnaps: false, dragFree: false, ...options },
    [autoplayRef.current]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback((api: EmblaCarouselType | null) => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect(emblaApi);
    emblaApi.on("select", () => onSelect(emblaApi));
    emblaApi.on("reInit", () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      onSelect(emblaApi);
    });
  }, [emblaApi, onSelect]);

  const onPointerDown = useCallback(() => autoplayRef.current.stop(), []);
  const onPointerUp   = useCallback(() => autoplayRef.current.play(), []);

  return (
    <div className="lg:hidden -mx-3">
      <div
        className="relative px-3 py-1"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onMouseLeave={() => autoplayRef.current.play()}
      >
        <div ref={viewportRef} className="overflow-hidden">
          <div className="flex touch-pan-x">
            {items.map((it, idx) => (
              <div
                key={idx}
                className="shrink-0 mr-3 basis-[78%] xs:basis-[68%] sm:basis-[58%] md:basis-[46%] md:mr-4"
              >
                {renderItem(it, idx)}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center gap-2">
          {scrollSnaps.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={[
                "rounded-full transition",
                selectedIndex === i ? "h-1.5 w-3 bg-neutral-800" : "h-1.5 w-1.5 bg-neutral-200 md:h-2 md:w-2",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
