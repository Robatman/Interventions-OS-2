// ═══════════════════════════════════════════
//  interventions.js
//  Intervention definitions — Interventions OS v5
//  The 4 retention conversations, each with:
//  - Journey timing and owner
//  - Objective and success criteria  
//  - Agent behavior context (what the agent knows/feels at this point)
//  - Briefing scenarios per level
//  - Relevant techniques
// ═══════════════════════════════════════════

const INTERVENTIONS = {

  // ─────────────────────────────────────────
  pulse_check: {
    id: 'pulse_check',
    label: 'Pulse Check',
    day: 30,
    dayLabel: 'Día 30',
    icon: '💓',
    color: 'teal',
    owner: ['Recruiting', 'Training', 'Coach'],
    ownerLabel: 'Paulina (Recruiting) · Kat (Training) · Coach asignado',

    objective: `Primera revisión del agente recién ingresado. Detectar señales tempranas de riesgo de salida antes de que se conviertan en un problema. El agente NO sabe que esto es una intervención formal — para él es solo una conversación de seguimiento.`,

    successCriteria: [
      'El agente se siente escuchado, no evaluado',
      'Identificaste al menos una área de oportunidad o preocupación real',
      'El agente sale con más confianza en la empresa, no menos',
      'Si todo está bien, lo confirmaste genuinamente — no asumiste'
    ],

    // What the agent knows/feels at this point in the journey
    agentContext: `Es día 30. El agente lleva un mes en la empresa. Todavía está aprendiendo, todavía se está adaptando. Puede estar entusiasmado, abrumado, confundido, o simplemente tratando de sobrevivir la curva de aprendizaje. No sabe que esta conversación tiene un objetivo de retención. Para él, alguien de la empresa vino a saludarlo.`,

    // The trap — what practitioners often do wrong
    trap: `Asumir que "bien" significa bien. El agente nuevo a menudo dice que está bien porque no quiere parecer débil o problemático. El Pulse Check real es la conversación después de "estoy bien".`,

    relevantTechniques: ['active_listening', 'powerful_questions'],

    // Scenarios per level — what the practitioner is briefed on
    scenarios: {
      novice: [
        {
          id: 'pc_nov_1',
          text: "Es el día 30 de Karen en el call center. Sus métricas de entrenamiento son normales. No hay ningún incidente registrado. Vas a hacer su Pulse Check — una conversación de seguimiento para ver cómo está.",
          tags: ["Sin incidentes", "Métricas normales", "Primera conversación formal"],
          agentState: "adapting-okay",
          agentHiddenState: "tired-but-hopeful",
          startMood: 55,
          agentName: 'karen'
        },
        {
          id: 'pc_nov_2',
          text: "Carlos lleva 30 días. En su primera semana tuvo dificultades con el sistema pero mejoró. Esta semana estuvo callado. Vas a hacer su Pulse Check.",
          tags: ["Dificultad inicial superada", "Callado esta semana", "Sin reporte formal"],
          agentState: "guarded-tired",
          agentHiddenState: "doubting-fit",
          startMood: 35,
          agentName: 'carlos'
        }
      ],
      mid: [
        {
          id: 'pc_mid_1',
          text: "Miguel lleva 30 días. Ha estado diciendo que todo está bien en cada check-in grupal. Un compañero te comentó que lo vio frustrado en el break. Vas a hacer su Pulse Check.",
          tags: ["Dice que está bien", "Señal de un compañero", "Sin evidencia directa"],
          agentState: "performing-okay",
          agentHiddenState: "overwhelmed-hiding-it",
          startMood: 45,
          randomTriggers: true,
          agentName: 'miguel'
        }
      ],
      adv: [
        {
          id: 'pc_adv_1',
          text: "Es el día 30 de un agente nuevo. No tienes información específica — solo que es su Pulse Check programado. El briefing que recibiste de Recruiting dice 'sin novedades'.",
          tags: ["Sin información previa", "Briefing vacío", "Cualquier cosa puede pasar"],
          agentState: "unknown",
          agentHiddenState: "unknown",
          startMood: null,
          misleading: true,
          agentName: 'carlos'
        }
      ]
    }
  },

  // ─────────────────────────────────────────
  anchoring: {
    id: 'anchoring',
    label: 'Anchoring',
    day: 100,
    dayLabel: 'Día 100',
    icon: '⚓',
    color: 'purple',
    owner: ['Manager'],
    ownerLabel: 'Manager directo',

    objective: `Anclar al agente a la empresa cuando ya pasó la etapa inicial pero aún no está totalmente consolidado. Es una conversación de pertenencia, metas y compromiso. El agente ya sobrevivió los primeros 90 días — ahora hay que asegurarse de que quiera quedarse.`,

    successCriteria: [
      'El agente conectó su trabajo con algo que le importa personalmente',
      'Identificaste qué lo motiva más allá del salario',
      'El agente siente que tiene un futuro en la empresa, no solo un trabajo',
      'Salió de la conversación con más claridad sobre su trayectoria'
    ],

    agentContext: `Es día 100. El agente ya conoce el trabajo, ya tiene sus rutinas, ya formó opiniones sobre la empresa, el equipo, el manager. Puede estar consolidándose positivamente o puede estar entrando en la zona de "esto es solo un trabajo". No sabe que esta conversación tiene un objetivo de anclaje — para él, el manager quiso hablar.`,

    trap: `Convertir el Anchoring en una revisión de métricas. El agente ya sabe cómo va en números — lo que necesita es sentir que alguien se preocupa por él como persona, no como agente.`,

    relevantTechniques: ['active_listening', 'powerful_questions'],

    scenarios: {
      novice: [
        {
          id: 'anch_nov_1',
          text: "Carlos lleva 100 días. Sus métricas son estables. Ha integrado bien al equipo. No hay señales de alarma. Es momento de su Anchoring.",
          tags: ["Estable", "Integrado al equipo", "Sin señales de alarma"],
          agentState: "settled-neutral",
          agentHiddenState: "questioning-future",
          startMood: 50,
          agentName: 'carlos'
        }
      ],
      mid: [
        {
          id: 'anch_mid_1',
          text: "Valeria lleva 100 días. Empezó muy bien pero en las últimas semanas ha bajado un poco su energía. Sigue cumpliendo métricas. Es momento de su Anchoring.",
          tags: ["Inicio fuerte", "Energía bajando", "Métricas OK"],
          agentState: "slightly-withdrawn",
          agentHiddenState: "reconsidering-commitment",
          startMood: 38,
          randomTriggers: true,
          agentName: 'valeria'
        }
      ],
      adv: [
        {
          id: 'anch_adv_1',
          text: "Sandra lleva 100 días. Llegó con mucha experiencia de otra empresa. Ha sido crítica de algunos procesos internamente. Sus métricas son excelentes. Es momento de su Anchoring.",
          tags: ["Alta experiencia", "Crítica de procesos", "Excelente desempeño"],
          agentState: "confident-comparing",
          agentHiddenState: "evaluating-whether-to-stay",
          startMood: 40,
          misleading: true,
          agentName: 'sandra'
        }
      ]
    }
  },

  // ─────────────────────────────────────────
  stay_interview: {
    id: 'stay_interview',
    label: 'Stay Interview',
    day: 121,
    dayLabel: 'Día 121',
    icon: '🎯',
    color: 'amber',
    owner: ['HR'],
    ownerLabel: 'Andrea (HR)',

    objective: `Preguntarle al agente directamente por qué se queda, qué le gusta, qué cambiaría. Es la herramienta más poderosa para retención proactiva porque se hace ANTES de que piense en irse. No es una exit interview — es la conversación que evita que llegues a la exit interview.`,

    successCriteria: [
      'El agente dijo al menos una cosa genuina que aprecia de la empresa',
      'El agente mencionó al menos una cosa que cambiaría — y tú la escuchaste sin defenderte',
      'Saliste con información accionable para mejorar su experiencia',
      'El agente sintió que esta conversación era real, no un trámite de HR'
    ],

    agentContext: `Es día 121. El agente ya lleva 4 meses. Ya tiene opiniones formadas. Ya sabe qué le gusta y qué no. Puede estar satisfecho, puede estar empezando a dudar, o puede estar activamente considerando opciones. No sabe que esto es un Stay Interview — para él, HR quiso hablar.`,

    trap: `Hacer el Stay Interview como una encuesta. Preguntar "¿qué te gusta?" y anotar la respuesta sin profundizar. El Stay Interview real requiere escuchar lo que está detrás de la respuesta, no solo la respuesta.`,

    relevantTechniques: ['active_listening', 'powerful_questions'],

    scenarios: {
      novice: [
        {
          id: 'stay_nov_1',
          text: "Carlos lleva 121 días. Ha tenido altibajos pero en general está bien. Es momento de su Stay Interview. Tu objetivo es entender genuinamente qué lo mantiene aquí.",
          tags: ["4 meses", "Altibajos normales", "Primera Stay Interview"],
          agentState: "guarded-but-open",
          agentHiddenState: "has-real-concerns-not-shared",
          startMood: 42,
          agentName: 'carlos'
        }
      ],
      mid: [
        {
          id: 'stay_mid_1',
          text: "Valeria lleva 121 días. Empezó muy comprometida pero últimamente está más callada. Un compañero mencionó que Valeria dijo que 'extraña cómo era antes'. Es momento de su Stay Interview.",
          tags: ["Compromiso bajando", "Señal indirecta", "Algo cambió"],
          agentState: "withdrawn-quiet",
          agentHiddenState: "grieving-something-lost",
          startMood: 30,
          randomTriggers: true,
          agentName: 'valeria'
        }
      ],
      adv: [
        {
          id: 'stay_adv_1',
          text: "Miguel lleva 121 días. En la superficie todo está bien. Sus métricas son buenas. Pero tienes una corazonada. Es momento de su Stay Interview.",
          tags: ["Corazonada", "Sin evidencia", "Puede ser nada o puede ser todo"],
          agentState: "performing-well",
          agentHiddenState: "secretly-job-hunting",
          startMood: 48,
          misleading: true,
          agentName: 'miguel'
        }
      ]
    }
  },

  // ─────────────────────────────────────────
  tenure_renewal: {
    id: 'tenure_renewal',
    label: 'Tenure Renewal',
    day: 365,
    dayLabel: 'Día 365+',
    icon: '🏆',
    color: 'coral',
    owner: ['Manager', 'Training', 'Coach'],
    ownerLabel: 'Manager · Kat (Training) · Coach asignado — Comité',

    objective: `Reconocer y reforzar el compromiso del agente al cumplir un año. Es un momento de celebración, revisión de trayectoria y renovación del vínculo con la empresa. Es la única intervención en formato comité — el agente siente el peso institucional del reconocimiento.`,

    successCriteria: [
      'El agente se fue sintiendo genuinamente reconocido, no solo felicitado',
      'Identificaron juntos al menos un logro concreto del año',
      'El agente tiene claridad sobre qué sigue — desarrollo, metas, oportunidades',
      'El vínculo con la empresa se renovó, no solo se celebró'
    ],

    agentContext: `Es el día 365. El agente cumple un año. Tiene historia con la empresa, con el equipo, con los procesos. Ha visto cosas buenas y malas. Sabe cómo funciona realmente este lugar. El Tenure Renewal ES una intervención formal — el agente sabe que va a haber una conversación especial por su aniversario.`,

    trap: `Convertirlo en una ceremonia vacía. "Felicidades por tu año, aquí está tu reconocimiento, ¿alguna pregunta?" El agente necesita sentir que la conversación es sobre él específicamente — no un trámite que se hace con todos.`,

    relevantTechniques: ['active_listening', 'powerful_questions'],

    scenarios: {
      novice: [
        {
          id: 'ten_nov_1',
          text: "Carlos cumple un año hoy. Ha tenido un buen desempeño general. Hay algunas áreas de mejora pero en general es un agente que vale la pena retener. Es su Tenure Renewal.",
          tags: ["Un año cumplido", "Buen desempeño general", "Vale la pena retener"],
          agentState: "proud-but-waiting",
          agentHiddenState: "wants-acknowledgment-of-specific-things",
          startMood: 60,
          agentName: 'carlos'
        }
      ],
      mid: [
        {
          id: 'ten_mid_1',
          text: "Sandra cumple un año. Fue el año más difícil de su carrera — cambios de proceso, un manager nuevo, métricas que no reflejaban su esfuerzo. Llegó al año. Es su Tenure Renewal.",
          tags: ["Año difícil", "Demostró resiliencia", "Puede estar agotada o fortalecida"],
          agentState: "exhausted-proud",
          agentHiddenState: "needs-real-acknowledgment-or-leaves",
          startMood: 40,
          randomTriggers: true,
          agentName: 'sandra'
        }
      ],
      adv: [
        {
          id: 'ten_adv_1',
          text: "Valeria cumple un año. Fue promovida a senior en mes 8. Ahora tiene más responsabilidades pero el mismo sueldo base. No ha dicho nada. Es su Tenure Renewal.",
          tags: ["Promovida sin ajuste salarial", "No ha dicho nada", "Bomba de tiempo potencial"],
          agentState: "composed-professional",
          agentHiddenState: "actively-planning-exit",
          startMood: 35,
          misleading: true,
          agentName: 'valeria'
        }
      ]
    }
  }
};

// Active intervention
let currentIntervention = null;

function setIntervention(id) {
  if (INTERVENTIONS[id]) {
    currentIntervention = INTERVENTIONS[id];
    return true;
  }
  return false;
}

function getInterventionScenarios(level) {
  if (!currentIntervention) return [];
  return currentIntervention.scenarios[level] || [];
}

function getAvailableInterventions() {
  return Object.values(INTERVENTIONS);
}
