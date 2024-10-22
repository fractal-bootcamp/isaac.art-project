import express from "express";
import cors from "cors";
import type { DrumLoop } from "../frontend/src/DrumLoopLogic";

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for drum loops
const drumLoops: DrumLoop[] = [];

// Apply CORS middleware
app.use(cors());

// Body parser middleware (JSON)
app.use(express.json());

// Save drum loop configuration
app.post("/api/save-drum-loop", (req, res) => {
  try {
    const drumLoopData = req.body;

    // Generate a simple ID
    const id = Math.random().toString(36).substring(2, 15);

    // Add timestamp and ID to the data
    const drumLoop = {
      id,
      ...drumLoopData,
      createdAt: new Date().toISOString(),
    };

    // Save to array
    drumLoops.push(drumLoop);

    res.json({
      success: true,
      message: "Drum loop saved successfully",
      id: id,
    });
  } catch (error) {
    console.error("Error saving drum loop:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save drum loop",
    });
  }
});

// Get all drum loops
app.get("/api/drum-loops", (req, res) => {
  res.json(drumLoops);
});

// Get drum loop by ID
app.get("/api/drum-loop/:id", (req, res) => {
  const { id } = req.params;
  const drumLoop = drumLoops.find((loop) => loop.id === id);

  if (drumLoop) {
    res.json(drumLoop);
  } else {
    res.status(404).json({
      success: false,
      message: "Drum loop not found",
    });
  }
});

// Delete drum loop
app.delete("/api/drum-loop/:id", (req, res) => {
  const { id } = req.params;
  const index = drumLoops.findIndex((loop) => loop.id === id);

  if (index !== -1) {
    drumLoops.splice(index, 1);
    res.json({
      success: true,
      message: "Drum loop deleted successfully",
    });
  } else {
    res.status(404).json({
      success: false,
      message: "Drum loop not found",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
