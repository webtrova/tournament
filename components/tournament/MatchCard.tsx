"use client";

import { Match } from "@/types/tournament/matches";
import { motion } from "framer-motion";
import { TeamScore } from "./TeamScore";
import { useState, useEffect } from "react";
import { Tournament } from "@/types/tournament/tournament"; // Import Tournament type

interface MatchCardProps {
  match: Match;
  tournament: Tournament; // Add tournament prop
  onScoreUpdate?: (
    matchId: string,
    team1Score: number,
    team2Score: number
  ) => void;
  isEditable?: boolean;
}

export const MatchCard = ({
  match,
  tournament, // Get tournament prop
  onScoreUpdate,
  isEditable = true
}: MatchCardProps) => {
  const [localScore, setLocalScore] = useState({
    team1Score: match.score.team1Score,
    team2Score: match.score.team2Score
  });

  // Update local score when match score changes externally
  useEffect(() => {
    setLocalScore(match.score);
  }, [match.score]);

  const handleScoreChange = (team: 1 | 2, value: string) => {
    const score = Math.max(0, Math.min(200, parseInt(value) || 0));

    const newScore =
      team === 1
        ? { team1Score: score, team2Score: localScore.team2Score }
        : { team1Score: localScore.team1Score, team2Score: score };

    setLocalScore(newScore);
    onScoreUpdate?.(match.id, newScore.team1Score, newScore.team2Score);
  };

  const isMatchActive = !match.isCompleted && isEditable;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: isMatchActive ? 1.02 : 1 }}
      className={`bg-white rounded-xl shadow-md p-4 border ${
        match.isCompleted
          ? match.bracket === "winners"
            ? "border-blue-300"
            : match.bracket === "losers"
            ? "border-red-300"
            : "border-purple-300"
          : "border-gray-100"
      } w-[300px]`}
    >
      <div className="mb-2 flex justify-between items-center">
        <span className="text-xs font-medium text-gray-500">
          Match {match.id}
        </span>
        {match.isDoubleElimination && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            Double Elimination
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <TeamScore
            team={match.team1}
            score={localScore.team1Score}
            isWinner={match.winner === match.team1}
            isEliminated={tournament.eliminatedTeams.includes(match.team1)}
            bracket={match.bracket}
          />
          {isMatchActive && (
            <input
              type="number"
              min="0"
              max="200"
              value={localScore.team1Score}
              onChange={(e) => handleScoreChange(1, e.target.value)}
              className="absolute right-2 top-2 w-16 text-right border rounded-md px-2 py-1"
              placeholder="0"
            />
          )}
        </div>

        <div className="relative">
          <TeamScore
            team={match.team2}
            score={localScore.team2Score}
            isWinner={match.winner === match.team2}
            isEliminated={tournament.eliminatedTeams.includes(match.team2)}
            bracket={match.bracket}
          />
          {isMatchActive && (
            <input
              type="number"
              min="0"
              max="200"
              value={localScore.team2Score}
              onChange={(e) => handleScoreChange(2, e.target.value)}
              className="absolute right-2 top-2 w-16 text-right border rounded-md px-2 py-1"
              placeholder="0"
            />
          )}
        </div>

        {match.isCompleted && match.winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-3 text-center py-2 rounded-lg text-sm font-medium ${
              match.bracket === "winners"
                ? "bg-blue-50 text-blue-700"
                : match.bracket === "losers"
                ? "bg-red-50 text-red-700"
                : "bg-purple-50 text-purple-700"
            }`}
          >
            {match.winner.name} Wins!
            {match.loser &&
              tournament.eliminatedTeams.includes(match.loser) && (
                <div className="text-xs text-red-600 mt-1 font-semibold">
                  {match.loser.name} Eliminated
                </div>
              )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
