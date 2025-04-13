export const advanceToNextRound = (tournament: Tournament): Tournament => {
  const currentRound = tournament.rounds[tournament.currentRound - 1];
  const championshipMatches: Match[] = [];

  const { winnersBracketMatches, losersBracketMatches, losersToSeed } =
    processWinnersBracket(currentRound, tournament.currentRound);

  const nextLosersBracketMatches = processLosersBracket(
    currentRound,
    tournament.currentRound,
    losersToSeed
  );

  // Check for championship match creation
  const isWinnersBracketFinalRound = winnersBracketMatches.length === 0; // Assuming no more matches in winner's bracket
  const isLosersBracketFinalRound =
    nextLosersBracketMatches.length === 0 &&
    currentRound.matches.some((m) => m.bracket === "losers" && m.isCompleted); // Assuming last match is the final

  if (isWinnersBracketFinalRound && isLosersBracketFinalRound) {
    const winnersBracketFinal = currentRound.matches.find(
      (m) => m.bracket === "winners" && m.isCompleted
    );
    const losersBracketFinal = currentRound.matches.find(
      (m) => m.bracket === "losers" && m.isCompleted
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
  }

  // Update eliminated teams
  const actuallyEliminated = currentRound.matches
    .filter((m) => m.bracket === "losers" && m.loser)
    .map((m) => m.loser!);


  return {
    ...tournament, 
    rounds: [
      ...tournament.rounds,
      ... (championshipMatches.length > 0 && !currentRound.isChampionshipRound ? 
        [{
          roundNumber: tournament.currentRound + 1,
          matches: championshipMatches,
          isDoubleElimination: true,
          isChampionshipRound: true,
          requiresRematch: losersBracketFinalWinner !== undefined // Rematch if winner from loser's bracket

        }]
        : []
      ),
      {
        roundNumber: tournament.currentRound + 1,
        matches: [
          ...winnersBracketMatches,
          ...nextLosersBracketMatches,
          ...championshipMatches,
        ],
          isDoubleElimination: true,
          isChampionshipRound: championshipMatches.length > 0 && currentRound.isChampionshipRound,
        }
    ],
    currentRound: tournament.currentRound + 1,
    eliminatedTeams: [...tournament.eliminatedTeams, ...actuallyEliminated],
    winner: (() => {
      if (currentRound.isChampionshipRound) {
        const championshipMatch = currentRound.matches.find(
          (m) => m.bracket === "championship" && m.isCompleted
        );
        if (championshipMatch) {
          return championshipMatch.winner;
        }
      }
      return undefined;
    })(),
  };
};


const processWinnersBracket = (
  currentRound: Round,
  currentRoundNumber: number
): {
  winnersBracketMatches: Match[];
  losersBracketMatches: Match[];
  losersToSeed: { matchId: string; loser: Team }[];
} => {
  const winnersBracketMatches: Match[] = [];
  const losersToSeed: { matchId: string; loser: Team }[] = [];
  const winnersAdvancing = currentRound.matches
    .filter((m) => m.bracket === "winners" && m.winner)
    .map((m) => m.winner!);
  const numAdvancing = winnersAdvancing.length;

  for (let i = 0; i < numAdvancing; i += 2) {
    if (i + 1 < numAdvancing) {
      const matchId = `W${currentRoundNumber + 1}-${i / 2 + 1}`;
      const nextMatchId = `W${currentRoundNumber + 2}-${Math.floor(i / 4) + 1}`;

      winnersBracketMatches.push(
        createMatch(
          matchId,
          currentRoundNumber + 1,
          winnersAdvancing[i],
          winnersAdvancing[i + 1],
          false,
          "winners",
          nextMatchId
        )
      );
    }
  }

  // Collect losers and their next loser match IDs
  currentRound.matches
    .filter((m) => m.bracket === "winners" && m.loser && m.nextLoserMatchId)
    .forEach((m) =>
      losersToSeed.push({
        matchId: m.nextLoserMatchId!,
        loser: m.loser!,
      })
    );

  return { winnersBracketMatches, losersBracketMatches: [], losersToSeed };
};

const processLosersBracket = (
  currentRound: Round,
  currentRoundNumber: number,
  losersToSeed: { matchId: string; loser: Team }[]
): Match[] => {
  const losersBracketMatches: Match[] = [];
  const nextRoundNumber = currentRoundNumber + 1;

  const losersSeedMap: { [matchId: string]: Team } = {};

  // Seed losers from winners bracket into loser's bracket
  losersToSeed.forEach(({ matchId, loser }) => {
    losersSeedMap[matchId] = loser;
  });

  if (currentRoundNumber === 1) {
    // In the first loser's bracket round, we expect the losersToSeed to fill the L2 matches.
    // However, we need to handle the L1 matches as well.

    // Create matches for winners of L1 to play losers from W1
    const losersBracketRound1Winners = currentRound.matches
      .filter((m) => m.bracket === "losers" && m.roundNumber === 1 && m.winner)
      .map((m) => m.winner!);

    let nextLoserMatchIdCounter = 1;
    losersBracketRound1Winners.forEach((winner) => {
      const matchId = `L${nextRoundNumber}-${nextLoserMatchIdCounter++}`;
      const seededLoser = losersSeedMap[matchId];
      if (seededLoser) {
        losersBracketMatches.push(
          createMatch(matchId, nextRoundNumber, winner, seededLoser, false, "losers")
        );
      }
    });
  } else {
     // In subsequent rounds, we pair the winners of the previous loser's bracket round.
     const losersBracketWinners = currentRound.matches
       .filter((m) => m.bracket === "losers" && m.winner)
       .map((m) => m.winner!);

     for (let i = 0; i < losersBracketWinners.length; i += 2) {
       if (i + 1 < losersBracketWinners.length) {
         const matchId = `L${nextRoundNumber}-${i / 2 + 1}`;
         losersBracketMatches.push(
           createMatch(matchId, nextRoundNumber, losersBracketWinners[i], losersBracketWinners[i + 1], false, "losers")
         );
       }
    }
  }
  return losersBracketMatches;
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
