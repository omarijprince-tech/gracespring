"use client";

import { useCart } from "../lib/cart-context";

export default function Toast() {
  const { toast } = useCart();
  return (
    <div className={`toast${toast.show ? " show" : ""}${toast.kind ? ` ${toast.kind}` : ""}`} role="status">
      {toast.msg}
    </div>
  );
}
