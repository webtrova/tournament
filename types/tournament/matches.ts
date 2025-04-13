export const advanceToNextRound = (tournament: Tournament): Tournament => {
  const currentRound = tournament.rounds[tournament.currentRound - 1];
  const winnersBracketMatches: Match[] = [];
  const losersBracketMatches: Match[] = [];
  const championshipMatches: Match[] = [];

  // Process winners bracket
  const winnersAdvancing = currentRound.matches
    .filter((m) => m.bracket === "winners" && m.winner)
    .map((m) => m.winner!);

  // Get losers from winners bracket
  const losersFromWinners = currentRound.matches
    .filter((m) => m.bracket === "winners" && m.loser)
    .map((m) => m.loser!);

   // Check if this is the final round of both brackets (assuming last match is the final)
   const isWinnersBracketFinalRound =
     winnersAdvancing.length === 1 &&
     currentRound.matches.some((m) => m.bracket === "winners");
 
   const isLosersBracketFinalRound = currentRound.matches.every(
     (m) => m.bracket !== "winners" && m.winner
   );
 
   // Handle championship match creation
   if (isWinnersBracketFinalRound && isLosersBracketFinalRound) {
     const winnersBracketFinal = currentRound.matches.find(
       (m) => m.bracket === "winners"
     );
     const losersBracketFinal = currentRound.matches.find(
       (m) => m.bracket === "losers"
     );
 
     if (winnersBracketFinal && losersBracketFinal) {
       const winnersBracketFinalLoser =
         winnersBracketFinal.team1.id === winnersBracketFinal.winner?.id
           ? winnersBracketFinal.team2
           : winnersBracketFinal.team1;
       const losersBracketFinalWinner = losersBracketFinal.winner;
 
       if (losersBracketFinalWinner) {
         championshipMatches.push(
           createMatch(
             `C${tournament.currentRound + 1}-1`,
             tournament.currentRound + 1,
             winnersBracketFinalLoser,
             losersBracketFinalWinner,
             false,
             "championship"
           )
         );
       }
     }
   } else {
    // Create next round matches
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

     // Get winners from the losers bracket of the previous round
     const previousRoundNumber = tournament.currentRound - 1;
     const previousRound = tournament.rounds[previousRoundNumber - 1];
     const previousLosersBracketWinners = previousRound
       ? previousRound.matches
           .filter((m) => m.bracket === "losers" && m.winner)
           .map((m) => m.winner!)
       : [];
 
     const usedLosersBracketWinners = new Set<string>();
 
     // Create losers bracket matches, pairing losers from winners bracket with winners from losers bracket
     for (const loser of losersFromWinners) {
       const availableWinner = previousLosersBracketWinners.find(
         (winner) => !usedLosersBracketWinners.has(winner.id)
       );
 
       if (availableWinner) {
         const matchId = `L${tournament.currentRound + 1}-${
           losersBracketMatches.length + 1
         }`;
         losersBracketMatches.push(
           createMatch(
             matchId,
             tournament.currentRound + 1,
             loser,
             availableWinner,
             true,
             "losers"
           )
         );
         usedLosersBracketWinners.add(availableWinner.id);
      }
    }
  }

  // Update eliminated teams
  const newlyEliminatedTeams = currentRound.matches
    .filter((m) => m.bracket === "losers" && m.loser)
    .map((m) => m.loser!);

  const actuallyEliminated = newlyEliminatedTeams;

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

import { Team } from "./teams";
import { Match, Round, Tournament } from ".";

const createMatch = (
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
  team1: team1 || { id: "bye", name: "BYE", city: "", losses: 0 },
  team2: team2 || { id: "bye", name: "BYE", city: "", losses: 0 },
  isCompleted: false,
  isBye,
  bracket,
  score: { team1Score: 0, team2Score: 0 },
  nextMatchId,
  nextLoserMatchId,
});

export const createInitialRounds = (teams: Team[]): Tournament => {
  const numTeams = teams.length;
  const matches: Match[] = [];

  // Calculate the number of rounds in the winner's bracket
  const numWinnerRounds = Math.ceil(Math.log2(numTeams));
  const numInitialWinnerMatches = Math.pow(2, numWinnerRounds - 1);

  // Create the winner's bracket matches
  let winnerMatchIdCounter = 1;
  let loserMatchIdCounter = 1; // Initialize loser's bracket counter
  const winnerMatches: Match[] = [];

  // Create initial matches with byes if necessary
  let teamIndex = 0;
  for (let i = 0; i < numInitialWinnerMatches; i++) {
    const team1 = teams[teamIndex++] || null;
    const team2 = teams[teamIndex++] || null;
    const isBye = team1 === null || team2 === null;
    const matchId = `W1-${winnerMatchIdCounter++}`;
    // Calculate the corresponding loser's bracket match in round 2
    const nextLoserMatchId = `L2-${loserMatchIdCounter++}`;

    winnerMatches.push(
      createMatch(
        matchId,
        1,
        team1,
        team2,
        isBye,
        "winners",
        undefined, // No next winner match in the initial round
        nextLoserMatchId
      )
    );
  }
  matches.push(...winnerMatches);
  
  // Create initial matches in the loser's bracket (round 1)
  const initialLoserMatches: Match[] = [];
  let initialLoserMatchIdCounter = 1;
  const numInitialLoserMatches = Math.floor(numInitialWinnerMatches / 2); // Half the number of initial winner's bracket matches

  for (let i = 0; i < numInitialLoserMatches; i++) {
    const matchId = `L1-${initialLoserMatchIdCounter++}`;
    initialLoserMatches.push(
      createMatch(matchId, 1, null, null, true, "losers")
    ); // Initially empty matches
  }
  matches.push(...initialLoserMatches);

  // Create loser's bracket round 2 matches (where losers from winner's bracket enter)
  const loserRound2Matches: Match[] = [];
  let loserRound2MatchIdCounter = 1;
  for (let i = 0; i < numInitialWinnerMatches; i++) {
    const matchId = `L2-${loserRound2MatchIdCounter++}`;
    loserRound2Matches.push(
      createMatch(matchId, 2, null, null, true, "losers")
    ); // Initially empty matches, will be populated in advanceToNextRound
  }
  matches.push(...loserRound2Matches);

  const initialRound: Round = {
    roundNumber: 1,
    matches,
    isDoubleElimination: true,
    isChampionshipRound: false,
  };

  return {
    rounds: [initialRound],
    currentRound: 1,   
    eliminatedTeams: [],
    championshipMatchesPlayed: 0,
  };
};


function calculateTotalRounds(numTeams: number): number {
  const baseRounds = Math.ceil(Math.log2(numTeams));
  const loserRounds = (baseRounds - 1) * 2; 
  const championshipRounds = 1; 
  
  return baseRounds + loserRounds + championshipRounds;
}

import { Match, Tournament } from ".";

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

export interface Match {
  id: string;
  roundNumber: number;
  team1: Team;
  team2: Team;
  isCompleted: boolean;
  isBye?: boolean;
  winner?: Team;
  loser?: Team;
  bracket: "winners" | "losers" | "championship";
  score: { team1Score: number; team2Score: number };
  nextMatchId?: string;
  nextLoserMatchId?: string;
}
