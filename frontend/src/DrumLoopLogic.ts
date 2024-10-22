// This is the code that defines the interface / objects of the drum loop
// The goal is to be able to model this clearly and effectively
// The data was modelled by hand, and then created with Claude/GPT

// Define the structure for a single track with a mute option
export interface Track {
  name: string; // Keep track name for user reference
  audioId: string; // Link to actual audio file
  pattern: boolean[];
  muted: boolean;
}

// Define the main DrumLoop interface
export interface DrumLoop {
  tracks: Track[];
  bpm: number;
  isPlaying: boolean;
  currentPlayIndex: number;
  id?: string;
}

// Create a function to initialize a new DrumLoop
export function createDrumLoop(): DrumLoop {
  return {
    tracks: [
      {
        name: "Kick",
        audioId: "",
        pattern: new Array(32).fill(false),
        muted: false,
      },
      {
        name: "Snare",
        audioId: "",
        pattern: new Array(32).fill(false),
        muted: false,
      },
      {
        name: "Clap",
        audioId: "",
        pattern: new Array(32).fill(false),
        muted: false,
      },
      {
        name: "Hat",
        audioId: "",
        pattern: new Array(32).fill(false),
        muted: false,
      },
    ],
    isPlaying: false,
    currentPlayIndex: 0,
    bpm: 120, // Added bpm as per the DrumLoop interface
  };
}

// Function to toggle a specific note on a specific track
export function toggleNote(
  drumLoop: DrumLoop,
  trackIndex: number,
  noteIndex: number
): void {
  const track = drumLoop.tracks[trackIndex];

  if (noteIndex >= 0 && noteIndex < track.pattern.length) {
    // Toggle the value of the note at noteIndex (true becomes false, and false becomes true)
    track.pattern[noteIndex] = !track.pattern[noteIndex];
  } else {
    console.error("Invalid note index");
  }
}

// Example usage
const myDrumLoop = createDrumLoop();

// Set an audioId for a track
myDrumLoop.tracks[0].audioId = "kick.mp3";

// Set a pattern for a track
myDrumLoop.tracks[0].pattern = [
  true,
  false,
  false,
  false,
  true,
  false,
  false,
  false,
  true,
  false,
  false,
  false,
  true,
  false,
  false,
  false,
  true,
  false,
  false,
  false,
  true,
  false,
  false,
  false,
  true,
  false,
  false,
  false,
  true,
  false,
  false,
  false,
];

// Toggle the note at index 4 (on the first track)
toggleNote(myDrumLoop, 0, 4); // The note at index 4 will change from true to false

// Toggle the note at index 7 (on the first track)
toggleNote(myDrumLoop, 0, 7); // The note at index 7 will change from false to true

console.log(myDrumLoop.tracks[0].pattern); // Check the updated pattern

// ------------------- Playback Functionality ------------------- //

// Variable to store the interval ID
let playInterval: number | null = null;

// Function to play the DrumLoop
export function playDrumLoop(drumLoop: DrumLoop, bpm: number = 120): void {
  if (drumLoop.isPlaying) return; // Prevent multiple intervals

  drumLoop.isPlaying = true;

  // Calculate the interval duration in milliseconds
  const intervalDuration = (60 / bpm / 2) * 1000; // Since there are 2 eighth notes per beat

  playInterval = window.setInterval(() => {
    drumLoop.tracks.forEach((track) => {
      if (
        track.pattern[drumLoop.currentPlayIndex] &&
        !track.muted &&
        track.audioId
      ) {
        const audio = new Audio(track.audioId);
        audio.currentTime = 0; // Rewind to start
        audio.play().catch((error) => {
          console.error(`Error playing ${track.audioId}:`, error);
        });
      }
    });

    // Move to the next step in the pattern
    drumLoop.currentPlayIndex = (drumLoop.currentPlayIndex + 1) % 32;
  }, intervalDuration);
}

// Function to stop the DrumLoop
export function stopDrumLoop(drumLoop: DrumLoop): void {
  if (playInterval !== null) {
    clearInterval(playInterval);
    playInterval = null;
  }
  drumLoop.isPlaying = false;
  drumLoop.currentPlayIndex = 0; // Reset to start
}

// ------------------- Usage Example ------------------- //

// Start playing the drum loop
playDrumLoop(myDrumLoop, 128); // 128 BPM

// To stop the drum loop, you can call:
stopDrumLoop(myDrumLoop);
