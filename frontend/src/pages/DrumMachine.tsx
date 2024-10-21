import React, { useState, useEffect, useRef } from "react";
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
        display: "flex",
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

interface Track {
    name: string;
    pattern: boolean[]; // length 32
    muted: boolean;
}

interface DrumLoop {
    tracks: Track[];
    bpm: number;
}

const DrumMachine: React.FC = () => {
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [buffers, setBuffers] = useState<{ [key: string]: AudioBuffer }>({});
    const [drumLoop, setDrumLoop] = useState<DrumLoop>({
        bpm: 128,
        tracks: [
            { name: "Kick", pattern: new Array(32).fill(false), muted: false },
            { name: "Snare", pattern: new Array(32).fill(false), muted: false },
            { name: "Clap", pattern: new Array(32).fill(false), muted: false },
            { name: "Hat", pattern: new Array(32).fill(false), muted: false },
        ],
    });
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const isPlayingRef = useRef<boolean>(false);
    const scheduledNodesRef = useRef<AudioBufferSourceNode[]>([]);
    const noteIndexRef = useRef<number>(0);
    const nextNoteTimeRef = useRef<number>(0);
    const drumLoopRef = useRef<DrumLoop>(drumLoop);

    useEffect(() => {
        drumLoopRef.current = drumLoop;
    }, [drumLoop]);

    useEffect(() => {
        const context = new AudioContext();
        setAudioContext(context);

        const sampleNames = ["Kick", "Snare", "Clap", "Hat"];
        const sampleFiles = {
            Kick,
            Snare,
            Clap,
            Hat,
        };

        const loadSamples = async () => {
            const buffers: { [key: string]: AudioBuffer } = {};
            for (const name of sampleNames) {
                const response = await fetch(sampleFiles[name]);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await context.decodeAudioData(arrayBuffer);
                buffers[name] = audioBuffer;
            }
            setBuffers(buffers);
        };

        loadSamples();

        // Cleanup function to close the AudioContext when component unmounts
        return () => {
            context.close();
        };
    }, []);

    const handleToggleNote = (trackIndex: number, noteIndex: number) => {
        const updatedLoop = { ...drumLoop };
        const track = updatedLoop.tracks[trackIndex];
        track.pattern[noteIndex] = !track.pattern[noteIndex];
        setDrumLoop(updatedLoop);
    };

    const handleToggleMute = (trackIndex: number) => {
        const updatedLoop = { ...drumLoop };
        const track = updatedLoop.tracks[trackIndex];
        track.muted = !track.muted;
        setDrumLoop(updatedLoop);
    };

    const handlePlay = () => {
        if (!audioContext || !buffers || isPlayingRef.current) return;

        setIsPlaying(true);
        isPlayingRef.current = true;
        scheduledNodesRef.current = [];

        const sixteenthNoteDuration = 60 / drumLoop.bpm / 4;

        noteIndexRef.current = 0;
        nextNoteTimeRef.current = audioContext.currentTime;

        const scheduleAheadTime = 60; // seconds

        const scheduler = () => {
            // Catch up if we're behind
            while (
                nextNoteTimeRef.current < audioContext.currentTime
            ) {
                nextNoteTimeRef.current += sixteenthNoteDuration;
                noteIndexRef.current++;
            }

            while (
                nextNoteTimeRef.current <
                audioContext.currentTime + scheduleAheadTime
            ) {
                // Schedule the notes
                drumLoopRef.current.tracks.forEach((track) => {
                    if (
                        track.pattern[noteIndexRef.current % 32] &&
                        !track.muted
                    ) {
                        const buffer = buffers[track.name];
                        const source = audioContext.createBufferSource();
                        source.buffer = buffer;
                        source.connect(audioContext.destination);
                        source.start(nextNoteTimeRef.current);
                        // Keep track of the scheduled nodes
                        scheduledNodesRef.current.push(source);
                    }
                });
                nextNoteTimeRef.current += sixteenthNoteDuration;
                noteIndexRef.current++;
            }
            if (isPlayingRef.current) {
                setTimeout(scheduler, 100); // Use setTimeout instead of requestAnimationFrame
            }
        };

        scheduler();
    };

    const handleStop = () => {
        if (!audioContext || !isPlayingRef.current) return;

        setIsPlaying(false);
        isPlayingRef.current = false;

        scheduledNodesRef.current.forEach((node) => {
            node.stop();
        });
        scheduledNodesRef.current = [];
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
