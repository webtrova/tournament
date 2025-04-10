export * from "./teams";
export * from "./matches";

// Tournament Status
export enum TournamentStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

// Helper function to get tournament status
export const getTournamentStatus = (
  currentRound: number,
  totalTeams: number
): TournamentStatus => {
  if (currentRound === 1) return TournamentStatus.NOT_STARTED;
  if (Math.pow(2, totalTeams - currentRound) === 1)
    return TournamentStatus.COMPLETED;
  return TournamentStatus.IN_PROGRESS;
};
