import { useCallback, useRef, useState } from "react";

type Recorder = {
  stop: () => Promise<Blob>;
};

function encodeWav(chunks: Float32Array[], sampleRate: number, targetRate = 16000): Blob {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Float32Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.length;
  }

  const ratio = sampleRate / targetRate;
  const outLength = Math.max(1, Math.floor(merged.length / ratio));
  const samples = new Int16Array(outLength);
  for (let i = 0; i < outLength; i += 1) {
    const value = merged[Math.floor(i * ratio)] ?? 0;
    const clamped = Math.max(-1, Math.min(1, value));
    samples[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }

  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (pos: number, str: string) => {
    for (let i = 0; i < str.length; i += 1) view.setUint8(pos + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, targetRate, true);
  view.setUint32(28, targetRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);
  new Int16Array(buffer, 44).set(samples);

  return new Blob([buffer], { type: "audio/wav" });
}

async function startRecording(): Promise<Recorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const AudioCtx =
    window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  const source = ctx.createMediaStreamSource(stream);
  const node = ctx.createScriptProcessor(4096, 1, 1);
  const chunks: Float32Array[] = [];

  node.onaudioprocess = (event) => {
    chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
  };
  source.connect(node);
  node.connect(ctx.destination);

  return {
    stop: async () => {
      stream.getTracks().forEach((t) => t.stop());
      node.disconnect();
      source.disconnect();
      const blob = encodeWav(chunks, ctx.sampleRate);
      await ctx.close();
      return blob;
    },
  };
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  const step = 0x8000;
  for (let i = 0; i < buffer.length; i += step) {
    binary += String.fromCharCode(...buffer.subarray(i, i + step));
  }
  return btoa(binary);
}

export function useVoiceInput(onTranscript: (text: string) => void) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recorderRef = useRef<Recorder | null>(null);

  const transcribeRef = useRef<((data: { data: { audio: string } }) => Promise<{ text: string }>) | null>(null);

  const toggle = useCallback(
    async (transcribe: (args: { data: { audio: string } }) => Promise<{ text: string }>) => {
      transcribeRef.current = transcribe;
      setVoiceError(null);

      if (recording && recorderRef.current) {
        const recorder = recorderRef.current;
        recorderRef.current = null;
        setRecording(false);
        setTranscribing(true);
        try {
          const blob = await recorder.stop();
          if (blob.size < 2048) throw new Error("That recording was empty — please try again.");
          const audio = await blobToBase64(blob);
          const { text } = await transcribe({ data: { audio } });
          if (!text) throw new Error("I couldn't hear anything. Please try again.");
          onTranscript(text);
        } catch (err) {
          setVoiceError(err instanceof Error ? err.message : "Voice input failed.");
        } finally {
          setTranscribing(false);
        }
        return;
      }

      try {
        recorderRef.current = await startRecording();
        setRecording(true);
      } catch {
        setVoiceError("Microphone access is needed. Allow it in your browser settings.");
      }
    },
    [onTranscript, recording],
  );

  return { recording, transcribing, voiceError, toggle };
}
