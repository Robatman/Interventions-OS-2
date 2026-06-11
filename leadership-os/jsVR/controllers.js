// ═══════════════════════════════════════════
// jsVR/controllers.js
// Eventos y controladores de interacción
// ═══════════════════════════════════════════

const Controllers = (() => {

    // ───────────────────────────────────────
    // Botones HTML
    // ───────────────────────────────────────

    function bindButton(id, callback) {

        const button = document.getElementById(id);

        if (!button) {
            console.warn(`Botón no encontrado: ${id}`);
            return;
        }

        button.addEventListener("click", callback);
    }

    // ───────────────────────────────────────
    // Eventos VR
    // ───────────────────────────────────────

    function bindVRButton(entity, eventName, callback) {

        if (!entity) return;

        entity.addEventListener(eventName, callback);
    }

    // ───────────────────────────────────────
    // Inicialización
    // ───────────────────────────────────────

    function init() {

        console.log("Controllers initialized");
    }

    return {
        init,
        bindButton,
        bindVRButton
    };

})();
