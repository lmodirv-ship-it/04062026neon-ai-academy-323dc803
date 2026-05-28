import { useEffect, useState } from "react";
import {
  contentEvent,
  getAllLessons,
  getAllMissions,
  getAllPaths,
  getAllProjects,
  getAllQuiz,
  getExtras,
  type ContentExtras,
} from "@/lib/services/contentService";

export function useContent() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick((t) => t + 1);
    window.addEventListener(contentEvent, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(contentEvent, h);
      window.removeEventListener("storage", h);
    };
  }, []);
  // tick is read so React tracks dependency
  void tick;
  return {
    paths: getAllPaths(),
    lessons: getAllLessons(),
    missions: getAllMissions(),
    quiz: getAllQuiz(),
    projects: getAllProjects(),
    extras: getExtras() as ContentExtras,
  };
}
