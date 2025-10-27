/**
 * Aquí estará la lógica principal de la aplicación.
 * Este bloque de código contiene la funcionalidad principal
 * que define el comportamiento del programa.
 */

import { traerEstancias, initSearchModal } from "./utils.js";


document.addEventListener("DOMContentLoaded", async () => {
    await traerEstancias();
    initSearchModal();
});