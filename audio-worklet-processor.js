class PCMPlayerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.BUFFER_SIZE = 32768; // размер кольцевого буфера (0.7-1.5 сек)
    this.buffer = new Float32Array(this.BUFFER_SIZE);
    this.writePtr = 0;
    this.readPtr = 0;
    this.available = 0;
    this.underrunCount = 0;
    this.lastStatTime = 0;
    this.port.onmessage = (event) => {
      const data = event.data;
      for (let i = 0; i < data.length; i++) {
        if (this.available < this.BUFFER_SIZE) {
          this.buffer[this.writePtr] = data[i];
          this.writePtr = (this.writePtr + 1) % this.BUFFER_SIZE;
          this.available++;
        }
        // если буфер переполнен — новые данные игнорируются
      }
    };
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const channel = output[0];
    let underrunThisBlock = false;
    for (let i = 0; i < channel.length; i++) {
      if (this.available > 0) {
        channel[i] = this.buffer[this.readPtr];
        this.readPtr = (this.readPtr + 1) % this.BUFFER_SIZE;
        this.available--;
      } else {
        channel[i] = 0;
        underrunThisBlock = true;
      }
    }
    if (underrunThisBlock) {
      this.underrunCount++;
      this.port.postMessage({ underrun: true });
    }
    // Раз в 1 секунду отправлять статистику
    const now = this.currentFrame / sampleRate;
    if (now - this.lastStatTime > 1) {
      this.port.postMessage({ stat: { available: this.available, underruns: this.underrunCount } });
      this.underrunCount = 0;
      this.lastStatTime = now;
    }
    return true;
  }
}

registerProcessor('pcm-player-processor', PCMPlayerProcessor); 