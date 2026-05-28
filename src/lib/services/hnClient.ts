/**
 * HN-DB client placeholder.
 *
 * Today everything is mocked via localStorage + static data. When HN-DB is
 * ready, implement these methods to call the real backend and swap them in
 * inside userService / lessonService / etc.
 */

export interface HNClient {
  getCurrentUser(): Promise<unknown>;
  listLessons(): Promise<unknown[]>;
  listMissions(): Promise<unknown[]>;
  listProjects(): Promise<unknown[]>;
  awardXp(amount: number): Promise<void>;
}

export const hnClient: HNClient = {
  async getCurrentUser() { throw new Error("HN-DB not connected yet"); },
  async listLessons() { return []; },
  async listMissions() { return []; },
  async listProjects() { return []; },
  async awardXp() { /* noop until backend */ },
};
