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
  const initialMatches: Match[] = [];
  const initialLoserMatches: Match[] = [];

  // Create initial matches in the winner's bracket
  let winnersMatchIdCounter = 1;
  for (let i = 0; i < numTeams; i += 2) {
    const matchId = `W1-${winnersMatchIdCounter++}`;
    const team1 = teams[i];
    const team2 = i + 1 < numTeams ? teams[i + 1] : null;
    const isBye = team2 === null;

    initialMatches.push(
      createMatch(matchId, 1, team1, team2, isBye, "winners")
    );
  }

  // Create initial (empty) matches in the loser's bracket
  // For simplicity, we'll create placeholders for the first round of losers
  let losersMatchIdCounter = 1;
  const numLosersMatches = Math.floor(numTeams / 2); // Roughly half the number of initial matches
  for (let i = 0; i < numLosersMatches; i++) {
    const matchId = `L1-${losersMatchIdCounter++}`;
    initialLoserMatches.push(
      createMatch(matchId, 1, null, null, true, "losers")
    );
  }

  const combinedMatches = [...initialMatches, ...initialLoserMatches];

  const initialRound: Round = {
    roundNumber: 1,
    matches: combinedMatches,
    isDoubleElimination: true,
    isChampionshipRound: false,
  };

  return {
    rounds: [initialRound],
    currentRound: 1,
    totalRounds: calculateTotalRounds(numTeams),
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

import { Match } from ".";

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
