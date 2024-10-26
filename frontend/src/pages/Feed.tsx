import { useState, useEffect } from 'react';
import { Post as PostComponent, Post as PostInterface } from './Builder';
import { useUser } from "@clerk/clerk-react";
import Clap from "../samples/Clap.wav";
import Hat from "../samples/Hat.wav";
import Kick from "../samples/Kick.wav";
import Snare from "../samples/Snare.wav";
import { DrumLoop, Track } from '../DrumLoopLogic';

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
        isLikedByUser?: boolean;
    }[];
}

const FeedPost = ({ post }: { post: DBResponse['body'][0] }) => {
    const { user } = useUser();
    const [likes, setLikes] = useState(post.likes ?? 0);
    const [isLiked, setIsLiked] = useState(post.isLikedByUser ?? false);  // Initialize with server value

    const drumLoop: DrumLoop = {
        bpm: post.bpm,
        tracks: post.tracks.map((track): Track => {
            const samples: { [key: string]: string } = {
                "Kick": Kick,
                "Snare": Snare,
                "Clap": Clap,
                "Hat": Hat
            };
            return {
                name: track.instrument,
                audioId: samples[track.instrument] || '',
                pattern: track.pattern,
                muted: track.muted
            };
        }),
        isPlaying: false,
        currentPlayIndex: 0
    };

    const handleLike = async () => {
        if (!user) return;

        try {
            const response = await fetch('http://localhost:3000/api/toggle-like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    drumLoopId: post.id,
                    userId: user.id
                }),
            });

            const data = await response.json();
            if (data.status === 200) {
                setLikes(data.body.likeCount);
                setIsLiked(data.body.liked);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const convertedPost: PostInterface = {
        id: post.id,
        title: post.title,
        pattern: drumLoop,
        username: post.username,
        likes: likes,
        isLiked: isLiked
    };

    return <PostComponent post={convertedPost} onLike={handleLike} />;
};

const Feed = () => {
    const { user } = useUser();
    const [posts, setPosts] = useState<DBResponse['body']>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Include userId in the request to get like status
                const response = await fetch(`http://localhost:3000/api/latest-loops${user ? `?userId=${user.id}` : ''}`);
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
    }, [user]); // Re-fetch when user changes

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