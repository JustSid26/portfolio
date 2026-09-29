"use client";

import { useRouter } from "next/navigation";
import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { navigate } from "@/lib/transition";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  // Element whose rect seeds the shared-element ghost, and the image it shows
  flipFrom?: () => HTMLElement | null;
  flipImage?: string;
};

export const TransitionLink = forwardRef<HTMLAnchorElement, Props>(function TransitionLink(
  { href, flipFrom, flipImage, onClick, onMouseEnter, ...rest },
  ref,
) {
  const router = useRouter();
  return (
    <a
      ref={ref}
      href={href}
      onMouseEnter={(e) => {
        if (href.startsWith("/")) router.prefetch(href.split("#")[0]);
        onMouseEnter?.(e);
      }}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (!href.startsWith("/")) return;
        e.preventDefault();
        navigate(router, href, { from: flipFrom?.() ?? null, image: flipImage });
      }}
      {...rest}
    />
  );
});
