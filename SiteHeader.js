"use client";

import { useState } from "react";

/* Product photo with SVG-illustration fallback until real assets exist. */
export default function ProductImage({ product, alt = "" }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <svg viewBox="0 0 68 122" aria-hidden="true">
        <use href="#bottle" />
      </svg>
    );
  }
  return (
    <img src={product.image} alt={alt} loading="lazy" onError={() => setFailed(true)} />
  );
}
