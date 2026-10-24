import { defineStore } from "pinia";
import apiHelper from "../../../helpers/apiHelper";

export const useFocusStore = defineStore("focus", {
  state: () => ({
    totalSeconds: 45 * 60,
    remainingSeconds: 45 * 60,
    isRunning: false,
    timerInterval: null,
    selectedPreset: 45,
    activeAmbient: null,
    ambientAudio: null,
    audioContext: null,
    audioNodes: [],
    isMuted: false,
    isFullscreen: false,
    showTodos: true,
    showAmbient: true,
    stats: {
      totalSessions: 0,
      totalMinutes: 0,
      totalHours: "0.0",
    },
    sessions: [],
  }),

  getters: {
    formattedTime(state) {
      const hours = Math.floor(state.remainingSeconds / 3600);
      const minutes = Math.floor((state.remainingSeconds % 3600) / 60);
      const secs = state.remainingSeconds % 60;

      if (hours > 0) {
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      }
      return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    },
    buttonText(state) {
      if (state.isRunning) return "Pause";
      if (state.remainingSeconds < state.totalSeconds && state.remainingSeconds > 0) return "Resume";
      return "Start Focus";
    },
    buttonIcon(state) {
      return state.isRunning ? "Ⅱ" : "▶";
    },
  },

  actions: {
    setIsFullscreen(status) {
      this.isFullscreen = Boolean(status);
    },

    toggleShowTodos() {
      this.showTodos = !this.showTodos;
    },

    toggleShowAmbient() {
      this.showAmbient = !this.showAmbient;
    },

    toggleFullscreen() {
      if (typeof document === "undefined") return;
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => console.log(err));
      } else {
        document.exitFullscreen().catch((err) => console.log(err));
      }
    },

    initFullscreenListener() {
      if (typeof document === "undefined") return;
      const updateState = () => {
        const isFull = Boolean(document.fullscreenElement);
        this.setIsFullscreen(isFull);
        if (isFull) {
          // When entering fullscreen, cards are hidden by default
          this.showTodos = false;
          this.showAmbient = false;
        } else {
          // When exiting fullscreen, restore visibility
          this.showTodos = true;
          this.showAmbient = true;
        }
      };
      document.addEventListener("fullscreenchange", updateState);
      updateState();
    },

    setPreset(minutes) {
      this.pauseTimer();
      this.selectedPreset = minutes;
      this.totalSeconds = minutes * 60;
      this.remainingSeconds = this.totalSeconds;
    },

    toggleTimer() {
      if (this.isRunning) {
        this.pauseTimer();
      } else {
        this.startTimer();
      }
    },

    startTimer() {
      if (this.remainingSeconds <= 0) {
        this.remainingSeconds = this.totalSeconds;
      }
      this.isRunning = true;

      this.timerInterval = setInterval(() => {
        if (this.remainingSeconds > 0) {
          this.remainingSeconds--;
        } else {
          this.finishTimer();
        }
      }, 1000);
    },

    pauseTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      this.isRunning = false;
    },

    async finishTimer() {
      this.pauseTimer();
      const minutesFinished = Math.max(1, Math.round(this.totalSeconds / 60));
      this.remainingSeconds = 0;

      if (!apiHelper.getAccessToken()) return;

      try {
        const response = await apiHelper.fetchData(`${DELCOM_BASEURL}/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ duration_minutes: minutesFinished }),
        });
        await apiHelper.handleResponse(response, "Gagal mencatat sesi fokus");
        await this.fetchSessions();
      } catch (err) {
        console.error("Failed to log focus session:", err);
      }
    },

    async fetchSessions() {
      if (!apiHelper.getAccessToken()) return;

      try {
        const res = await apiHelper.fetchData(`${DELCOM_BASEURL}/sessions`);
        const data = await apiHelper.handleResponse(res, "Gagal mengambil sesi fokus");
        if (data) {
          this.stats = data.stats || this.stats;
          this.sessions = data.sessions || [];
        }
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      }
    },


    // Ambient Sound System using YouTube Player and Web Audio synthesis
    toggleAmbient(soundType) {
      if (this.activeAmbient === soundType) {
        this.stopAmbient();
        return;
      }

      this.stopAmbient();
      this.activeAmbient = soundType;

      if (soundType === "relaxing_music" || soundType === "cafe") {
        // YouTube relaxing music: Merry-Go-Round of Life (Grissini Project) - https://youtu.be/J6qIzKxmW8Y
        this.playYouTubeAmbient("J6qIzKxmW8Y");
      } else if (soundType === "suasana_hutan" || soundType === "forest") {
        // YouTube suasana hutan: Forest Nature Ambience - https://youtu.be/eNUpTV9BGac
        this.playYouTubeAmbient("eNUpTV9BGac");
      } else {
        this.playSyntheticAmbient(soundType);
      }
    },

    loadYouTubeApi() {
      if (typeof window === "undefined") return Promise.resolve(null);
      if (window.YT && window.YT.Player) {
        return Promise.resolve(window.YT);
      }
      return new Promise((resolve) => {
        const existing = document.getElementById("youtube-api-script");
        if (!existing) {
          const tag = document.createElement("script");
          tag.id = "youtube-api-script";
          tag.src = "https://www.youtube.com/iframe_api";
          const firstScriptTag = document.getElementsByTagName("script")[0];
          if (firstScriptTag && firstScriptTag.parentNode) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
          } else {
            document.head.appendChild(tag);
          }
        }
        const prevOnReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (typeof prevOnReady === "function") prevOnReady();
          resolve(window.YT);
        };
        setTimeout(() => {
          if (window.YT) resolve(window.YT);
        }, 1500);
      });
    },

    async playYouTubeAmbient(videoId = "J6qIzKxmW8Y") {
      if (typeof window === "undefined" || typeof document === "undefined") return;

      // Ensure hidden container exists
      let container = document.getElementById("youtube-ambient-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "youtube-ambient-container";
        container.style.cssText =
          "position:fixed;bottom:-9999px;left:-9999px;width:10px;height:10px;opacity:0;pointer-events:none;z-index:-9999;";
        const playerDiv = document.createElement("div");
        playerDiv.id = "youtube-ambient-player";
        container.appendChild(playerDiv);
        document.body.appendChild(container);
      }

      try {
        const YT = await this.loadYouTubeApi();
        if (!YT) {
          this.playSyntheticAmbient("relaxing_music");
          return;
        }

        if (this.ambientAudio && typeof this.ambientAudio.loadVideoById === "function") {
          this.ambientAudio.loadVideoById({
            videoId,
            startSeconds: 0,
          });
          if (this.isMuted) {
            this.ambientAudio.mute();
          } else {
            this.ambientAudio.unMute();
            this.ambientAudio.setVolume(70);
          }
          this.ambientAudio.playVideo();
          return;
        }

        this.ambientAudio = new YT.Player("youtube-ambient-player", {
          height: "10",
          width: "10",
          videoId,
          playerVars: {
            autoplay: 1,
            loop: 1,
            playlist: videoId,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
          },
          events: {
            onReady: (event) => {
              if (this.isMuted) {
                event.target.mute();
              } else {
                event.target.unMute();
                event.target.setVolume(70);
              }
              event.target.playVideo();
            },
            onError: () => {
              // Fallback to synthetic calming chord pad
              this.playSyntheticAmbient("relaxing_music");
            },
          },
        });
      } catch (err) {
        console.warn("YouTube player fallback to synthetic:", err);
        this.playSyntheticAmbient("relaxing_music");
      }
    },

    stopAmbient() {
      // Pause YouTube player if active
      if (this.ambientAudio && typeof this.ambientAudio.pauseVideo === "function") {
        try {
          this.ambientAudio.pauseVideo();
        } catch (e) {}
      }

      if (this.audioNodes && this.audioNodes.length > 0) {
        this.audioNodes.forEach((node) => {
          try {
            if (node.stop) node.stop();
            if (node.disconnect) node.disconnect();
          } catch (e) {}
        });
        this.audioNodes = [];
      }
      if (this.audioContext && this.audioContext.state !== "closed") {
        try {
          this.audioContext.close();
        } catch (e) {}
        this.audioContext = null;
      }
      this.activeAmbient = null;
    },

    playSyntheticAmbient(type) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.audioContext = new AudioCtx();
        const ctx = this.audioContext;
        this.audioNodes = [];

        if (type === "relaxing_music" || type === "cafe") {
          // Relaxing Music: Soothing lush ambient pad with harmonic chords (A Major / F# Minor)
          const masterGain = ctx.createGain();
          masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, ctx.currentTime);
          masterGain.connect(ctx.destination);
          this.audioNodes.push(masterGain);

          // Chord notes: A2, E3, A3, C#4 (peaceful ambient harmony)
          const freqs = [110, 164.81, 220, 277.18];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const noteGain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = idx % 2 === 0 ? "sine" : "triangle";
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            // Subtle gentle detune for lush analog chorus effect
            osc.detune.setValueAtTime((idx - 1.5) * 4, ctx.currentTime);

            filter.type = "lowpass";
            filter.frequency.setValueAtTime(650, ctx.currentTime);

            noteGain.gain.setValueAtTime(0.35, ctx.currentTime);

            osc.connect(filter);
            filter.connect(noteGain);
            noteGain.connect(masterGain);

            osc.start(0);
            this.audioNodes.push(osc, filter, noteGain);
          });
        } else if (type === "suasana_hutan" || type === "forest") {
          // Suasana Hutan: Forest canopy wind rustle + ambient woodland tones
          const bufferSize = ctx.sampleRate * 2;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }

          const whiteNoise = ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          whiteNoise.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.setValueAtTime(750, ctx.currentTime);
          filter.Q.setValueAtTime(1.5, ctx.currentTime);

          const gainNode = ctx.createGain();
          gainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.12, ctx.currentTime);

          whiteNoise.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(ctx.destination);

          whiteNoise.start(0);
          this.audioNodes.push(whiteNoise, filter, gainNode);

          // Gentle forest harmonic resonant tone
          const birdOsc = ctx.createOscillator();
          const birdGain = ctx.createGain();
          birdOsc.type = "sine";
          birdOsc.frequency.setValueAtTime(1850, ctx.currentTime);
          birdGain.gain.setValueAtTime(this.isMuted ? 0 : 0.015, ctx.currentTime);

          birdOsc.connect(birdGain);
          birdGain.connect(ctx.destination);
          birdOsc.start(0);
          this.audioNodes.push(birdOsc, birdGain);
        } else {
          // Rain: Gentle soothing rainfall
          const bufferSize = ctx.sampleRate * 2;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }

          const whiteNoise = ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          whiteNoise.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(800, ctx.currentTime);

          const gainNode = ctx.createGain();
          gainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.16, ctx.currentTime);

          whiteNoise.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(ctx.destination);

          whiteNoise.start(0);
          this.audioNodes.push(whiteNoise, filter, gainNode);
        }
      } catch (err) {
        console.warn("Web audio unavailable", err);
      }
    },

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.ambientAudio) {
        try {
          if (this.isMuted) {
            if (typeof this.ambientAudio.mute === "function") this.ambientAudio.mute();
          } else {
            if (typeof this.ambientAudio.unMute === "function") this.ambientAudio.unMute();
            if (typeof this.ambientAudio.setVolume === "function") this.ambientAudio.setVolume(70);
          }
        } catch (e) {}
      }
      if (this.audioNodes && this.audioNodes.length > 2) {
        const gain = this.audioNodes[2];
        if (gain && gain.gain && this.audioContext) {
          gain.gain.setValueAtTime(this.isMuted ? 0 : 0.15, this.audioContext.currentTime);
        }
      }
    },
  },
});
