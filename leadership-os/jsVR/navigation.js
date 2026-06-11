
// ============================================
// jsVR/navigation.js
// Navegación y flujo principal
// ============================================

// --------------------------------------------
// Mostrar pantalla
// --------------------------------------------

window.showScreen = function (name) {

    document
        .querySelectorAll('[id^="screen-"]')
        .forEach(function (screen) {

            screen.setAttribute('visible', false);

        });

    var target = document.getElementById('screen-' + name);

    if (target) {

        target.setAttribute('visible', true);

    }

    appState.screen = name;

};

// --------------------------------------------
// Volver al inicio
// --------------------------------------------

window.goWelcome = function () {

    showScreen('welcome');

    appState.agentHistory = [];

    appState.vrMood = 30;

};

// --------------------------------------------
// Pantalla de modo
// --------------------------------------------

window.goMode = function (menuType) {

    appState.activeMenu = menuType;

    if (menuType === 'interventions') {

        appState.currentIntervention =
            (typeof interventions !== 'undefined' && interventions[0])
                ? interventions[0]
                : null;

    }

    if (menuType === 'techniques') {

        appState.currentTechnique =
            (typeof techniques !== 'undefined' && techniques[0])
                ? techniques[0]
                : null;

    }

    if (typeof updateModeScreen === 'function') {

        updateModeScreen();

    }

    showScreen('mode');

};

// --------------------------------------------
// Learn Mode
// --------------------------------------------

window.goLearn = function () {

    appState.agentHistory = [];

    var intro =
        appState.activeMenu === 'interventions'
            ? 'Vamos a explorar las intervenciones de retencion. Con cual quieres empezar: Pulse Check, Anchoring, Stay Interview, o Tenure Renewal?'
            : 'Vamos a explorar las tecnicas de comunicacion. Cual te interesa practicar hoy?';

    showScreen('practice');

    setJuanMood('happy');

    setDialog('JUANJOLOTE', intro);

    speakVR(
        intro,
        'daniel',
        function () {

            setHUD('ready', 'Listo para responder');

        }
    );

    appState.agentHistory.push({

        role: 'assistant',

        content: intro

    });

};

// --------------------------------------------
// Work Together Mode
// --------------------------------------------

window.goWork = function () {

    appState.agentHistory = [];

    var intro =
        'Cuentame, que situacion tienes con un agente ahora mismo?';

    showScreen('practice');

    setJuanMood('talking');

    setDialog('JUANJOLOTE', intro);

    speakVR(
        intro,
        'daniel',
        function () {

            setHUD('ready', 'Listo para responder');

        }
    );

    appState.agentHistory.push({

        role: 'assistant',

        content: intro

    });

};

// --------------------------------------------
// Practice Mode
// --------------------------------------------

window.goPractice = function () {

    var arch = pickRandomArchetype();

    var scenario =
        pickRandomScenario(
            arch,
            appState.currentLevel
        );

    appState.currentArchetype = arch;

    appState.currentScenario = scenario;

    appState.agentHistory = [];

    appState.vrMood =
        (scenario && scenario.startMood)
            ? scenario.startMood
            : 30;

    appState.hingesOpened = [];

    appState.conversationClosed = false;

    if (typeof currentArchetype !== 'undefined') {

        currentArchetype = arch;

    }

    updateAgentAvatar(arch);

    updateVRMood(appState.vrMood);

    var opener =
        pickRandomOpener(
            arch,
            scenario
        );

    appState.agentHistory.push({

        role: 'assistant',

        content: opener

    });

    showScreen('practice');

    setDialog(

        arch.name.toUpperCase(),

        opener

    );

    speakVR(

        opener,

        getVoice('agent'),

        function () {

            setHUD(
                'ready',
                'Listo para hablar'
            );

        }

    );

};

// --------------------------------------------
// Pantalla de evaluación
// --------------------------------------------

window.goEval = async function () {

    showScreen('eval');

    var evalMoodEl =
        document.getElementById('eval-mood');

    if (evalMoodEl) {

        evalMoodEl.setAttribute(
            'text',
            'value',
            appState.vrMood + '%'
        );

    }

    setJuanMood('talking');

    var evalText =
        'Analiza esta conversacion de practica. ' +
        'Agente: ' +
        (
            (appState.currentArchetype &&
                appState.currentArchetype.name)
                || 'Agente'
        ) +
        ' (' +
        (
            (appState.currentArchetype &&
                appState.currentArchetype.trait)
                || ''
        ) +
        '). Mood final: ' +
        appState.vrMood +
        '/100. Historial: ' +
        appState.agentHistory.length +
        ' turnos. Da feedback en 3 puntos concretos en espanol, maximo 4 oraciones total. Se directo y especifico. No uses lenguaje generico de coaching.';

    try {

        var res =
            await fetch('/api/groq', {

                method: 'POST',

                headers: {

                    'Content-Type': 'application/json'

                },

                body: JSON.stringify({

                    model:
                        'llama-3.3-70b-versatile',

                    messages: [

                        {

                            role: 'system',

                            content:
                                'Eres Juanjolote, coach directo y honesto. Evalua conversaciones de practica de liderazgo. Espanol. Concreto. Sin formalidades.'

                        },

                        {

                            role: 'user',

                            content: evalText

                        },

                        ...appState.agentHistory.slice(-8)

                    ],

                    max_tokens: 200,

                    temperature: 0.7

                })

            });

        var data = await res.json();

        var feedback =
            (
                data.choices &&
                data.choices[0] &&
                data.choices[0].message &&
                data.choices[0].message.content
            ) ||
            'Sesion completada.';

        var feedbackEl =
            document.getElementById(
                'eval-feedback'
            );

        if (feedbackEl) {

            feedbackEl.setAttribute(

                'text',

                'value',

                feedback

            );

        }

        speakVR(

            feedback,

            getVoice('juan')

        );

    }
    catch (e) {

        var feedbackEl2 =
            document.getElementById(
                'eval-feedback'
            );

        if (feedbackEl2) {

            feedbackEl2.setAttribute(

                'text',

                'value',

                'Sesion completada. Buen trabajo.'

            );

        }

    }

};
