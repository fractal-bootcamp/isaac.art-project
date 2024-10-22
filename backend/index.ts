import { PrismaClient } from "@prisma/client";
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser"; // For parsing request bodies

const prisma = new PrismaClient();
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(cors());

// POST endpoint to save drum loop data
// POST endpoint to save drum loop data
app.post("/api/save-drum-loop", async (req: Request, res: Response) => {
  // FIX THIS!
  try {
    // Extract the drum loop data from the request body
    const { bpm, tracks } = req.body;

    if (!bpm || !tracks || !Array.isArray(tracks)) {
      return res.status(400).json({ error: "Invalid drum loop data" });
    }

    // Create the drum loop and related tracks in the database
    const createdDrumLoop = await prisma.drumLoop.create({
      data: {
        bpm,
        tracks: {
          create: tracks.map((track: any) => ({
            instrument: track.name, // Adjust field name if necessary
            pattern: track.pattern, // Storing the pattern array as JSON
            muted: track.muted || false,
          })),
        },
      },
      include: {
        tracks: true, // Include tracks in the response
      },
    });

    // Send the created drum loop as a response
    res.status(201).json(createdDrumLoop);
  } catch (error) {
    console.error("Error saving drum loop:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
