"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";

export function NavigationEvents() {
  const pathname = usePathname();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    NProgress.done();
  }, [pathname]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't trigger progress bar if clicking on buttons, inputs, or interactive elements
      if (
        target.closest("button") ||
        target.closest("input") ||
        target.closest("select") ||
        target.closest("textarea") ||
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT"
      ) {
        return;
      }
      
      const anchor = target.closest("a");
      
      if (anchor) {
        const href = anchor.getAttribute("href");
        const isExternal = href?.startsWith("http") || href?.startsWith("//");
        const isSameOrigin = href?.startsWith(window.location.origin);
        const isHashLink = href?.startsWith("#");
        
        // Start progress bar for internal navigation
        if (href && !isExternal && !isHashLink && !isSameOrigin) {
          NProgress.start();
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    
    return () => {
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  return null;
}
