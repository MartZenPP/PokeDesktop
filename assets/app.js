const bienvenidoTexto = "                               .:: Aplicación de Pokemones ::.                               ";
let 𝓸𝓯𝓯𝓼𝓮𝓽 = 0;
const tamaño = 31; // Ignorá esta Ñ
const itemScroll = document.getElementById("statustext");
function scrollear() {
    if (𝓸𝓯𝓯𝓼𝓮𝓽 === tamaño*2) 𝓸𝓯𝓯𝓼𝓮𝓽 = 0;
    itemScroll.textContent = bienvenidoTexto.substring(𝓸𝓯𝓯𝓼𝓮𝓽, 𝓸𝓯𝓯𝓼𝓮𝓽+tamaño);
    𝓸𝓯𝓯𝓼𝓮𝓽++;
}
setInterval(scrollear, 100);
        
let curPage = 1;
let pageLen = 24;
let maxPage;
let maxPokemon;
let currentPokemon = '';

async function bodyOnload() {
    await cargarPagina(curPage, pageLen);
}

function firstPage() {
    curPage = 1;
    cargarPagina();
    event.preventDefault();
    return false;
}

function lastPage() {
    curPage = maxPage;
    cargarPagina();
    event.preventDefault();
    return false;
}

function nextPage() {
    curPage++;
    cargarPagina();
    event.preventDefault();
    return false;
}

function previousPage() {
    curPage--;
    cargarPagina();
    event.preventDefault();
    return false;
}

async function jumpToPokemon(form, event) {
    curPage = form.pagina.value;
    cargarPagina();
    event.preventDefault();
    return false;
}

async function cargarPagina() {
    const list = document.getElementById("pokemonlist");
    const page = await getPokemonPage(curPage, pageLen);
    maxPokemon = page.count;
    maxPage = Math.floor(maxPokemon/pageLen) + 1;
    list.replaceChildren();
    page.results.forEach(item => {
        let id = item.url.split("/")[6];
        let pia = document.createElement("a");
        let pit = document.createElement("div");
        //let pif = document.createElement("a");
        //let pifimg = document.createElement("img");
        let pii = document.createElement("img");
        let pin = document.createElement("div");
        /*pifimg.src = "assets/emblem-favorite.svg";
        pifimg.width = 20;
        pif.title = "Añadir a favoritos";
        pif.href = "#";
        pif.onclick = "e.preventDefault(); return false;";
        pif.appendChild(pifimg);*/
        pii.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
        pii.width = 128;
        pin.textContent = item.name.charAt(0).toUpperCase() + item.name.slice(1);
        pit.className = "pokemonitem";
        //pit.appendChild(pif);
        pia.href = "#";
        pia.onclick = botonPokemon;
        pit.appendChild(pii);
        pit.appendChild(pin);
        pia.appendChild(pit);
        list.appendChild(pia);
    });
}

function botonPokemon(e) {
    let showName = e.currentTarget.querySelector("div.pokemonitem div").textContent; // Puedo hacer todo un libro de estas formas feas de hacer las cosas
    mostrarPokemon(showName);
    return false;
}

function buscarPokemon(form, event) {
    mostrarPokemon(form.buscar.value);
    event.preventDefault();
    return false;
}

async function mostrarPokemon(showName) {
    showName = showName.toLowerCase();
    fancyShowName = showName.charAt(0).toUpperCase() + showName.slice(1);
    let showData;
    try {
        showData = await getPokemon(showName);
    }
    catch (e) {
        if (e.message === "404") alert("Error: Este Pokémon no se encontró.");
        else alert("Se encontró un error interno: " + e.message + "\n" + e.stack);
        return;
    }
    document.querySelector("dialog#pokemondata > span").textContent = fancyShowName;
    let dataTable = document.querySelectorAll("dialog#pokemondata > table td");
    let nombre = dataTable[1];
    let numero = dataTable[3];
    let tipos = dataTable[5];
    let altura = dataTable[7];
    let peso = dataTable[9];
    let habilidades = dataTable[11];
    let imagen = document.querySelector("dialog#pokemondata > img");
    imagen.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${showData.id}.png`;
    imagen.alt = fancyShowName;
    nombre.textContent = fancyShowName;
    numero.textContent = showData.id;
    tipos.textContent = "";
    showData.types.forEach((typeSlot) => {tipos.textContent += typeSlot.type.name.charAt(0).toUpperCase() + typeSlot.type.name.slice(1) + ", "});
    tipos.textContent = tipos.textContent.slice(0, -2); // Eliminar última coma
    altura.textContent = showData.height / 10 + " m";
    peso.textContent = showData.weight / 10 + " kg";
    habilidades.textContent = "";
    showData.abilities.forEach((abilitySlot) => {habilidades.textContent += abilitySlot.ability.name.charAt(0).toUpperCase() + abilitySlot.ability.name.slice(1) + ", "});
    habilidades.textContent = habilidades.textContent.slice(0, -2); // Eliminar última coma
    // Esto hace que se carguen las imágenes antes de que se abra la ventana
    let sbTimeout;
    let showBox = () => {document.getElementById("pokemondata").showModal(); clearTimeout(sbTimeout)};
    imagen.onload = showBox;
    sbTimeout = setTimeout(showBox, 2000);
}

function buildListUrl(page = 1, limit = 24) {
  const url = new URL("https://pokeapi.co/api/v2/pokemon");
  const offset = (page - 1) * limit;
  url.search = new URLSearchParams({ offset, limit }).toString();
  return url.toString();
}

async function getPokemonPage(page = 1, limit = 24) {
  const res = await cachedFetch(buildListUrl(page, limit));
  return res;
}

async function getPokemon(name) {
  const url = `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name.toLowerCase())}`;
  const res = await cachedFetch(url);
  return res;
}

async function cachedFetch(url) {
    let cache;
    try {
        cache = JSON.parse(localStorage.getItem("PokeDesktopCache")) || {};
    }
    catch {
        cache = {};
    }
    if (url in cache) {
        if (cache[url].savedAt > Date.now()-600000 /* milisegundos, estos son 10 minutos */) {
            return cache[url].data;
        }
    }
    const res = await fetch(url);
    if (res.ok) {
        resData = await res.json();
        cache[url] = {data: resData, savedAt: Date.now()}
        localStorage.setItem("PokeDesktopCache", JSON.stringify(cache));
        return resData;
    }
    else {
        throw new Error(res.status);
    }
}