"use client";

import { useRef, useState, useCallback, useEffect } from "react";

// ── types ──────────────────────────────────────────────────────────────────
interface PitchFrame {
  time: number;
  freq: number;
}

interface MidiNote {
  midi: number;
  startTime: number;
  endTime: number;
}

// ── pitch detection (YIN algorithm) ───────────────────────────────────────
function yin(buffer: Float32Array, sampleRate: number): PitchFrame[] {
  const frameSize = 2048;
  const hopSize = 512;
  const threshold = 0.12;
  const minFreq = 50;
  const maxFreq = 1200;
  const minPeriod = Math.floor(sampleRate / maxFreq);
  const maxPeriod = Math.floor(sampleRate / minFreq);
  const pitches: PitchFrame[] = [];

  for (let i = 0; i + frameSize < buffer.length; i += hopSize) {
    const frame = buffer.subarray(i, i + frameSize);
    const halfFrame = Math.floor(frameSize / 2);
    const diff = new Float32Array(halfFrame);

    for (let tau = 1; tau < halfFrame; tau++) {
      let s = 0;
      for (let j = 0; j < halfFrame; j++) {
        const d = frame[j] - frame[j + tau];
        s += d * d;
      }
      diff[tau] = s;
    }

    const cmnd = new Float32Array(halfFrame);
    cmnd[0] = 1;
    let runSum = 0;
    for (let tau = 1; tau < halfFrame; tau++) {
      runSum += diff[tau];
      cmnd[tau] = diff[tau] / (runSum / tau || 1);
    }

    let tau = -1;
    for (let t = minPeriod; t < Math.min(maxPeriod, halfFrame - 1); t++) {
      if (cmnd[t] < threshold) {
        while (t + 1 < halfFrame && cmnd[t + 1] < cmnd[t]) t++;
        tau = t;
        break;
      }
    }

    let freq = 0;
    if (tau > 0) {
      const x0 = tau > 0 ? cmnd[tau - 1] : cmnd[tau];
      const x2 = tau < halfFrame - 1 ? cmnd[tau + 1] : cmnd[tau];
      const refined =
        tau + (x2 - x0) / (2 * (2 * cmnd[tau] - x2 - x0) || 1);
      freq = sampleRate / refined;
    }

    pitches.push({ time: i / sampleRate, freq });
  }

  return pitches;
}

// ── helpers ────────────────────────────────────────────────────────────────
function freqToMidi(freq: number): number {
  if (freq <= 0) return -1;
  return Math.round(69 + 12 * Math.log2(freq / 440));
}

function midiToName(n: number): string {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return names[n % 12] + (Math.floor(n / 12) - 1);
}

function pitchesToNotes(pitches: PitchFrame[], minNoteDur: number): MidiNote[] {
  const notes: MidiNote[] = [];
  let current: MidiNote | null = null;

  for (const p of pitches) {
    const midi = freqToMidi(p.freq);
    if (midi >= 21 && midi <= 108) {
      if (!current || current.midi !== midi) {
        if (current) notes.push(current);
        current = { midi, startTime: p.time, endTime: p.time + 0.05 };
      } else {
        current.endTime = p.time + 0.05;
      }
    } else {
      if (current) { notes.push(current); current = null; }
    }
  }
  if (current) notes.push(current);
  return notes.filter((n) => n.endTime - n.startTime >= minNoteDur);
}

function quantizeNotes(notes: MidiNote[], bpm: number, divs: number): MidiNote[] {
  if (divs === 0) return notes;
  const secPerBeat = 60 / bpm;
  const grid = secPerBeat / (divs / 4);
  return notes.map((n) => {
    const qs = Math.round(n.startTime / grid) * grid;
    const qe = Math.round(n.endTime / grid) * grid;
    return { ...n, startTime: qs, endTime: Math.max(qe, qs + grid) };
  });
}

function buildMidi(notes: MidiNote[], bpm: number): Uint8Array {
  const ticksPerBeat = 480;
  const tempo = Math.round(60_000_000 / bpm);

  function writeVarLen(v: number): number[] {
    const out: number[] = [];
    let b = v & 0x7f;
    v >>= 7;
    out.unshift(b);
    while (v > 0) { b = (v & 0x7f) | 0x80; v >>= 7; out.unshift(b); }
    return out;
  }

  const secPerTick = 60 / bpm / ticksPerBeat;

  interface MidiEvent {
    tick: number;
    type: number;
    note: number;
    vel: number;
  }

  const events: MidiEvent[] = [];
  for (const n of notes) {
    events.push({ tick: Math.round(n.startTime / secPerTick), type: 0x90, note: n.midi, vel: 80 });
    events.push({ tick: Math.round(n.endTime / secPerTick), type: 0x80, note: n.midi, vel: 0 });
  }
  events.sort((a, b) => a.tick - b.tick || a.type - b.type);

  const trackData: number[] = [];
  let lastTick = 0;
  for (const ev of events) {
    const delta = ev.tick - lastTick;
    lastTick = ev.tick;
    trackData.push(...writeVarLen(delta), ev.type, ev.note, ev.vel);
  }
  trackData.push(0, 0xff, 0x2f, 0x00);

  const tempoEvent = [0, 0xff, 0x51, 0x03, (tempo >> 16) & 0xff, (tempo >> 8) & 0xff, tempo & 0xff];
  const fullTrack = [...tempoEvent, ...trackData];

  const u32 = (v: number) => [(v >> 24) & 0xff, (v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff];
  const u16 = (v: number) => [(v >> 8) & 0xff, v & 0xff];

  const header = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, ...u16(0), ...u16(1), ...u16(ticksPerBeat)];
  const trkHeader = [0x4d, 0x54, 0x72, 0x6b, ...u32(fullTrack.length)];

  return new Uint8Array([...header, ...trkHeader, ...fullTrack]);
}

// ── piano roll canvas ──────────────────────────────────────────────────────
// Notes are foreground-role marks on the window surface, labelled in the
// background role of the same hue.
function readRollColors() {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string) => s.getPropertyValue(name).trim();
  return {
    bg: `rgb(${v("--bg-window")})`,
    lane: `rgb(${v("--text-primary")} / 0.05)`,
    note: `hsl(${v("--nk-h1")} ${v("--nk-s")} ${v("--nk-fg-l")})`,
    label: `hsl(${v("--nk-h1")} ${v("--nk-s")} ${v("--nk-bg-l")})`,
  };
}

function drawPianoRoll(
  canvas: HTMLCanvasElement,
  notes: MidiNote[],
  duration: number
) {
  const W = Math.max(600, duration * 80);
  const midiMin = Math.max(21, Math.min(...notes.map((n) => n.midi)) - 2);
  const midiMax = Math.min(108, Math.max(...notes.map((n) => n.midi)) + 2);
  const noteHeight = 12;
  const H = (midiMax - midiMin + 1) * noteHeight + 20;

  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d")!;
  const colors = readRollColors();
  const bg = colors.bg;
  const noteFill = colors.note;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  for (let m = midiMin; m <= midiMax; m++) {
    const y = H - 20 - (m - midiMin + 1) * noteHeight;
    const isBlack = [1, 3, 6, 8, 10].includes(m % 12);
    ctx.fillStyle = isBlack ? colors.lane : "rgba(0,0,0,0)";
    ctx.fillRect(0, y, W, noteHeight);
  }

  const secW = W / duration;
  for (const n of notes) {
    const x = n.startTime * secW;
    const w = Math.max(1, (n.endTime - n.startTime) * secW - 1);
    const y = H - 20 - (n.midi - midiMin + 1) * noteHeight + 1;

    ctx.fillStyle = noteFill;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.roundRect(x, y, w, noteHeight - 2, 2);
    ctx.fill();

    if (w > 28) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.label;
      ctx.font = "9px monospace";
      ctx.fillText(midiToName(n.midi), x + 3, y + noteHeight - 3);
    }
  }

  ctx.globalAlpha = 1;
}

// ── main component ─────────────────────────────────────────────────────────
export default function AudioToMidi() {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileMeta, setFileMeta] = useState("");
  const [bpm, setBpm] = useState(120);
  const [quantize, setQuantize] = useState(16);
  const [minNote, setMinNote] = useState(0.08);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [converting, setConverting] = useState(false);
  const [notes, setNotes] = useState<MidiNote[]>([]);
  const [noteCountLabel, setNoteCountLabel] = useState("");
  const [error, setError] = useState("");
  const [midiBytes, setMidiBytes] = useState<Uint8Array | null>(null);
  const [showRoll, setShowRoll] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const durationRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordStreamRef = useRef<MediaStream | null>(null);
  const recordChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playbackSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      mediaRecorderRef.current?.stop();
      recordStreamRef.current?.getTracks().forEach((t) => t.stop());
      playbackSourceRef.current?.stop();
      playbackCtxRef.current?.close();
    };
  }, []);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleFile = useCallback(async (file: File) => {
    setError("");
    setShowRoll(false);
    setMidiBytes(null);
    setNotes([]);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const ctx = new OfflineAudioContext(1, 1, 44100);
      const buf = await ctx.decodeAudioData(arrayBuffer);
      setAudioBuffer(buf);
      setFileName(file.name);
      setFileMeta(
        `${buf.duration.toFixed(1)}s · ${buf.sampleRate}Hz · ${buf.numberOfChannels}ch`
      );
    } catch {
      setError("Could not decode audio. Try a WAV or MP3 file.");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const startRecording = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordStreamRef.current = stream;
      const mr = new MediaRecorder(stream);
      recordChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) recordChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(recordChunksRef.current, { type: mr.mimeType || "audio/webm" });
        const ext = (mr.mimeType || "audio/webm").includes("ogg") ? "ogg" : "webm";
        const file = new File([blob], `recording.${ext}`, { type: blob.type });
        await handleFile(file);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } catch {
      setError("Microphone access denied or unavailable.");
    }
  }, [handleFile]);

  const stopRecording = useCallback(() => {
    if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
    recordStreamRef.current?.getTracks().forEach((t) => t.stop());
    recordStreamRef.current = null;
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      playbackSourceRef.current?.stop();
      playbackSourceRef.current = null;
      playbackCtxRef.current?.close();
      playbackCtxRef.current = null;
      setIsPlaying(false);
    } else if (audioBuffer) {
      const ctx = new AudioContext();
      const src = ctx.createBufferSource();
      src.buffer = audioBuffer;
      src.connect(ctx.destination);
      src.onended = () => { setIsPlaying(false); playbackCtxRef.current?.close(); };
      src.start();
      playbackCtxRef.current = ctx;
      playbackSourceRef.current = src;
      setIsPlaying(true);
    }
  }, [isPlaying, audioBuffer]);

  const runConvert = useCallback(async () => {
    if (!audioBuffer) return;
    setError("");
    setConverting(true);
    setShowRoll(false);
    setMidiBytes(null);

    try {
      setProgress(5); setProgressLabel("Mixing to mono…");
      await sleep(30);

      const numCh = audioBuffer.numberOfChannels;
      const len = audioBuffer.length;
      const mono = new Float32Array(len);
      for (let c = 0; c < numCh; c++) {
        const ch = audioBuffer.getChannelData(c);
        for (let i = 0; i < len; i++) mono[i] += ch[i] / numCh;
      }

      setProgress(20); setProgressLabel("Detecting pitch (YIN)…");
      await sleep(30);

      const pitches = yin(mono, audioBuffer.sampleRate);

      setProgress(75); setProgressLabel("Building notes…");
      await sleep(20);

      let detected = pitchesToNotes(pitches, minNote);
      detected = quantizeNotes(detected, bpm, quantize);

      if (detected.length === 0) {
        setError("No pitched notes detected. Try a file with clear monophonic content (vocals, whistling, flute, etc.).");
        setConverting(false);
        return;
      }

      setProgress(90); setProgressLabel("Encoding MIDI…");
      await sleep(20);

      const bytes = buildMidi(detected, bpm);
      setMidiBytes(bytes);
      setNotes(detected);
      durationRef.current = audioBuffer.duration;

      setNoteCountLabel(
        `${detected.length} notes · range ${midiToName(Math.min(...detected.map((n) => n.midi)))}–${midiToName(Math.max(...detected.map((n) => n.midi)))}`
      );
      setProgress(100); setProgressLabel(`Done — ${detected.length} notes found`);
      setShowRoll(true);

      setTimeout(() => {
        if (canvasRef.current) {
          drawPianoRoll(canvasRef.current, detected, audioBuffer.duration);
        }
      }, 50);
    } catch (e: unknown) {
      setError("Error during conversion: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setConverting(false);
    }
  }, [audioBuffer, bpm, quantize, minNote]);

  const downloadMidi = useCallback(() => {
    if (!midiBytes) return;
    const blob = new Blob([midiBytes.buffer as ArrayBuffer], { type: "audio/midi" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.[^.]+$/, "") + ".mid";
    a.click();
    URL.revokeObjectURL(url);
  }, [midiBytes, fileName]);

  const clearFile = () => {
    if (isPlaying) { playbackSourceRef.current?.stop(); playbackCtxRef.current?.close(); setIsPlaying(false); }
    if (isRecording) stopRecording();
    setAudioBuffer(null);
    setFileName("");
    setFileMeta("");
    setShowRoll(false);
    setMidiBytes(null);
    setNotes([]);
    setError("");
    setProgress(0);
    setProgressLabel("");
  };

  return (
    <div className="min-h-full">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">Audio → MIDI</h1>
        <p className="text-sm text-[rgb(var(--text-secondary))] mb-6">
          Monophonic pitch detection for vocals, whistling, or single instruments.
        </p>

        {/* drop zone */}
        {!audioBuffer && !isRecording && (
          <div className="mb-6 space-y-3">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="nk-group !p-10 text-center cursor-pointer border-2 border-dashed border-[rgb(var(--text-primary)/0.15)] hover:border-[hsl(var(--nk-h1)_var(--nk-s)_var(--nk-fg-l))] transition-colors"
            >
              <p className="text-sm font-semibold mb-1">Drop an audio file here, or click to choose one</p>
              <p className="text-xs text-[rgb(var(--text-secondary))]">
                WAV, MP3, OGG, M4A — monophonic works best
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
            <button
              onClick={startRecording}
              className="nk-btn nk-btn-lg w-full"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
              Record from microphone
            </button>
          </div>
        )}

        {/* recording indicator */}
        {isRecording && (
          <div className="mb-6 nk-group !p-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium">Recording…</span>
              <span className="text-sm tabular-nums text-[rgb(var(--text-secondary))]">
                {String(Math.floor(recordSeconds / 60)).padStart(2, "0")}:{String(recordSeconds % 60).padStart(2, "0")}
              </span>
            </div>
            <button
              onClick={stopRecording}
              className="nk-btn !bg-red-600 !text-white hover:!bg-red-700"
            >
              Stop recording
            </button>
          </div>
        )}

        {/* file info */}
        {audioBuffer && (
          <div className="nk-group !py-3 flex items-center gap-3 mb-6">
            <button
              onClick={togglePlayback}
              title={isPlaying ? "Stop" : "Play"}
              className="nk-btn nk-btn-primary nk-btn-icon !rounded-full shrink-0"
            >
              {isPlaying ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <rect x="1" y="1" width="4" height="10" rx="1" />
                  <rect x="7" y="1" width="4" height="10" rx="1" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M2 1.5l9 4.5-9 4.5V1.5z" />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{fileName}</p>
              <p className="text-xs text-[rgb(var(--text-secondary))]">{fileMeta}</p>
            </div>
            <button
              onClick={clearFile}
              className="nk-btn nk-btn-ghost shrink-0"
            >
              Clear
            </button>
          </div>
        )}

        {/* settings */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="nk-section-title block mb-1.5">BPM</label>
            <input
              type="number"
              value={bpm}
              min={40}
              max={300}
              onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
              className="nk-field w-full"
            />
          </div>
          <div>
            <label className="nk-section-title block mb-1.5">Quantize</label>
            <select
              value={quantize}
              onChange={(e) => setQuantize(parseInt(e.target.value))}
              className="nk-field w-full"
            >
              <option value={0}>None</option>
              <option value={16}>1/16 note</option>
              <option value={8}>1/8 note</option>
              <option value={4}>1/4 note</option>
            </select>
          </div>
          <div>
            <label className="nk-section-title block mb-1.5">Min note</label>
            <select
              value={minNote}
              onChange={(e) => setMinNote(parseFloat(e.target.value))}
              className="nk-field w-full"
            >
              <option value={0.05}>50ms</option>
              <option value={0.08}>80ms</option>
              <option value={0.12}>120ms</option>
              <option value={0.2}>200ms</option>
            </select>
          </div>
        </div>

        {/* convert button */}
        <button
          disabled={!audioBuffer || converting}
          onClick={runConvert}
          className="nk-btn nk-btn-primary nk-btn-lg w-full mb-4"
        >
          {converting ? "Converting…" : "Convert to MIDI"}
        </button>

        {/* progress */}
        {(converting || progress === 100) && (
          <div className="mb-4">
            <p className="text-xs text-[rgb(var(--text-secondary))] mb-1.5">{progressLabel}</p>
            <div className="nk-progress">
              <div
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* error */}
        {error && (
          <div className="nk-banner nk-banner-error mb-4">
            {error}
          </div>
        )}

        {/* piano roll */}
        {showRoll && notes.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-[rgb(var(--text-secondary))] mb-2">{noteCountLabel}</p>
            <div className="overflow-x-auto overflow-y-auto rounded-xl shadow-[inset_0_0_0_1px_rgb(var(--text-primary)/0.1)]">
              <canvas ref={canvasRef} className="block" />
            </div>
          </div>
        )}

        {/* download */}
        {midiBytes && (
          <button
            onClick={downloadMidi}
            className="nk-btn nk-btn-primary nk-btn-lg w-full"
          >
            Download .mid
          </button>
        )}
      </div>
    </div>
  );
}
