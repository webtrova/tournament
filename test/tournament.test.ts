import { advanceToNextRound, createInitialRounds, Match } from '../types/tournament/matches';

const teams = [
  { id: 'team1', name: 'Team 1', city: 'City 1', losses: 0 },
  { id: 'team2', name: 'Team 2', city: 'City 2', losses: 0 },
  { id: 'team3', name: 'Team 3', city: 'City 3', losses: 0 },
  { id: 'team4', name: 'Team 4', city: 'City 4', losses: 0 },
];

const simulateMatch = (match: Match, team1Score: number, team2Score: number): Match => {
  return {
    ...match,
    isCompleted: true,
    score: { team1Score, team2Score },
    winner: team1Score > team2Score ? match.team1 : match.team2,
    loser: team1Score < team2Score ? match.team1 : match.team2,
  };
};

describe('Tournament Logic', () => {
  // Test cases will be added here
  it('should create initial rounds correctly and simulate first round', () => {
    let tournament = createInitialRounds(teams);

    // Simulate match outcomes in the first round
    tournament.rounds[0].matches = tournament.rounds[0].matches.map(match => {
      if (match.id === 'W1-1') {
        return simulateMatch(match, 2, 1); // Team 1 wins
      } else if (match.id === 'W1-2') {
        return simulateMatch(match, 1, 2); // Team 4 wins
      }
      return match;
    });

    tournament = advanceToNextRound(tournament);

    expect(tournament.rounds.length).toBe(2);
  });
});