import React, { useState, useEffect, useRef } from "react";
import Clap from "../samples/Clap.wav";
import Hat from "../samples/Hat.wav";
import Kick from "../samples/Kick.wav";
import Snare from "../samples/Snare.wav";
import { Track, DrumLoop } from "../DrumLoopLogic";
import { Howl } from "howler";


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
};

const DrumMachine: React.FC = () => {
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

    const isPlayingRef = useRef<boolean>(false);
    const noteIndexRef = useRef<number>(0);
    const nextNoteTimeRef = useRef<number>(0);
    const drumLoopRef = useRef<DrumLoop>(drumLoop);

    const [howls, setHowls] = useState<{ [key: string]: Howl }>({});

    useEffect(() => {
        drumLoopRef.current = drumLoop;
    }, [drumLoop]);

    useEffect(() => {
        // Load sounds using Howler.js
        const loadSamples = () => {
            const sampleNames = ["Kick", "Snare", "Clap", "Hat"] as const;
            const sampleFiles: Record<typeof sampleNames[number], string> = {
                Kick,
                Snare,
                Clap,
                Hat,
            };

            const loadedHowls: { [key: string]: Howl } = {};
            sampleNames.forEach((name) => {
                loadedHowls[name] = new Howl({
                    src: [sampleFiles[name]],
                    preload: true,
                });
            });
            setHowls(loadedHowls);
        };

        loadSamples();
    }, []);

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
        if (isPlayingRef.current || !Object.keys(howls).length) return;

        setIsPlaying(true);
        isPlayingRef.current = true;

        const sixteenthNoteDuration = 60 / drumLoop.bpm / 4;

        noteIndexRef.current = 0;
        nextNoteTimeRef.current = performance.now();

        const scheduleAheadTime = 100; // milliseconds

        const scheduler = () => {
            const currentTime = performance.now();

            while (
                nextNoteTimeRef.current < currentTime + scheduleAheadTime
            ) {
                // Schedule the notes
                drumLoopRef.current.tracks.forEach((track) => {
                    if (
                        track.pattern[noteIndexRef.current % 32] &&
                        !track.muted
                    ) {
                        const howl = howls[track.name];
                        if (howl) {
                            howl.play();
                        }
                    }
                });

                nextNoteTimeRef.current += sixteenthNoteDuration * 1000; // convert to milliseconds
                noteIndexRef.current++;
            }

            if (isPlayingRef.current) {
                setTimeout(scheduler, 25); // Reduced interval for better responsiveness
            }
        };

        scheduler();
    };

    const handleStop = () => {
        setIsPlaying(false);
        isPlayingRef.current = false;
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
        </div>
    );
};

export default DrumMachine;