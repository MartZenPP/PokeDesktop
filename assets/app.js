const bienvenidoTexto = "                               .:: Aplicación de Pokemones ::.                               ";
let offset = 0;
const tamaño = 31; // Ignorá esta Ñ
const itemScroll = document.getElementById("statustext");
function scrollear() {
    if (offset === tamaño*2) offset = 0;
    itemScroll.textContent = bienvenidoTexto.substring(offset, offset+tamaño);
    offset++;
}
setInterval(scrollear, 100);

let curPage = 1;
let pageLen = 24;

async function bodyOnload() {
    await cargarPagina(curPage, pageLen);
}

async function cargarPagina() {
    const list = document.getElementById("pokemonlist");
    const page = await getPokemonPage();
    page.results.forEach(item => {
        let id = item.url.split("/")[6];
        let pit = document.createElement("div");
        let pif = document.createElement("a");
        let pifimg = document.createElement("img");
        let pii = document.createElement("img");
        let pin = document.createElement("span");
        pifimg.src = "assets/emblem-favorite.svg";
        pifimg.width = 20;
        pif.title = "Añadir a favoritos";
        pif.href = "#";
        pif.onclick = "e.preventDefault(); return false;"
        pif.appendChild(pifimg);
        pii.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
        pii.className = "pokemonitemimg";
        pii.width = 128;
        pin.textContent = item.name.charAt(0).toUpperCase() + item.name.slice(1);
        pin.className = "pokemonitemname";
        pit.className = "pokemonitem";
        pit.appendChild(pif);
        pit.appendChild(pii);
        pit.appendChild(pin);
        list.appendChild(pit);
    });
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