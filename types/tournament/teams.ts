export interface Team {
  id: string;
  name: string;
  city: string;
  losses: number; // For double elimination tracking
}

// 30 MLB teams + 2 additional teams
export const teams: Team[] = [
  // American League East
  { id: "nyy", name: "Yankees", city: "New York", losses: 0 },
  { id: "bos", name: "Red Sox", city: "Boston", losses: 0 },
  { id: "tor", name: "Blue Jays", city: "Toronto", losses: 0 },
  { id: "tb", name: "Rays", city: "Tampa Bay", losses: 0 },
  { id: "bal", name: "Orioles", city: "Baltimore", losses: 0 },

  // American League Central
  { id: "cws", name: "White Sox", city: "Chicago", losses: 0 },
  { id: "cle", name: "Guardians", city: "Cleveland", losses: 0 },
  { id: "det", name: "Tigers", city: "Detroit", losses: 0 },
  { id: "kc", name: "Royals", city: "Kansas City", losses: 0 },
  { id: "min", name: "Twins", city: "Minnesota", losses: 0 },

  // American League West
  { id: "hou", name: "Astros", city: "Houston", losses: 0 },
  { id: "ana", name: "Angels", city: "Los Angeles", losses: 0 },
  { id: "oak", name: "Athletics", city: "Oakland", losses: 0 },
  { id: "sea", name: "Mariners", city: "Seattle", losses: 0 },
  { id: "tex", name: "Rangers", city: "Texas", losses: 0 },

  // National League East
  { id: "atl", name: "Braves", city: "Atlanta", losses: 0 },
  { id: "mia", name: "Marlins", city: "Miami", losses: 0 },
  { id: "nym", name: "Mets", city: "New York", losses: 0 },
  { id: "phi", name: "Phillies", city: "Philadelphia", losses: 0 },
  { id: "wsh", name: "Nationals", city: "Washington", losses: 0 },

  // National League Central
  { id: "chc", name: "Cubs", city: "Chicago", losses: 0 },
  { id: "cin", name: "Reds", city: "Cincinnati", losses: 0 },
  { id: "mil", name: "Brewers", city: "Milwaukee", losses: 0 },
  { id: "pit", name: "Pirates", city: "Pittsburgh", losses: 0 },
  { id: "stl", name: "Cardinals", city: "St. Louis", losses: 0 },

  // National League West
  { id: "ari", name: "Diamondbacks", city: "Arizona", losses: 0 },
  { id: "col", name: "Rockies", city: "Colorado", losses: 0 },
  { id: "lad", name: "Dodgers", city: "Los Angeles", losses: 0 },
  { id: "sd", name: "Padres", city: "San Diego", losses: 0 },
  { id: "sf", name: "Giants", city: "San Francisco", losses: 0 },

  // Additional Teams
  { id: "mtl", name: "Expos", city: "Montreal", losses: 0 }, // Historic MLB team
  { id: "prc", name: "Cangrejeros", city: "Puerto Rico", losses: 0 } // Caribbean baseball team
];
