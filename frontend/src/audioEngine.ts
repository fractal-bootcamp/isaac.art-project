// audioEngine.ts
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
  private schedulerTimerId: NodeJS.Timeout | null = null;
  private readonly scheduleAheadTime: number = 100; // ms

  constructor(drumLoop: DrumLoop) {
    this.drumLoop = drumLoop;
    this.bpm = drumLoop.bpm;
    this.loadSamples();
  }

  private loadSamples() {
    const sampleNames = ["Kick", "Snare", "Clap", "Hat"] as const;
    const sampleFiles: Record<(typeof sampleNames)[number], string> = {
      Kick: this.drumLoop.tracks.find((track) => track.name === "Kick")!
        .audioId,
      Snare: this.drumLoop.tracks.find((track) => track.name === "Snare")!
        .audioId,
      Clap: this.drumLoop.tracks.find((track) => track.name === "Clap")!
        .audioId,
      Hat: this.drumLoop.tracks.find((track) => track.name === "Hat")!.audioId,
    };

    sampleNames.forEach((name) => {
      this.howls[name] = new Howl({
        src: [sampleFiles[name]],
        preload: true,
      });
    });
  }

  public updateDrumLoop(drumLoop: DrumLoop) {
    this.drumLoop = drumLoop;
    this.bpm = drumLoop.bpm;
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
    if (this.schedulerTimerId) {
      clearTimeout(this.schedulerTimerId);
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

    this.schedulerTimerId = setTimeout(this.scheduler, 25) as NodeJS.Timeout;
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
