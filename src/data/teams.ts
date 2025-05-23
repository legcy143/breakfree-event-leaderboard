// Define the team type
export type Team = {
  id?: string;  // MongoDB ObjectId
  name: string;
  companyName: string;
  score: string;
}

// Export empty teams data to start with
export const teamsData: Team[] = [
  // Teams will be added from the dashboard
];
