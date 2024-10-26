import { useState, useEffect } from 'react';
import { Post as PostComponent, Post as PostInterface } from './Builder';
import Clap from "../samples/Clap.wav";
import Hat from "../samples/Hat.wav";
import Kick from "../samples/Kick.wav";
import Snare from "../samples/Snare.wav";
import { DrumLoop, Track } from '../DrumLoopLogic';

// Only define types that are specific to the API/DB structure
interface DBResponse {
    status: number;
    body: {
        id: string;
        title: string;
        username: string;
        bpm: number;
        tracks: { instrument: string; pattern: boolean[]; muted: boolean; }[];
        createdAt: string;
        likes?: number;
    }[];
}

// Feed Post wrapper to convert DB format to DrumLoop format
const FeedPost = ({ post }: { post: DBResponse['body'][0] }) => {

    // Convert DB format to DrumLoop format
    const convertTodrumLoop = (dbPost: DBResponse['body'][0]): DrumLoop => {
        const samples = {
            "Kick": Kick,
            "Snare": Snare,
            "Clap": Clap,
            "Hat": Hat
        } as const;

        return {
            bpm: dbPost.bpm,
            tracks: dbPost.tracks.map((track): Track => ({
                name: track.instrument,
                audioId: samples[track.instrument as keyof typeof samples],
                pattern: track.pattern,
                muted: track.muted
            })),
            isPlaying: false,
            currentPlayIndex: 0
        };
    };

    const convertedPost: PostInterface = {
        id: post.id,
        title: post.title,
        pattern: convertTodrumLoop(post),
        username: post.username,
        likes: post.likes ?? 0
    };

    return <PostComponent post={convertedPost} onLike={() => { }} />;

};

// Main Feed Component
const Feed = () => {
    const [posts, setPosts] = useState<DBResponse['body']>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/latest-loops');
                const data: DBResponse = await response.json();

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
                    <FeedPost key={post.id} post={post} />
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