// Dynamic content layer — merges base mock data with admin-created extras
// stored in localStorage. Designed for unlimited expansion and easy swap
// to HN-DB later via src/lib/services/hnClient.ts.

import {
  learningPaths as basePaths,
  lessons as baseLessons,
  missions as baseMissions,
  quizQuestions as baseQuiz,
  miniProjects as baseProjects,
  type LearningPath,
  type Lesson,
  type Mission,
  type QuizQuestion,
  type MiniProject,
} from "@/lib/data/mockData";

const KEY = "hn-ai:content:v1";
const EVT = "hn-content-updated";

export interface ContentExtras {
  paths: LearningPath[];
  lessons: Lesson[];
  missions: Mission[];
  quiz: QuizQuestion[];
  projects: MiniProject[];
}

const empty: ContentExtras = { paths: [], lessons: [], missions: [], quiz: [], projects: [] };

function read(): ContentExtras {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return empty;
  }
}

function write(c: ContentExtras) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(c));
  window.dispatchEvent(new CustomEvent(EVT));
}

export const contentEvent = EVT;

export function getExtras() {
  return read();
}

export function getAllPaths(): LearningPath[] {
  return [...basePaths, ...read().paths];
}
export function getAllLessons(): Lesson[] {
  return [...baseLessons, ...read().lessons];
}
export function getAllMissions(): Mission[] {
  return [...baseMissions, ...read().missions].sort((a, b) => a.day - b.day);
}
export function getAllQuiz(): QuizQuestion[] {
  return [...baseQuiz, ...read().quiz];
}
export function getAllProjects(): MiniProject[] {
  return [...baseProjects, ...read().projects];
}

function rid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function addPath(p: Omit<LearningPath, "id">) {
  const c = read();
  c.paths.push({ ...p, id: rid("xp") });
  write(c);
}
export function addLesson(l: Omit<Lesson, "id">) {
  const c = read();
  c.lessons.push({ ...l, id: rid("xl") });
  write(c);
}
export function addMission(m: Omit<Mission, "id">) {
  const c = read();
  c.missions.push({ ...m, id: rid("xm") });
  write(c);
}
export function addQuiz(q: Omit<QuizQuestion, "id">) {
  const c = read();
  c.quiz.push({ ...q, id: rid("xq") });
  write(c);
}
export function addProject(p: Omit<MiniProject, "id">) {
  const c = read();
  c.projects.push({ ...p, id: rid("xj") });
  write(c);
}

export function removeExtra(type: keyof ContentExtras, id: string) {
  const c = read();
  // @ts-expect-error generic narrowing
  c[type] = c[type].filter((x: { id: string }) => x.id !== id);
  write(c);
}

export function resetExtras() {
  write(empty);
}
