import { useState, useEffect, useRef } from 'react';
import AudioEngine from '../audioEngine';
import Clap from "../samples/Clap.wav";
import Hat from "../samples/Hat.wav";
import Kick from "../samples/Kick.wav";
import Snare from "../samples/Snare.wav";
import { DrumLoop } from '../DrumLoopLogic';
import { getNoteColor } from './Builder';

// DrumMachine Component (simplified for readonly playback)
const DrumMachine = ({
    pattern,
    isPlaying = false,
    onPlayToggle
}: {
    pattern: DrumLoop;
    isPlaying?: boolean;
    onPlayToggle?: (playing: boolean) => void;
}) => {
    const audioEngineRef = useRef<AudioEngine | null>(null);

    useEffect(() => {
        audioEngineRef.current = new AudioEngine(pattern);
        return () => {
            if (audioEngineRef.current) {
                audioEngineRef.current.stop();
            }
        };
    }, []);

    useEffect(() => {
        if (audioEngineRef.current) {
            audioEngineRef.current.updateDrumLoop(pattern);
        }
    }, [pattern]);

    useEffect(() => {
        if (audioEngineRef.current) {
            if (isPlaying) {
                audioEngineRef.current.play();
            } else {
                audioEngineRef.current.stop();
            }
        }
    }, [isPlaying]);

    const handlePlayToggle = () => {
        if (!onPlayToggle) return;
        onPlayToggle(!isPlaying);
    };

    return (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">BPM: {pattern.bpm}</span>
                </div>
                <button
                    onClick={handlePlayToggle}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {isPlaying ? 'Stop' : 'Play'}
                </button>
            </div>

            <div className="space-y-3">
                {pattern.tracks.map((track, trackIndex) => (
                    <div key={trackIndex} className="flex items-center gap-3">
                        <span className="w-16 text-sm">{track.name}</span>
                        <div className="grid grid-flow-col auto-cols-max gap-1">
                            {track.pattern.map((note, noteIndex) => (
                                <div
                                    key={noteIndex}
                                    className={`w-4 h-6 rounded ${getNoteColor(noteIndex, note)}`}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Post Component (simplified for feed display)
const Post = ({ post }: { post: any }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    // Convert DB format to DrumLoop format
    const convertTodrumLoop = (dbPost: any): DrumLoop => {
        const audioMap: { [key: string]: string } = {
            "Kick": Kick,
            "Snare": Snare,
            "Clap": Clap,
            "Hat": Hat
        };

        return {
            bpm: dbPost.bpm,
            tracks: dbPost.tracks.map((track: any) => ({
                name: track.instrument,
                audioId: audioMap[track.instrument],
                pattern: track.pattern,
                muted: track.muted
            })),
            isPlaying: false,
            currentPlayIndex: 0
        };
    };

    const drumLoopPattern = convertTodrumLoop(post);

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg mb-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    <p className="text-sm text-gray-600">Created by {post.username}</p>
                    <p className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <DrumMachine
                pattern={drumLoopPattern}
                isPlaying={isPlaying}
                onPlayToggle={setIsPlaying}
            />
        </div>
    );
};

// Main Feed Component
const Feed = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/latest-loops');
                const data = await response.json();

                if (data.status === 200) {
                    setPosts(data.body);
                } else {
                    setError('Failed to fetch drum loops');
                }
            } catch (err) {
                setError('Error connecting to server');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-4 text-center">
                <p>Loading drum patterns...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-4 text-center text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold text-center mb-8">
                Recent Drum Patterns
            </h1>
            <div className="space-y-8">
                {posts.map((post) => (
                    <Post key={post.id} post={post} />
                ))}
                {posts.length === 0 && (
                    <p className="text-center text-gray-500">
                        No drum patterns found
                    </p>
                )}
            </div>
        </div>
    );
};

export default Feed;