import React, { useState, useEffect, useRef } from "react";
import Clap from "../samples/Clap.wav";
import Hat from "../samples/Hat.wav";
import Kick from "../samples/Kick.wav";
import Snare from "../samples/Snare.wav";
import { Track, DrumLoop } from "../DrumLoopLogic";
import AudioEngine from "../audioEngine";

const getNoteColor = (noteIndex: number, isActive: boolean) => {
    const isDarkGroup = Math.floor(noteIndex / 4) % 2 !== 0;
    if (isActive) {
        return isDarkGroup ? "#3a8a3d" : "#4caf50"; // Darker and lighter green
    } else {
        return isDarkGroup ? "#bdbdbd" : "#ddd"; // Darker and lighter gray
    }
};

// Optional: CSS for basic styling
const styles = {
    container: {
        padding: "20px",
        fontFamily: "Arial, sans-serif",
    },
    trackContainer: {
        display: "flex",
        alignItems: "center",
        marginBottom: "5px",
    },
    trackHeader: {
        display: "flex",
        alignItems: "center",
        marginBottom: "10px",
    },
    trackText: {
        width: 100,
        justifyContent: "center",
        display: "flex",
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
    bpmInput: {
        marginBottom: "20px",
        padding: "5px",
        fontSize: "16px",
        width: "100px",
    },
    shareButton: {
        padding: '10px 20px',
        backgroundColor: '#2196F3',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};

const DrumMachine: React.FC = () => {
    const [bpm, setBpm] = useState<number>(128);  // BPM state
    const [drumLoop, setDrumLoop] = useState<DrumLoop>({
        bpm: 128,
        tracks: [
            { name: "Kick", audioId: Kick, pattern: new Array(32).fill(false), muted: false },
            { name: "Snare", audioId: Snare, pattern: new Array(32).fill(false), muted: false },
            { name: "Clap", audioId: Clap, pattern: new Array(32).fill(false), muted: false },
            { name: "Hat", audioId: Hat, pattern: new Array(32).fill(false), muted: false },
        ],
        isPlaying: false,
        currentPlayIndex: 0,
    });
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const audioEngineRef = useRef<AudioEngine | null>(null);

    useEffect(() => {
        // Initialize AudioEngine
        audioEngineRef.current = new AudioEngine(drumLoop);
        return () => {
            // Cleanup on unmount
            if (audioEngineRef.current) {
                audioEngineRef.current.stop();
            }
        };
    }, []);

    useEffect(() => {
        // Update AudioEngine when drumLoop changes
        if (audioEngineRef.current) {
            audioEngineRef.current.updateDrumLoop(drumLoop);
        }
    }, [drumLoop]);

    const handleToggleNote = (trackIndex: number, noteIndex: number) => {
        setDrumLoop((prevLoop) => {
            const updatedTracks = prevLoop.tracks.map((track, idx) => {
                if (idx === trackIndex) {
                    const updatedPattern = [...track.pattern];
                    updatedPattern[noteIndex] = !updatedPattern[noteIndex];
                    return { ...track, pattern: updatedPattern };
                }
                return track;
            });
            return { ...prevLoop, tracks: updatedTracks };
        });
    };

    const handleToggleMute = (trackIndex: number) => {
        setDrumLoop((prevLoop) => {
            const updatedTracks = prevLoop.tracks.map((track, idx) => {
                if (idx === trackIndex) {
                    return { ...track, muted: !track.muted };
                }
                return track;
            });
            return { ...prevLoop, tracks: updatedTracks };
        });
    };

    const handlePlay = () => {
        if (!isPlaying && audioEngineRef.current) {
            audioEngineRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleStop = () => {
        if (isPlaying && audioEngineRef.current) {
            audioEngineRef.current.stop();
            setIsPlaying(false);
        }
    };

    const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);

        if (isNaN(value) || value < 1 || value > 10000) {
            setBpm(128); // Default to 128 if out of range or NaN
            setDrumLoop((prevLoop) => ({
                ...prevLoop,
                bpm: 128,
            }));
        } else {
            setBpm(value); // Update with valid value
            setDrumLoop((prevLoop) => ({
                ...prevLoop,
                bpm: value,
            }));
        }
    };

    // New function to share the drum loop configuration as JSON
    const handleShare = () => {
        const drumLoopData = {
            bpm: drumLoop.bpm,
            tracks: drumLoop.tracks.map((track) => ({
                name: track.name,
                pattern: track.pattern,
                muted: track.muted,
            })),
        };

        fetch('http://localhost:3000/api/save-drum-loop', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(drumLoopData),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    return (
        <div style={styles.container}>
            <h1>Drum Machine</h1>

            {/* BPM Input */}
            <div>
                <label htmlFor="bpm-input">BPM: </label>
                <input
                    type="number"
                    id="bpm-input"
                    value={bpm}
                    onChange={handleBpmChange}
                    style={styles.bpmInput}
                />
            </div>

            {drumLoop.tracks.map((track: Track, trackIndex: number) => (
                <div key={trackIndex} style={styles.trackContainer}>
                    <button
                        onClick={() => handleToggleMute(trackIndex)}
                        style={{
                            padding: "5px 10px",
                            cursor: "pointer",
                            backgroundColor: track.muted
                                ? "#f44336"
                                : "#4caf50",
                            color: "#fff",
                            width: 100,
                            border: "none",
                            borderRadius: "4px",
                        }}
                    >
                        {track.muted ? "Unmute" : "Mute"}
                    </button>
                    <span style={styles.trackText}>{track.name}</span>
                    <div style={styles.notesGrid}>
                        {track.pattern.map(
                            (note: boolean, noteIndex: number) => (
                                <button
                                    key={noteIndex}
                                    onClick={() =>
                                        handleToggleNote(trackIndex, noteIndex)
                                    }
                                    style={{
                                        ...styles.noteButton,
                                        backgroundColor: getNoteColor(
                                            noteIndex,
                                            note
                                        ),
                                    }}
                                ></button>
                            )
                        )}
                    </div>
                </div>
            ))}
            {/* Play Button */}
            <div style={styles.controls}>
                {!isPlaying ? (
                    <button onClick={handlePlay} style={styles.controlButton}>
                        Play
                    </button>
                ) : (
                    <button onClick={handleStop} style={styles.controlButton}>
                        Stop
                    </button>
                )}
            </div>

            {/* Share Button */}
            <div>
                <button onClick={handleShare} style={styles.shareButton}>
                    Share
                </button>
            </div>
        </div>
    );
};

export default DrumMachine;
