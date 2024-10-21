import React, { useState, useEffect } from "react";
import {
    DrumLoop,
    Track,
    createDrumLoop,
    toggleNote,
    playDrumLoop,
    stopDrumLoop,
} from "../DrumLoopLogic";

// Importing the sample WAV files
import Clap from "../samples/Clap.wav";
import Hat from "../samples/Hat.wav";
import Kick from "../samples/Kick.wav";
import Snare from "../samples/Snare.wav";

// Optional: CSS for basic styling
const styles = {
    container: {
        padding: "20px",
        fontFamily: "Arial, sans-serif",
    },
    trackContainer: {
        marginBottom: "20px",
    },
    trackHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "10px",
    },
    notesGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(32, 30px)",
        gap: "5px",
    },
    noteButton: {
        width: "30px",
        height: "30px",
        cursor: "pointer",
        backgroundColor: "#ddd",
        border: "1px solid #999",
        borderRadius: "4px",
    },
    activeNote: {
        backgroundColor: "#4caf50",
    },
    controls: {
        marginTop: "30px",
    },
    controlButton: {
        padding: "10px 20px",
        marginRight: "10px",
        cursor: "pointer",
        backgroundColor: "#2196f3",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
    },
};

const DrumMachine: React.FC = () => {
    const [drumLoop, setDrumLoop] = useState<DrumLoop>(createDrumLoop());

    // Initialize audioId with sample WAV files on component mount
    useEffect(() => {
        const initializedLoop = { ...drumLoop };
        initializedLoop.tracks[0].audioId = Kick;
        initializedLoop.tracks[1].audioId = Snare;
        initializedLoop.tracks[2].audioId = Clap;
        initializedLoop.tracks[3].audioId = Hat;
        setDrumLoop(initializedLoop);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handler to toggle a note
    const handleToggleNote = (trackIndex: number, noteIndex: number) => {
        const updatedLoop = { ...drumLoop };
        toggleNote(updatedLoop, trackIndex, noteIndex);
        setDrumLoop(updatedLoop);
    };

    // Handler to toggle mute
    const handleToggleMute = (trackIndex: number) => {
        const updatedLoop = { ...drumLoop };
        const track = updatedLoop.tracks[trackIndex];
        track.muted = !track.muted;
        setDrumLoop(updatedLoop);
    };

    // Handler to play the loop
    const handlePlay = () => {
        playDrumLoop(drumLoop, 128); // You can adjust BPM as needed
        setDrumLoop({ ...drumLoop, isPlaying: true });
    };

    // Handler to stop the loop
    const handleStop = () => {
        stopDrumLoop(drumLoop);
        setDrumLoop({ ...drumLoop, isPlaying: false });
    };

    // Function to get the background color based on the note index and state
    const getNoteColor = (noteIndex: number, isActive: boolean) => {
        const isDarkGroup = Math.floor(noteIndex / 4) % 2 !== 0;
        if (isActive) {
            return isDarkGroup ? "#3a8a3d" : "#4caf50"; // Darker and lighter green
        } else {
            return isDarkGroup ? "#bdbdbd" : "#ddd"; // Darker and lighter gray
        }
    };

    return (
        <div style={styles.container}>
            <h1>Drum Machine</h1>
            {drumLoop.tracks.map((track: Track, trackIndex: number) => (
                <div key={trackIndex} style={styles.trackContainer}>
                    <div style={styles.trackHeader}>
                        <span>
                            {track.audioId.includes("Kick") && "Kick"}
                            {track.audioId.includes("Snare") && "Snare"}
                            {track.audioId.includes("Clap") && "Clap"}
                            {track.audioId.includes("Hat") && "Hat"}
                        </span>
                        <button
                            onClick={() => handleToggleMute(trackIndex)}
                            style={{
                                padding: "5px 10px",
                                cursor: "pointer",
                                backgroundColor: track.muted ? "#f44336" : "#4caf50",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            {track.muted ? "Unmute" : "Mute"}
                        </button>
                    </div>
                    <div style={styles.notesGrid}>
                        {track.pattern.map((note: boolean, noteIndex: number) => (
                            <button
                                key={noteIndex}
                                onClick={() => handleToggleNote(trackIndex, noteIndex)}
                                style={{
                                    ...styles.noteButton,
                                    backgroundColor: getNoteColor(noteIndex, note),
                                }}
                            ></button>
                        ))}
                    </div>
                </div>
            ))}

            <div style={styles.controls}>
                {!drumLoop.isPlaying ? (
                    <button onClick={handlePlay} style={styles.controlButton}>
                        Play
                    </button>
                ) : (
                    <button onClick={handleStop} style={styles.controlButton}>
                        Stop
                    </button>
                )}
            </div>
        </div>
    );
};

export default DrumMachine;