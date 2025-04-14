// src/lib/tournament.ts
import { Team } from "./teams";

export interface Match {
  id: string;
  roundNumber: number;
  team1: Team | null;
  team2: Team | null;
  isCompleted: boolean;
  isBye?: boolean;
  winner?: Team;
  loser?: Team;
  bracket: "winners" | "losers" | "championship";
  score: { team1Score: number; team2Score: number };
  nextMatchId?: string;
  nextLoserMatchId?: string;
}

export interface Round {
  roundNumber: number;
  matches: Match[];
  isDoubleElimination: boolean;
  isChampionshipRound: boolean;
}

export interface Tournament {
  rounds: Round[];
  currentRound: number;
  eliminatedTeams: Team[];
  championshipMatchesPlayed: number;
  winner?: Team;
}

export const createMatch = (
  id: string,
  roundNumber: number,
  team1: Team | null,
  team2: Team | null,
  isBye: boolean = false,
  bracket: "winners" | "losers" | "championship" = "winners",
  nextMatchId?: string,
  nextLoserMatchId?: string
): Match => ({
  id,
  roundNumber,
  team1,
  team2,
  isCompleted: isBye,
  isBye,
  bracket,
  winner: isBye ? (team1 || team2) : undefined,
  loser: isBye ? null : undefined,
  score: { team1Score: 0, team2Score: 0 },
  nextMatchId,
  nextLoserMatchId,
});

export const createInitialRounds = (teams: Team[]): Tournament => {
  const numTeams = teams.length;
  const matches: Match[] = [];
  const numRounds = Math.ceil(Math.log2(numTeams));
  
  const firstRoundMatches = Math.pow(2, numRounds - 1);
  let matchCounter = 1;
  
  for (let i = 0; i < firstRoundMatches; i++) {
    const team1 = teams[i * 2] || null;
    const team2 = teams[i * 2 + 1] || null;
    const isBye = !team1 || !team2;
    
    const matchId = `W1-${matchCounter}`;
    const nextMatchId = `W2-${Math.ceil(matchCounter / 2)}`;
    const nextLoserMatchId = `L1-${Math.ceil(matchCounter / 2)}`;
    
    matches.push(
      createMatch(
        matchId,
        1,
        team1,
        team2,
        isBye,
        "winners",
        nextMatchId,
        nextLoserMatchId
      )
    );
    matchCounter++;
  }

  return {
    rounds: [{
      roundNumber: 1,
      matches,
      isDoubleElimination: true,
      isChampionshipRound: false,
    }],
    currentRound: 1,
    eliminatedTeams: [],
    championshipMatchesPlayed: 0,
  };
};

export const updateMatchScore = (
  match: Match,
  newScore: { team1Score: number; team2Score: number }
): Match => {
  const updatedMatch = {
    ...match,
    score: newScore,
    isCompleted: newScore.team1Score !== newScore.team2Score,
    winner:
      newScore.team1Score > newScore.team2Score
        ? match.team1
        : newScore.team2Score > newScore.team1Score
        ? match.team2
        : undefined,
    loser:
      newScore.team1Score < newScore.team2Score
        ? match.team1
        : newScore.team2Score < newScore.team1Score
        ? match.team2
        : undefined,
  };

  return updatedMatch;
};

export const advanceToNextRound = (tournament: Tournament): Tournament => {
  const currentRound = tournament.rounds[tournament.rounds.length - 1];
  const nextRoundNumber = tournament.currentRound + 1;

  // Process completed matches
  const completedMatches = currentRound.matches.filter(m => m.isCompleted);

  // Track winners/losers from each bracket
  const winnersBracket = {
    winners: completedMatches
      .filter(m => m.bracket === "winners" && m.winner)
      .map(m => m.winner!),
    losers: completedMatches
      .filter(m => m.bracket === "winners" && m.loser)
      .map(m => m.loser!)
  };

  const losersBracket = {
    winners: completedMatches
      .filter(m => m.bracket === "losers" && m.winner)
      .map(m => m.winner!),
    losers: completedMatches
      .filter(m => m.bracket === "losers" && m.loser)
      .map(m => m.loser!)
  };

  // Create next round matches
  const nextRoundMatches: Match[] = [];

  // --- Winners Bracket ---
  if (winnersBracket.winners.length > 1) {
    for (let i = 0; i < winnersBracket.winners.length; i += 2) {
      if (i + 1 < winnersBracket.winners.length) {
        nextRoundMatches.push(
          createMatch(
            `W${nextRoundNumber}-${i/2 + 1}`,
            nextRoundNumber,
            winnersBracket.winners[i],
            winnersBracket.winners[i + 1],
            false,
            "winners",
            `W${nextRoundNumber + 1}-${i/4 + 1}`,
            `L${nextRoundNumber + 2}-${i/2 + 1}` // Losers will face these in 2 rounds
          )
        );
      }
    }
  }

  // --- Losers Bracket ---
  // Combine: 
  // - New losers from winners bracket (from 2 rounds ago)
  // - Winners from current losers bracket
  const newLosers = tournament.rounds
    .find(r => r.roundNumber === nextRoundNumber - 2)
    ?.matches
    .filter(m => m.bracket === "winners" && m.loser)
    .map(m => m.loser!) || [];

  const allLosersBracketContestants = [
    ...newLosers,
    ...losersBracket.winners
  ];

  // Pair them up
  for (let i = 0; i < allLosersBracketContestants.length; i += 2) {
    if (i + 1 < allLosersBracketContestants.length) {
      nextRoundMatches.push(
        createMatch(
          `L${nextRoundNumber}-${i/2 + 1}`,
          nextRoundNumber,
          allLosersBracketContestants[i],
          allLosersBracketContestants[i + 1],
          false,
          "losers",
          `L${nextRoundNumber + 1}-${i/4 + 1}`
        )
      );
    } else {
      // Carry forward with a bye
      nextRoundMatches.push(
        createMatch(
          `L${nextRoundNumber}-${i/2 + 1}`,
          nextRoundNumber,
          allLosersBracketContestants[i],
          null,
          true,
          "losers"
        )
      );
    }
  }

  // --- Championship Check ---
  let championshipMatches: Match[] = [];
  const isChampionshipRound = 
    winnersBracket.winners.length === 1 && 
    losersBracket.winners.length === 1 &&
    !currentRound.isChampionshipRound;

  if (isChampionshipRound) {
    championshipMatches.push(
      createMatch(
        `C${nextRoundNumber}-1`,
        nextRoundNumber,
        winnersBracket.winners[0],
        losersBracket.winners[0],
        false,
        "championship"
      )
    );
  }

  // Create next round
  const nextRound: Round = {
    roundNumber: nextRoundNumber,
    matches: [...nextRoundMatches, ...championshipMatches],
    isDoubleElimination: true,
    isChampionshipRound,
  };

  return {
    ...tournament,
    rounds: [...tournament.rounds, nextRound],
    currentRound: nextRoundNumber,
    eliminatedTeams: [
      ...tournament.eliminatedTeams,
      ...losersBracket.losers // Only teams with 2 losses
    ],
    championshipMatchesPlayed: isChampionshipRound 
      ? tournament.championshipMatchesPlayed + 1 
      : tournament.championshipMatchesPlayed,
  };
};