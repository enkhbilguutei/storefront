import { useState, useEffect, useRef } from "react";

export function useStickyBar(isMobile: boolean) {
  const [showStickyBar, setShowStickyBar] = useState(false);
  const actionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMobile) {
      setShowStickyBar(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const currentActionRef = actionRef.current;
    if (currentActionRef) {
      observer.observe(currentActionRef);
    }

    return () => {
      if (currentActionRef) observer.unobserve(currentActionRef);
      observer.disconnect();
    };
  }, [isMobile]);

  return { showStickyBar, actionRef };
}
