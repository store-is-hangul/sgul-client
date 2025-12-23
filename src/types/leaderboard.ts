export interface LeaderboardUser {
  userName: string;
  score: number;
  rank: number;
}

export interface LeaderboardResponse {
  ranks: LeaderboardUser[];
}
