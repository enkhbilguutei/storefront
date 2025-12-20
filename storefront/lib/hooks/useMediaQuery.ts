import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handleMatch = () => setMatches(mq.matches);
    handleMatch();
    mq.addEventListener("change", handleMatch);
    return () => mq.removeEventListener("change", handleMatch);
  }, [query]);

  return matches;
}
