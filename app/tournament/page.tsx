"use client";

import { TournamentBracket } from "@/components/tournament/TournamentBracket";
import {
  teams,
  createInitialRounds,
  Match,
  updateMatchScore,
  advanceToNextRound
} from "@/types/tournament";
import { useState, useCallback, useEffect } from "react";

export default function TournamentPage() {
  const [tournament, setTournament] = useState(() => {
    // Clear any cached state
    if (typeof window !== "undefined") {
      localStorage.removeItem("tournamentState");
    }
    return createInitialRounds(teams);
  });

  const handleMatchUpdate = useCallback((updatedMatch: Match) => {
    setTournament((currentTournament) => {
      // First, update the match with proper winner/loser logic
      const processedMatch = updateMatchScore(updatedMatch, updatedMatch.score);

      // Update the match in the current round
      const updatedTournament = {
        ...currentTournament,
        rounds: currentTournament.rounds.map((round) => ({
          ...round,
          matches: round.matches.map((match) =>
            match.id === processedMatch.id ? processedMatch : match
          )
        }))
      };

      // Check if all matches in the current round are completed
      const currentRound =
        updatedTournament.rounds[updatedTournament.currentRound - 1];
      const allMatchesCompleted = currentRound.matches.every(
        (match) => match.isCompleted
      );

      // If all matches are completed, advance to next round
      if (allMatchesCompleted) {
        return advanceToNextRound(updatedTournament);
      }

      return updatedTournament;
    });
  }, []);

  // Reset tournament handler
  const handleReset = useCallback(() => {
    // Reset all team losses
    teams.forEach((team) => (team.losses = 0));
    setTournament(createInitialRounds(teams));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tournament Bracket
          </h1>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reset Tournament
          </button>
        </div>
        <TournamentBracket
          tournament={tournament}
          onMatchUpdate={handleMatchUpdate}
        />

        {/* Tournament Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">Active Teams</h3>
            <p className="text-2xl text-blue-600">
              {teams.length - tournament.eliminatedTeams.length}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-900">Eliminated Teams</h3>
            <p className="text-2xl text-red-600">
              {tournament.eliminatedTeams.length}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900">Current Round</h3>
            <p className="text-2xl text-green-600">{tournament.currentRound}</p>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">
            Tournament Status
          </h3>
          <pre className="text-sm text-gray-600 overflow-auto">
            {JSON.stringify(
              {
                currentRound: tournament.currentRound,
                totalTeams: teams.length,
                eliminatedTeams: tournament.eliminatedTeams.length,
                matchesInCurrentRound:
                  tournament.rounds[tournament.currentRound - 1]?.matches.length
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
