
// ============================================
// jsVR/state.js
// Estado global de Neural Academy VR
// ============================================

// --------------------------------------------
// Estado principal de la aplicación
// --------------------------------------------

window.appState = {

    // Navegación
    screen: 'welcome',

    activeMenu: null,

    // Datos de práctica
    currentArchetype: null,

    currentScenario: null,

    currentLevel: 'novice',

    currentIntervention: null,

    currentTechnique: null,

    selectedTechnique: null,

    // Conversación
    agentHistory: [],

    // Métricas VR
    vrMood: 30,

    boxState: 'out',

    conversationClosed: false,

    hingesOpened: []

};

// --------------------------------------------
// Estado del micrófono
// --------------------------------------------

window.isRecording = false;

window.isProcessing = false;

// --------------------------------------------
// Objetos de audio
// --------------------------------------------

window.mediaRecorder = null;

window.audioChunks = [];

window.audioStream = null;

window.audioContext = null;

window.analyser = null;

window.silenceTimer = null;

// --------------------------------------------
// Configuración de detección de silencio
// --------------------------------------------

window.SILENCE_THRESHOLD = 38;

window.SILENCE_DURATION = 1900;

// --------------------------------------------
// Referencias de audio actuales
// --------------------------------------------

window.currentAudio = null;

window.currentAudioUrl = null;

// --------------------------------------------
// Estado de controladores VR
// --------------------------------------------

window.rightController = null;

window.leftController = null;

// --------------------------------------------
// Estado de sesión
// --------------------------------------------

window.sessionData = {

    token: localStorage.getItem('ldr_session_token') || null,

    refreshToken: localStorage.getItem('ldr_refresh_token') || null,

    gameId: localStorage.getItem('ldr_game_id') || null

};

// --------------------------------------------
// Utilidades de reset
// --------------------------------------------

window.resetConversationState = function () {

    appState.agentHistory = [];

    appState.vrMood = 30;

    appState.boxState = 'out';

    appState.conversationClosed = false;

    appState.hingesOpened = [];

};

window.resetPracticeState = function () {

    appState.currentArchetype = null;

    appState.currentScenario = null;

    resetConversationState();

};

window.resetAudioState = function () {

    isRecording = false;

    isProcessing = false;

    audioChunks = [];

    if (silenceTimer) {

        cancelAnimationFrame(silenceTimer);

        silenceTimer = null;
    }

};

// --------------------------------------------
// Debug opcional
// --------------------------------------------

window.debugState = function () {

    console.log('APP STATE', appState);

    console.log('SESSION', sessionData);

    console.log('RECORDING', isRecording);

    console.log('PROCESSING', isProcessing);

};
