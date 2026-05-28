import {datosUE} from "./JA_uecountries.js";

function ordenarPorPoblacion(lista){
    return [...lista].sort((a,b) => b.poblacion_nacional - a.poblacion_nacional);
}

function idiomasSinRepetir(){
    let idiomas = new Set();
    datosUE.forEach(p => {
        if(p.idiomas?.oficial){
            p.idiomas.oficial.split(", ").forEach(i => idiomas.add(i.toLowerCase().trim()));
        }
        if(p.idiomas?.otros_idiomas){
            p.idiomas.otros_idiomas.split(", ").forEach(i => idiomas.add(i.toLowerCase().trim()));
        }
    });
    return [...idiomas].sort((a,b) => a.localeCompare(b));
}

function pintarCheckBoxesIdiomas(){
    const contenedor = document.getElementById("listaPaisesRadio");
    const idiomas = idiomasSinRepetir();

    let htmlRadios = `
        <label style="margin-right: 10px;">
            <input type="radio" name="idioma" value="Ninguno" checked>
            <strong>Ninguno</strong>
        </label>
    `;

    htmlRadios += idiomas.map(i => `
        <label style="margin-right: 10px;">
            <input type="radio" name="idioma" value="${i}">
            ${i}
        </label>
    `).join("");

    contenedor.innerHTML = htmlRadios;
}

function sumarPoblacionTotal(listaPaises){
    return listaPaises.reduce((acumulador, pais) => {
        return acumulador + pais.poblacion_nacional;
    }, 0);
}

function calcularMediaPoblacion(lista){
    return sumarPoblacionTotal(lista) / lista.length;
}

function pintarTablaPaises(listaPaises){
    const tbody = document.getElementById("cuerpoTablaPaises");
    const headerPoblacion = document.getElementById("totalPoblacionHeader");

    const listaOrdenada = ordenarPorPoblacion(listaPaises);

    const totalPob = sumarPoblacionTotal(listaOrdenada);
    headerPoblacion.textContent = `(${totalPob.toLocaleString('es-ES')} total UE)`;

    tbody.innerHTML = listaOrdenada.map(p => `
        <tr>
            <td>${p.pais}</td>
            <td>${p.capital}</td>
            <td>${p.poblacion_nacional.toLocaleString('es-ES')}</td>
            <td>${p.fecha_adhesion}</td>
        </tr>    
    `).join("");
}

function filtrarPaisesPorIdioma(idioma){
    if(!idioma || idioma === "Ninguno") return datosUE;
    const idiomaBuscado = idioma.toLowerCase().trim();

    return datosUE.filter(p => {
        let listaIdiomas = [];

        if(p.idiomas && p.idiomas.oficial){
            listaIdiomas = [...listaIdiomas, ...p.idiomas.oficial.sort(",").map(i => i.toLowerCase().trim())];
        }
        if(p.idiomas && p.idiomas.otros_idiomas){
            listaIdiomas = [...listaIdiomas, ...p.idiomas.otros_idiomas.sort(",").map(i => i.toLowerCase().trim())];
        }

        return listaIdiomas.includes(idiomaBuscado);
    })
}

function soloIdiomasOficiales(idioma){
    if(!idioma || idioma === "Ninguno") return datosUE;

    const idiomaBuscado = idioma.toLowerCase().trim();

    return datosUE.filter(p => {
        if(p.idiomas && p.idiomas.oficial){
            const listaOficial = p.idiomas.oficial.split(",").map(i => i.toLowerCase().trim());

            return listaOficial.includes(idiomaBuscado);
        }
        return false;
    })
}

function obtenerPaisesFiltrado(idioma, soloOficiales){
    if(soloOficiales){
        return soloIdiomasOficiales(idioma);
    }
    return filtrarPaisesPorIdioma(idioma);
}

document.addEventListener("DOMContentLoaded", () =>{
    pintarCheckBoxesIdiomas();
    pintarTablaPaises(datosUE);

    document.getElementById("infoFiltro").textContent = `Se muestran los ${datosUE.length} países de la UE`;

    const radioIdiomas = document.querySelectorAll('input[type="radio"]');
    const cbOficiales = document.getElementById("cbIdomaOfi")
    radioIdiomas.addEventListener('selected', () =>{

    });
});