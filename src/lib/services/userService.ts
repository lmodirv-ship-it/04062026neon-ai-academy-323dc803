// User + XP + streak service backed by localStorage.
// Swap implementation later to hit HN-DB via hnClient.

import { levelForXp, nextLevelXp } from "@/lib/data/mockData";

const KEY = "hn-ai:user:v1";

export type Badge =
  | "First Steps"
  | "Prompt Master"
  | "AI Beginner"
  | "Automation Starter"
  | "Daily Learner"
  | "7 Days Streak"
  | "AI Creator";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  xp: number;
  stars: number;
  streak: number;
  lastActiveDate: string; // ISO date (YYYY-MM-DD)
  badges: Badge[];
  completedLessons: string[];
  completedMissions: string[];
  completedProjects: string[];
  completedQuizzes: string[];
  weekProgress: boolean[]; // Mon..Sun
}

const defaultUser: User = {
  id: "me",
  name: "HN Master",
  email: "you@hn-ai.app",
  avatar: "👑",
  xp: 0,
  stars: 0,
  streak: 0,
  lastActiveDate: "",
  badges: [],
  completedLessons: [],
  completedMissions: [],
  completedProjects: [],
  completedQuizzes: [],
  weekProgress: [false, false, false, false, false, false, false],
};

export function getUser(): User {
  if (typeof window === "undefined") return defaultUser;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultUser;
    return { ...defaultUser, ...JSON.parse(raw) };
  } catch { return defaultUser; }
}

export function saveUser(u: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(u));
  window.dispatchEvent(new CustomEvent("hn-user-updated"));
}

export function addXp(amount: number, opts?: { badge?: Badge }) {
  const u = getUser();
  u.xp += amount;
  if (opts?.badge && !u.badges.includes(opts.badge)) u.badges.push(opts.badge);
  saveUser(u);
  return u;
}

export function completeLesson(lessonId: string, xpReward: number) {
  const u = getUser();
  if (!u.completedLessons.includes(lessonId)) {
    u.completedLessons.push(lessonId);
    u.xp += xpReward;
    if (u.completedLessons.length === 1 && !u.badges.includes("First Steps")) u.badges.push("First Steps");
  }
  touchStreak(u);
  saveUser(u);
  return u;
}

export function completeMission(missionId: string, xpReward: number) {
  const u = getUser();
  if (!u.completedMissions.includes(missionId)) {
    u.completedMissions.push(missionId);
    u.xp += xpReward;
    u.stars += 1;
    if (!u.badges.includes("Daily Learner")) u.badges.push("Daily Learner");
  }
  touchStreak(u);
  saveUser(u);
  return u;
}

export function completeProject(projectId: string, xpReward: number) {
  const u = getUser();
  if (!u.completedProjects.includes(projectId)) {
    u.completedProjects.push(projectId);
    u.xp += xpReward;
    if (!u.badges.includes("AI Creator")) u.badges.push("AI Creator");
  }
  touchStreak(u);
  saveUser(u);
  return u;
}

export function completeQuiz(quizId: string, score: number, total: number) {
  const u = getUser();
  if (!u.completedQuizzes.includes(quizId)) {
    u.completedQuizzes.push(quizId);
    u.xp += score * 5;
    if (score === total && !u.badges.includes("Prompt Master")) u.badges.push("Prompt Master");
  }
  touchStreak(u);
  saveUser(u);
  return u;
}

export function resetUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("hn-user-updated"));
}

function touchStreak(u: User) {
  const today = new Date().toISOString().slice(0, 10);
  if (u.lastActiveDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (u.lastActiveDate === yesterday) u.streak += 1;
  else u.streak = 1;
  u.lastActiveDate = today;
  const dow = new Date().getDay(); // 0=Sun
  const idx = dow === 0 ? 6 : dow - 1;
  u.weekProgress[idx] = true;
  if (u.streak >= 7 && !u.badges.includes("7 Days Streak")) u.badges.push("7 Days Streak");
}

export function getLevelInfo(xp: number) {
  const cur = levelForXp(xp);
  const next = nextLevelXp(xp);
  const prevXp = cur.xp;
  const pct = Math.min(100, Math.round(((xp - prevXp) / (next - prevXp)) * 100));
  return { level: cur.lvl, name: cur.name, xp, nextXp: next, pct };
}
