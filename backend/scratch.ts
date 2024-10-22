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

const drumLoop = {
  bpm: 128,
  createdAt: new Date("2024-10-21T12:00:00Z"),
  updatedAt: new Date("2024-10-21T12:00:00Z"),
  tracks: {
    create: [
      {
        instrument: "kick",
        pattern: [true, false, true, false, true, false, true, false],
      },
      {
        instrument: "snare",
        pattern: [false, false, true, false, false, false, true, false],
      },
      {
        instrument: "hi-hat",
        pattern: [true, true, true, true, true, true, true, true],
      },
    ],
  },
};

// This works so we comment it out
// async function main() {
//   try {
//     const createdDrumLoop = await prisma.drumLoop.create({
//       data: drumLoop,
//       include: { tracks: true },
//     });

//     console.log("DrumLoop created:", createdDrumLoop);
//   } catch (error) {
//     console.error("Error creating DrumLoop:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/* Lets look at the response data */
/*
Received drum loop data: {
    bpm: 128,
    tracks: [
      {
        name: "Kick",
        pattern: [
          false, false, false, false, false, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false, false, false
        ],
        muted: false,
      }, {
        name: "Snare",
        pattern: [
          false, false, false, false, false, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false, false, false
        ],
        muted: false,
      }, {
        name: "Clap",
        pattern: [
          false, false, false, false, false, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false, false, false
        ],
        muted: false,
      }, {
        name: "Hat",
        pattern: [
          true, true, false, false, false, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false, false, false, false,
          false, false, false, false, false, false, false, false, false, false
        ],
        muted: false,
      }
    ],
  }
*/
