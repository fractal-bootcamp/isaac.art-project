import { Elysia } from "elysia";
import cors from "@elysiajs/cors"; // Import CORS plugin
import { PrismaClient } from "@prisma/client";
import type { DrumLoop, Track } from "./types"; // Import your types

const prisma = new PrismaClient();
const app = new Elysia();

/* Alternative version using Elysia JS *
 * This is more for exploration than anything else */

// Enable CORS for all routes
app.use(
  cors({
    origin: "*", // Allow all origins (adjust as necessary for your setup)
  })
);

// POST endpoint for saving drum loop data
app.post(
  "/api/save-drum-loop",
  async ({ body }: { body: Omit<DrumLoop, "id"> }) => {
    try {
      const {
        bpm,
        tracks,
        username,
        title,
      }: { bpm: number; tracks: Track[]; username: string; title: string } =
        body;

      // Validate that each track conforms to the expected structure
      for (const track of tracks) {
        if (typeof track.name !== "string" || !Array.isArray(track.pattern)) {
          return {
            status: 400,
            body: { error: "Invalid track data" },
          };
        }
      }

      // Create the drum loop and related tracks in the database
      const createdDrumLoop = await prisma.drumLoop.create({
        data: {
          username, // Now coming from body
          title, // Now coming from body
          bpm,
          tracks: {
            create: tracks.map((track: Track) => ({
              instrument: track.name,
              pattern: track.pattern, // Storing the pattern array as JSON
              muted: false, // Default to false, since it's not part of Track interface
            })),
          },
        },
        include: {
          tracks: true, // Include tracks in the response
        },
      });

      // Log the successful creation of the drum loop
      console.log("Drum loop saved to the database:", createdDrumLoop);

      // Return created drum loop as a response
      return {
        status: 201,
        body: createdDrumLoop,
      };
    } catch (error) {
      console.error("Error saving drum loop:", error);
      return {
        status: 500,
        body: { error: "Internal server error" },
      };
    }
  }
);

// Modify the GET /api/latest-loops endpoint to include like information
app.get(
  "/api/latest-loops",
  async ({ query }: { query: { userId?: string } }) => {
    try {
      const recentDrumLoops = await prisma.drumLoop.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        include: {
          tracks: true,
          likes: true, // Include likes
        },
      });

      // Transform the response to include like count and user's like status
      const transformedLoops = recentDrumLoops.map((loop) => ({
        ...loop,
        likeCount: loop.likes.length,
        isLikedByUser: query.userId
          ? loop.likes.some((like) => like.userId === query.userId)
          : false,
        likes: undefined, // Remove the likes array from response
      }));

      return {
        status: 200,
        body: transformedLoops,
      };
    } catch (error) {
      console.error("Error retrieving recent drum loops:", error);
      return {
        status: 500,
        body: { error: "Internal server error" },
      };
    }
  }
);

interface ToggleLikeBody {
  drumLoopId: string;
  userId: string;
}

// Clean and simple toggle-like endpoint
app.post("/api/toggle-like", async ({ body }: { body: ToggleLikeBody }) => {
  try {
    const { drumLoopId, userId } = body;

    // Check if like already exists
    const existingLike = await prisma.like.findFirst({
      where: {
        drumLoopId,
        userId,
      },
    });

    // Toggle the like status
    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
    } else {
      await prisma.like.create({
        data: { drumLoopId, userId },
      });
    }

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { drumLoopId },
    });

    return {
      status: 200,
      body: {
        liked: !existingLike,
        likeCount,
      },
    };
  } catch (error) {
    return {
      status: 500,
      body: { error: "Internal server error" },
    };
  }
});

// Listen on port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
