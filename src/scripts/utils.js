/**
 * Módulo de funciones utilitarias.
 * Este archivo contiene funciones auxiliares que serán utilizadas y llamadas
 * desde el archivo principal para realizar varias operaciones.
 */

import { stays } from "./stays.js";

let contenedor = document.querySelector("#contenedor");
let datos = [];

/* CREAMOS LA PROMESA COMO SI ESTUVIERAMOS OBTENIENDO DATOS DE UNA API */
let getStays = new Promise((resolve, reject) => {
    let condition = true;
    if (condition) {
        resolve(stays);
    } else {
        reject("Error al obtener estancias");
    }
});

/* CONSUMIMOS LA PROMESA PARA OBTENER LOS DATOS */
async function consumirPromesa(promesa) {
    try {
        let respuesta = await promesa;
        return respuesta;
    } catch (error) {
        console.log("Mala conexión");
    }
}

/* --- MOSTRAR ESTANCIAS --- */
function renderStays(lista) {
    contenedor.innerHTML = "";
    lista.forEach((e) => {
        let host = e.superHost ? "SUPERHOST" : "";
        contenedor.innerHTML += `
        <div class="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="h-48 w-full overflow-hidden">
                <img class="rounded-t-lg" src="${e.photo}" alt="" class="h-full w-full object-cover" />
            </div>
            <div class="p-3">
                <div class="flex justify-between">
                    <h3 class="${!host ? "hidden" : ""} text-xs border rounded-2xl p-1 font-bold">${host ?? ""}</h3>
                    <h5 class="tracking-tight font-normal text-gray-400 text-xs">${e.type} . ${e.beds || ""} beds</h5>
                    <div class="flex justify-center items-center">
                        <img src="./src/images/icons/star.svg" alt="estrella" class="w-4 h-4 object-contain mr-1">
                        <p>${e.rating}</p>
                    </div>
                </div>
                <p class="mb-3 font-normal text-black text-sm">${e.title}</p>
                <p class="text-black text-sm">City: ${e.city}</p>
            </div>
        </div>`;
    });
}


/* --- TRAER ESTANCIAS --- */
export async function traerEstancias() {
    try {
        datos = await consumirPromesa(getStays);
        console.log("Datos cargados:", datos);
        renderStays(datos);
    } catch (error) {
        console.log("Error al traer estancias:", error);
    }
}

/* --- FILTRAR ESTANCIAS --- */
function filtrarEstancias(ciudad, huespedesTotales) {
    let filtrados = datos.filter((stay) => {
        let ciudadCoincide = ciudad
            ? stay.city.toLowerCase().includes(ciudad.split(",")[0].trim().toLowerCase())
            : true;
        let huespedesOk = huespedesTotales
            ? stay.maxGuests >= huespedesTotales
            : true;
        return ciudadCoincide && huespedesOk;
    });
    renderStays(filtrados);
}

/* --- MODAL DE BÚSQUEDA --- */
export function initSearchModal() {
    let searchBar = document.querySelector("#searchBar");
    let modal = document.querySelector("#searchModal");
    let cityInput = document.querySelector("#cityInput");
    let cityList = document.querySelector("#cityList");
    let applyFilters = document.querySelector("#applyFilters");
    let selectedCity = document.querySelector("#ciudades");
    let selectedGuests = document.querySelector("#huespedes");
    let guestInput = document.querySelector("#guestInput");
    let guestControls = document.querySelector("#guestControls");

    let adults = 0;
    let children = 0;

    /* --- ACTUALIZAR TEXTO DE HUÉSPEDES --- */
    function updateGuestText() {
        let total = adults + children;
        if (total > 0) {
            selectedGuests.textContent = `${total} guest${total > 1 ? "s" : ""}`;
            guestInput.textContent = `${total} guest${total > 1 ? "s" : ""}`;
        } else {
            selectedGuests.textContent = "Add guests";
            guestInput.textContent = "Add guests";
        }
        document.getElementById("adultCount").textContent = adults;
        document.getElementById("childCount").textContent = children;
    }

    /* --- RENDERIZAR CIUDADES --- */
    function renderCities(data) {
        cityList.innerHTML = "";
        data.forEach((stay) => {
            let li = document.createElement("li");
            li.textContent = `${stay.city}, ${stay.country}`; // muestra cada ciudad según el dataset
            li.className =
                "px-4 py-2 rounded-lg cursor-pointer hover:bg-orange-100 text-gray-700";
            li.addEventListener("click", () => {
                selectedCity.textContent = `${stay.city},${stay.country}`;
                cityInput.value = `${stay.city}, ${stay.country}`;

            });
            cityList.appendChild(li);
        });
    }

    /* --- ABRIR MODAL --- */
    searchBar.addEventListener("click", () => {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        cityInput.focus();
    });

    /* --- CERRAR MODAL --- */
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.add("hidden");
    });

    /* --- FILTRO DE CIUDADES EN TIEMPO REAL --- */
    cityInput.addEventListener("input", (e) => {
        let query = e.target.value.toLowerCase();
        let filtered = datos.filter((stay) =>
            stay.city.toLowerCase().includes(query)
        );
        renderCities(filtered);
    });

    /* --- MOSTRAR CONTROLES DE HUÉSPEDES --- */
    guestInput.addEventListener("click", () => {
        guestControls.classList.toggle("hidden");
    });

    /* --- BOTONES SUMAR --- */
    document.querySelectorAll(".guest-plus").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (btn.dataset.type === "adults") adults++;
            else children++;
            updateGuestText();
        });
    });

    /* --- BOTONES RESTAR --- */
    document.querySelectorAll(".guest-minus").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (btn.dataset.type === "adults" && adults > 0) adults--;
            else if (btn.dataset.type === "children" && children > 0) children--;
            updateGuestText();
        });
    });

    /* --- APLICAR FILTROS --- */
    applyFilters.addEventListener("click", () => {
        modal.classList.add("hidden");
        let ciudadSeleccionada = cityInput.value.trim();
        let totalHuespedes = adults + children;
        // Actualizar la barra principal fuera del modal
        let barraCiudad = document.querySelector("#ciudades");
        let barraHuespedes = document.querySelector("#huespedes");

        barraCiudad.textContent = ciudadSeleccionada || "Add location";
        barraHuespedes.textContent =
            totalHuespedes > 0
                ? `${totalHuespedes} guest${totalHuespedes > 1 ? "s" : ""}`
                : "Add guests";
        filtrarEstancias(ciudadSeleccionada, totalHuespedes);
    });
}