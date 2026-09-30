"use client";

import { useEffect, useState } from "react";
import { CHAPTERS } from "./chapters";

/** Id of the chapter crossing the middle of the viewport. */
export default function useChapter() {
  const [chapter, setChapter] = useState(CHAPTERS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setChapter(e.target.dataset.chapter)),
      { rootMargin: "-45% 0px -54% 0px" }
    );
    document.querySelectorAll("[data-chapter]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return chapter;
}
