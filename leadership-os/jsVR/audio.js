
// ═══════════════════════════════════════════
// jsVR/audio.js
// Manejo centralizado de audio y TTS
// ═══════════════════════════════════════════

const AudioManager = (() => {

    let currentAudio = null;
    let isSpeaking = false;

    // ───────────────────────────────────────
    // Reproducir archivo de audio
    // ───────────────────────────────────────
    function play(src, onEnd = null) {

        stop();

        currentAudio = new Audio(src);

        currentAudio.onended = () => {
            isSpeaking = false;

            if (onEnd) {
                onEnd();
            }
        };

        currentAudio.onerror = (err) => {
            console.error("Error reproduciendo audio:", err);

            isSpeaking = false;

            if (onEnd) {
                onEnd();
            }
        };

        isSpeaking = true;
        currentAudio.play();
    }

    // ───────────────────────────────────────
    // Detener audio actual
    // ───────────────────────────────────────
    function stop() {

        if (!currentAudio) return;

        currentAudio.pause();
        currentAudio.currentTime = 0;

        currentAudio = null;
        isSpeaking = false;
    }

    // ───────────────────────────────────────
    // Texto a voz usando SpeechSynthesis
    // ───────────────────────────────────────
    function speak(text, voiceName = null, onEnd = null) {

        if (!window.speechSynthesis) {

            console.warn("SpeechSynthesis no soportado.");

            if (onEnd) {
                onEnd();
            }

            return;
        }

        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        const voices = speechSynthesis.getVoices();

        if (voiceName) {

            const selectedVoice = voices.find(v =>
                v.name.toLowerCase().includes(voiceName.toLowerCase())
            );

            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        }

        utterance.onstart = () => {
            isSpeaking = true;
        };

        utterance.onend = () => {

            isSpeaking = false;

            if (onEnd) {
                onEnd();
            }
        };

        utterance.onerror = (err) => {

            console.error("Error TTS:", err);

            isSpeaking = false;

            if (onEnd) {
                onEnd();
            }
        };

        speechSynthesis.speak(utterance);
    }

    // ───────────────────────────────────────
    // Esperar a que carguen las voces
    // ───────────────────────────────────────
    function waitForVoices() {

        return new Promise(resolve => {

            const voices = speechSynthesis.getVoices();

            if (voices.length > 0) {
                resolve(voices);
                return;
            }

            speechSynthesis.onvoiceschanged = () => {
                resolve(speechSynthesis.getVoices());
            };
        });
    }

    // ───────────────────────────────────────
    // Obtener lista de voces
    // ───────────────────────────────────────
    function getVoices() {
        return speechSynthesis.getVoices();
    }

    // ───────────────────────────────────────
    // Estado
    // ───────────────────────────────────────
    function speaking() {
        return isSpeaking;
    }

    return {
        play,
        stop,
        speak,
        waitForVoices,
        getVoices,
        speaking
    };

})();
