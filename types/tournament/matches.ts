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

export const createInitialRounds = (teams: Team[]): Tournament => {
  const matches: Match[] = [];
  const numTeams = teams.length;
  let matchIdCounter = 1;

  // Create initial matches (assuming a single-elimination style bracket for now)
  for (let i = 0; i < numTeams; i += 2) {
    if (i + 1 < numTeams) {
      matches.push({
        id: `W1-${matchIdCounter++}`,
        roundNumber: 1,
        team1: teams[i],
        team2: teams[i + 1],
        isCompleted: false,
        bracket: "winners",
        score: {
          team1Score: 0,
          team2Score: 0,
        },
      });
    }
  }

  const initialRound: Round = {
    roundNumber: 1,
    matches,
    isDoubleElimination: false,
    isChampionshipRound: false,
  };

  return {
    rounds: [initialRound],
    currentRound: 1,
    eliminatedTeams: [],
    championshipMatchesPlayed: 0,
  };
};
