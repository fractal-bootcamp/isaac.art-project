export interface Track {
  name: string; // Keep track name for user reference
  audioId: string; // Link to actual audio file
  pattern: boolean[];
  //   muted: boolean; // Not needed in the database
}

// Define the main DrumLoop interface
export interface DrumLoop {
  tracks: Track[];
  bpm: number;
  username: string;
  name: string;
  //   isPlaying: boolean; // NOTE - in the backend version, we omit isPlaying as we don't need it
  //   currentPlayIndex: number; // Again, we also don't really need this for the backend
  id: string;
}
