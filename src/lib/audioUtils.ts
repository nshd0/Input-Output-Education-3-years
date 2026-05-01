/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export async function playRawPcm(base64Data: string, sampleRate: number = 24000) {
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Int16Array(len / 2);
  
  for (let i = 0; i < len; i += 2) {
    bytes[i / 2] = (binaryString.charCodeAt(i) & 0xFF) | (binaryString.charCodeAt(i + 1) << 8);
  }

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = audioCtx.createBuffer(1, bytes.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  for (let i = 0; i < bytes.length; i++) {
    // Convert 16-bit PCM to float range [-1, 1]
    channelData[i] = bytes[i] / 32768;
  }

  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  source.start();
  
  return new Promise<void>((resolve) => {
    source.onended = () => {
      audioCtx.close();
      resolve();
    };
  });
}
