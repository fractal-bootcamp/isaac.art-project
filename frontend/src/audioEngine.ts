import { Howl } from "howler";
import { DrumLoop } from "./DrumLoopLogic";

type HowlsMap = { [key: string]: Howl };

class AudioEngine {
  private howls: HowlsMap = {};
  private drumLoop: DrumLoop;
  private isPlaying: boolean = false;
  private bpm: number;
  private noteIndex: number = 0;
  private nextNoteTime: number = 0;
  private schedulerTimerId: number | null = null;
  private readonly scheduleAheadTime: number = 100; // ms

  constructor(drumLoop: DrumLoop) {
    this.drumLoop = drumLoop;
    this.bpm = drumLoop.bpm;
    this.loadSamples();
  }

  private loadSamples() {
    // Create a map of all unique track names to their audio IDs
    const sampleFiles = this.drumLoop.tracks.reduce(
      (acc, track) => ({
        ...acc,
        [track.name]: track.audioId,
      }),
      {} as Record<string, string>
    );

    // Load each unique sample
    Object.entries(sampleFiles).forEach(([name, audioId]) => {
      this.howls[name] = new Howl({
        src: [audioId],
        preload: true,
      });
    });
  }

  public updateDrumLoop(drumLoop: DrumLoop) {
    this.drumLoop = drumLoop;
    this.bpm = drumLoop.bpm;

    // Check if we need to load any new samples
    const currentSamples = Object.keys(this.howls);
    const newSamples = drumLoop.tracks
      .map((track) => track.name)
      .filter((name) => !currentSamples.includes(name));

    if (newSamples.length > 0) {
      const newSampleFiles = drumLoop.tracks
        .filter((track) => newSamples.includes(track.name))
        .reduce(
          (acc, track) => ({
            ...acc,
            [track.name]: track.audioId,
          }),
          {} as Record<string, string>
        );

      // Load any new samples
      Object.entries(newSampleFiles).forEach(([name, audioId]) => {
        this.howls[name] = new Howl({
          src: [audioId],
          preload: true,
        });
      });
    }
  }

  public play() {
    if (this.isPlaying) return;
    if (Object.keys(this.howls).length === 0) return;

    this.isPlaying = true;
    this.noteIndex = 0;
    this.nextNoteTime = performance.now();
    this.scheduler();
  }

  public stop() {
    this.isPlaying = false;
    if (this.schedulerTimerId !== null) {
      window.clearTimeout(this.schedulerTimerId);
      this.schedulerTimerId = null;
    }
  }

  private scheduler = () => {
    if (!this.isPlaying) return;

    const currentTime = performance.now();
    while (this.nextNoteTime < currentTime + this.scheduleAheadTime) {
      this.scheduleNotes(this.noteIndex, this.nextNoteTime);
      const sixteenthNoteDuration = (60 / this.bpm / 4) * 1000; // in ms
      this.nextNoteTime += sixteenthNoteDuration;
      this.noteIndex++;
    }

    this.schedulerTimerId = window.setTimeout(this.scheduler, 25);
  };

  private scheduleNotes(noteIndex: number, _time: number) {
    this.drumLoop.tracks.forEach((track) => {
      const patternIndex = noteIndex % track.pattern.length;
      if (track.pattern[patternIndex] && !track.muted) {
        const howl = this.howls[track.name];
        if (howl) {
          howl.play();
        }
      }
    });
  }
}

export default AudioEngine;
