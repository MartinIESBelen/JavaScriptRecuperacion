let festivalesGlobales = [];

async function cargarFestivales() {
    try {
        const respuesta = await fetch('MSG_festivales.json');

        if (!respuesta.ok) {
            throw new Error("Error: " + respuesta.status);
        }

        festivalesGlobales = await respuesta.json();

        pintarRadioEstilos();
        pintarFestivales(festivalesGlobales);

    } catch (error) {
        document.getElementById("contenedor-festivales").innerHTML = `<p class="error-container">Error cargando los festivales.</p>`;
    }
}

function obtenerEstilosUnicos() {
    const estilos = new Set();

    festivalesGlobales.forEach(festival => {
        if (festival.generos) {
            festival.generos.forEach(genero => estilos.add(genero.toLowerCase()));
        }
    });

    return [...estilos].sort((a, b) => a.localeCompare(b));
}

function pintarRadioEstilos() {
    const contenedor = document.getElementById("contenedor-estilos");
    const estilos = obtenerEstilosUnicos();

    let htmlRadios = `
        <label>
            <input type="radio" name="estilo" value="Todos" checked>
            <strong>Todos</strong>
        </label>
    `;

    htmlRadios += estilos.map(estilo => `
        <label>
            <input type="radio" name="estilo" value="${estilo}">
            ${estilo}
        </label>
    `).join('');

    contenedor.innerHTML = htmlRadios;
}

function filtrarFestivales() {
    const textoBusqueda = document.getElementById("buscador").value.toLowerCase().trim();
    const radioSeleccionado = document.querySelector('input[name="estilo"]:checked');
    const estiloSeleccionado = radioSeleccionado ? radioSeleccionado.value : "Todos";

    const listaFiltrada = festivalesGlobales.filter(festival => {
        const nombreEnMinusculas = festival.nombre.toLowerCase();
        const ciudadEnMinusculas = festival.ciudad.toLowerCase();

        const coincideTexto = nombreEnMinusculas.includes(textoBusqueda) || ciudadEnMinusculas.includes(textoBusqueda);

        let coincideEstilo = true;
        if (estiloSeleccionado !== "Todos") {
            const generosMinusculas = festival.generos ? festival.generos.map(g => g.toLowerCase()) : [];
            coincideEstilo = generosMinusculas.includes(estiloSeleccionado);
        }

        return coincideTexto && coincideEstilo;
    });

    pintarFestivales(listaFiltrada);
}

function calcularCantidadArtistas(festival) {
    if (!festival.escenarios) return 0;

    return festival.escenarios.reduce((total, escenario) => {
        const numArtistas = escenario.artistas ? escenario.artistas.length : 0;
        return total + numArtistas;
    }, 0);
}

function obtenerListaEscenariosHtml(festival) {
    if (!festival.escenarios || festival.escenarios.length === 0) return "<em>Sin escenarios</em>";

    const listaLi = festival.escenarios.map(escenario => `<li><span>${escenario.nombre}</span></li>`).join('');
    return `<ul class="escenarios-list">${listaLi}</ul>`;
}

function obtenerGenerosHtml(festival) {
    if (!festival.generos) return "";
    return festival.generos.map(genero => `<span class="genero-tag">${genero}</span>`).join('');
}

function restaurarOtrasTarjetas(nombreFestivalActual) {
    const inputs = document.querySelectorAll('.input-director');
    inputs.forEach(input => {
        const nombre = input.getAttribute('data-nombre');
        if (nombre !== nombreFestivalActual) {
            const festival = festivalesGlobales.find(f => f.nombre === nombre);
            if (festival) {
                input.value = festival.director;
                document.querySelector(`.error-vacio[data-nombre="${nombre}"]`).style.display = "none";
                document.querySelector(`.error-numero[data-nombre="${nombre}"]`).style.display = "none";
                document.querySelector(`.btn-guardar[data-nombre="${nombre}"]`).disabled = true;
            }
        }
    });
}

function validarInput(input) {
    const nombreFestival = input.getAttribute('data-nombre');
    const valor = input.value;
    const boton = document.querySelector(`.btn-guardar[data-nombre="${nombreFestival}"]`);
    const errorVacio = document.querySelector(`.error-vacio[data-nombre="${nombreFestival}"]`);
    const errorNumero = document.querySelector(`.error-numero[data-nombre="${nombreFestival}"]`);
    const festival = festivalesGlobales.find(f => f.nombre === nombreFestival);

    let esValido = true;
    errorVacio.style.display = "none";
    errorNumero.style.display = "none";

    if (valor.trim() === "") {
        errorVacio.style.display = "block";
        esValido = false;
    } else if (/\d/.test(valor)) {
        errorNumero.style.display = "block";
        esValido = false;
    }

    if (valor.trim() === festival.director) {
        boton.disabled = true;
    } else {
        boton.disabled = !esValido;
    }
}

function guardarDirector(nombreFestival) {
    const input = document.querySelector(`.input-director[data-nombre="${nombreFestival}"]`);
    const boton = document.querySelector(`.btn-guardar[data-nombre="${nombreFestival}"]`);
    const nuevoDirector = input.value.trim();

    if (nuevoDirector !== "" && !/\d/.test(nuevoDirector)) {
        const festival = festivalesGlobales.find(f => f.nombre === nombreFestival);
        if (festival) {
            festival.director = nuevoDirector;
        }

        const idMensaje = nombreFestival.replace(/\s+/g, '');
        const msj = document.getElementById(`msg-${idMensaje}`);

        boton.disabled = true;

        msj.style.display = "block";
        setTimeout(() => {
            if (msj) msj.style.display = "none";
        }, 5000);
    }
}

function pintarFestivales(listaFestivales) {
    const contenedor = document.getElementById("contenedor-festivales");
    const infoFiltro = document.getElementById("info-filtro");

    infoFiltro.textContent = `${listaFestivales.length} festivales de ${festivalesGlobales.length}`;

    if (listaFestivales.length === 0) {
        contenedor.innerHTML = `<p class="no-results">No se han encontrado festivales con esa búsqueda.</p>`;
        return;
    }

    const htmlTarjetas = listaFestivales.map(festival => {
        const idMensaje = festival.nombre.replace(/\s+/g, '');

        return `
            <div class="tarjeta-festival">
                <h2>${festival.nombre}</h2>
                
                <p><strong class="ciudad-txt">${festival.ciudad}</strong></p>
                
                <div class="fila-destacada">
                    <span class="precio-badge"> ${festival.precio_entrada.toLocaleString('es-ES')} €</span>
                    <span class="artistas-badge"> ${calcularCantidadArtistas(festival)} artistas</span>
                </div>

                <div><strong> Escenarios:</strong> ${obtenerListaEscenariosHtml(festival)}</div>
                
                <div class="generos-container">
                    <strong> Estilos:</strong> <br> ${obtenerGenerosHtml(festival)}
                </div>
                
                <div class="area-director">
                    <label><strong> DIRECTOR/A:</strong></label>
                    <div class="director-input-group">
                        <input type="text" class="input-director" data-nombre="${festival.nombre}" value="${festival.director}">
                        <button class="btn-guardar" data-nombre="${festival.nombre}" disabled>Guardar</button>
                    </div>
                    <span class="error-msg error-vacio" data-nombre="${festival.nombre}">El campo no puede estar vacío.</span>
                    <span class="error-msg error-numero" data-nombre="${festival.nombre}">No se aceptan números.</span>
                    <p id="msg-${idMensaje}" class="success-msg">¡Nuevo director/a guardado!</p>
                </div>
            </div>
        `;
    }).join('');

    contenedor.innerHTML = htmlTarjetas;
}

document.addEventListener("DOMContentLoaded", () => {
    cargarFestivales();

    document.getElementById("buscador").addEventListener("input", filtrarFestivales);

    document.getElementById("contenedor-estilos").addEventListener("change", (e) => {
        if (e.target.name === "estilo") {
            filtrarFestivales();
        }
    });

    const contenedorFestivales = document.getElementById("contenedor-festivales");

    contenedorFestivales.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-guardar")) {
            const nombreFestival = e.target.getAttribute("data-nombre");
            guardarDirector(nombreFestival);
        }
    });

    contenedorFestivales.addEventListener("input", (e) => {
        if (e.target.classList.contains("input-director")) {
            validarInput(e.target);
        }
    });

    contenedorFestivales.addEventListener("focusin", (e) => {
        if (e.target.classList.contains("input-director")) {
            const nombreFestival = e.target.getAttribute("data-nombre");
            restaurarOtrasTarjetas(nombreFestival);
        }
    });
});