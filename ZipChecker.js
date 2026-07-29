"use client";

import { useEffect, useState } from "react";

/* Rotating hero slideshow with flicker-free crossfade: the outgoing slide
   stays fully opaque underneath while the incoming one fades in over it.

   Each slide: { src, srcDesktop? }
   - src         16:9 image, shown in the stacked mobile layout
   - srcDesktop  4:3 image, shown in the desktop side-panel layout where the
                 taller frame survives the panel crop + gradient fade.
   The swap is pure CSS (same 921px breakpoint as the layout), so it tracks
   window resizes instantly with no JS listeners. */
export default function HeroSlideshow({ slides, interval = 6000 }) {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(null);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setActive((cur) => {
        setPrev(cur);
        return (cur + 1) % slides.length;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [slides.length, interval]);

  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), 1500);
    return () => clearTimeout(t);
  }, [prev, active]);

  const stateClass = (i) => `${i === active ? " active" : ""}${i === prev ? " prev" : ""}`;

  return (
    <>
      {slides.map((s, i) => (
        <div key={s.src}>
          <div
            className={`hero-slide slide-mobile${stateClass(i)}`}
            style={{ backgroundImage: `url('${s.src}')` }}
          />
          {s.srcDesktop && (
            <div
              className={`hero-slide slide-desktop${stateClass(i)}`}
              style={{ backgroundImage: `url('${s.srcDesktop}')` }}
            />
          )}
        </div>
      ))}
    </>
  );
}
