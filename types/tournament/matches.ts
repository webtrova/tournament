import { Team } from "./teams";

export interface Score {
  team1Score: number;
  team2Score: number;
}

export interface Match {
  id: string;
  round: number;
  team1: Team;
  team2: Team;
  score: Score;
  isCompleted: boolean;
  winner?: Team;
  loser?: Team;
  isDoubleElimination: boolean;
  bracket: "winners" | "losers" | "championship";
  nextMatchId?: string;
  nextLoserMatchId?: string;
  isChampionshipMatch?: boolean;
  requiresRematch?: boolean;
}

export interface Round {
  roundNumber: number;
  matches: Match[];
  isDoubleElimination: boolean;
  isChampionshipRound?: boolean;
}

export interface Tournament {
  rounds: Round[];
  currentRound: number;
  eliminatedTeams: Team[];
  winner?: Team;
  championshipMatchesPlayed?: number;
}

const POINTS_TO_WIN = 200;

export const createMatch = (
  id: string,
  round: number,
  team1: Team,
  team2: Team,
  isDoubleElimination: boolean,
  bracket: "winners" | "losers" | "championship" = "winners",
  nextMatchId?: string,
  nextLoserMatchId?: string,
  isChampionshipMatch?: boolean
): Match => ({
  id,
  round,
  team1,
  team2,
  score: { team1Score: 0, team2Score: 0 },
  isCompleted: false,
  isDoubleElimination,
  bracket,
  nextMatchId,
  nextLoserMatchId,
  isChampionshipMatch,
  requiresRematch: false
});

export const updateMatchScore = (match: Match, newScore: Score): Match => {
  const updatedMatch = { ...match, score: newScore };

  if (
    newScore.team1Score >= POINTS_TO_WIN ||
    newScore.team2Score >= POINTS_TO_WIN
  ) {
    const winner =
      newScore.team1Score >= POINTS_TO_WIN ? match.team1 : match.team2;
    const loser = winner === match.team1 ? match.team2 : match.team1;

    updatedMatch.winner = winner;
    updatedMatch.loser = loser;
    updatedMatch.isCompleted = true;

    // Handle championship match logic
    if (match.isChampionshipMatch) {
      if (match.bracket === "championship") {
        // If winners bracket champion wins, they win the tournament
        if (match.team1 === winner) {
          updatedMatch.requiresRematch = false;
        } else {
          // If losers bracket winner wins, they need to win again
          updatedMatch.requiresRematch = true;
        }
      }
    } else {
      // Regular match - update losses
      loser.losses++;
    }
  }

  return updatedMatch;
};

export const createInitialRounds = (teams: Team[]): Tournament => {
  // Reset all team losses
  teams.forEach((team) => (team.losses = 0));

  // Create first round matches for winners bracket
  const firstRoundMatches: Match[] = [];

  for (let i = 0; i < teams.length; i += 2) {
    const matchId = `W1-${i / 2 + 1}`;
    const nextMatchId = `W2-${Math.floor(i / 4) + 1}`;
    const nextLoserMatchId = `L1-${i / 2 + 1}`;

    firstRoundMatches.push(
      createMatch(
        matchId,
        1,
        teams[i],
        teams[i + 1],
        true,
        "winners",
        nextMatchId,
        nextLoserMatchId
      )
    );
  }

  return {
    rounds: [
      {
        roundNumber: 1,
        matches: firstRoundMatches,
        isDoubleElimination: true
      }
    ],
    currentRound: 1,
    eliminatedTeams: []
  };
};

export const advanceToNextRound = (tournament: Tournament): Tournament => {
  const currentRound = tournament.rounds[tournament.currentRound - 1];
  const winnersBracketMatches: Match[] = [];
  const losersBracketMatches: Match[] = [];
  const championshipMatches: Match[] = [];

  // Process winners bracket
  const winnersAdvancing = currentRound.matches
    .filter((m) => m.bracket === "winners" && m.winner)
    .map((m) => m.winner!);

  // Process losers bracket
  const losersAdvancing = currentRound.matches
    .filter((m) => m.bracket === "winners" && m.loser)
    .map((m) => m.loser!);

  // Handle championship matches
  if (
    winnersAdvancing.length === 1 &&
    currentRound.matches.some((m) => m.bracket === "losers")
  ) {
    const winnersBracketChampion = winnersAdvancing[0];
    const losersBracketWinner = currentRound.matches.find(
      (m) => m.bracket === "losers" && m.winner
    )?.winner;

    if (losersBracketWinner) {
      championshipMatches.push(
        createMatch(
          `C${tournament.currentRound + 1}-1`,
          tournament.currentRound + 1,
          winnersBracketChampion,
          losersBracketWinner,
          false,
          "championship",
          undefined,
          undefined,
          true
        )
      );
    }
  } else if (
    currentRound.isChampionshipRound &&
    currentRound.matches[0]?.requiresRematch
  ) {
    // Create rematch if needed (losers bracket winner won first championship match)
    championshipMatches.push(
      createMatch(
        `C${tournament.currentRound + 1}-2`,
        tournament.currentRound + 1,
        currentRound.matches[0].team1,
        currentRound.matches[0].winner!,
        false,
        "championship",
        undefined,
        undefined,
        true
      )
    );
  } else {
    // Create next round matches as before
    for (let i = 0; i < winnersAdvancing.length; i += 2) {
      if (i + 1 < winnersAdvancing.length) {
        const matchId = `W${tournament.currentRound + 1}-${i / 2 + 1}`;
        const nextMatchId = `W${tournament.currentRound + 2}-${
          Math.floor(i / 4) + 1
        }`;
        const nextLoserMatchId = `L${tournament.currentRound + 1}-${i / 2 + 1}`;

        winnersBracketMatches.push(
          createMatch(
            matchId,
            tournament.currentRound + 1,
            winnersAdvancing[i],
            winnersAdvancing[i + 1],
            false,
            "winners",
            nextMatchId,
            nextLoserMatchId
          )
        );
      }
    }

    // Create losers bracket matches
    for (let i = 0; i < losersAdvancing.length; i += 2) {
      if (i + 1 < losersAdvancing.length) {
        const matchId = `L${tournament.currentRound}-${i / 2 + 1}`;
        const nextMatchId = `L${tournament.currentRound + 1}-${
          Math.floor(i / 4) + 1
        }`;

        losersBracketMatches.push(
          createMatch(
            matchId,
            tournament.currentRound,
            losersAdvancing[i],
            losersAdvancing[i + 1],
            true,
            "losers",
            nextMatchId
          )
        );
      }
    }
  }

  // Update eliminated teams
  const newlyEliminatedTeams = currentRound.matches
    .filter((m) => m.bracket === "losers" && m.loser)
    .map((m) => m.loser!);

  // If we're in double elimination, teams aren't eliminated until they lose twice
  const actuallyEliminated = newlyEliminatedTeams.filter(
    (team) => team.losses >= 2
  );

  // Determine tournament winner
  let winner = undefined;
  if (currentRound.isChampionshipRound) {
    const championshipMatch = currentRound.matches[0];
    if (championshipMatch.winner && !championshipMatch.requiresRematch) {
      winner = championshipMatch.winner;
    }
  }

  return {
    ...tournament,
    rounds: [
      ...tournament.rounds,
      {
        roundNumber: tournament.currentRound + 1,
        matches: [
          ...winnersBracketMatches,
          ...losersBracketMatches,
          ...championshipMatches
        ],
        isDoubleElimination: tournament.currentRound === 1,
        isChampionshipRound: championshipMatches.length > 0
      }
    ],
    currentRound: tournament.currentRound + 1,
    eliminatedTeams: [...tournament.eliminatedTeams, ...actuallyEliminated],
    winner,
    championshipMatchesPlayed:
      championshipMatches.length > 0
        ? (tournament.championshipMatchesPlayed || 0) + 1
        : tournament.championshipMatchesPlayed
  };
};
