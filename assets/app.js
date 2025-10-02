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
    refreshFavorites();
    refreshHistory();
}

function firstPage() {
    goToPage(1);
    event.preventDefault();
    return false;
}

function lastPage() {
    goToPage(maxPage);
    event.preventDefault();
    return false;
}

function previousPage() {
    goToPage(curPage - 1);
    event.preventDefault();
    return false;
}

function nextPage() {
    goToPage(curPage + 1);
    event.preventDefault();
    return false;
}

function jumpToPokemon(form, event) {
    let tempPage = form.pagina.value;
    if (tempPage < 1 || tempPage > maxPage) form.pagina.value = curPage;
    else goToPage(tempPage);
    event.preventDefault();
    return false;
}

function goToPage(page) {
    if (page < 1 || page > maxPage) return;
    curPage = page;
    cargarPagina();
}

async function cargarPagina() {
    document.forms['pageSelect'].pagina.value = curPage;
    const list = document.getElementById("pokemonlist");
    const page = await getPokemonPage(curPage, pageLen);
    maxPokemon = page.count;
    maxPage = Math.floor(maxPokemon/pageLen) + 1;
    list.replaceChildren();
    page.results.forEach(item => {
        let id = item.url.split("/")[6];
        let pia = document.createElement("a");
        let pit = document.createElement("div");
        let pii = document.createElement("img");
        let pin = document.createElement("div");
        pii.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
        pii.width = 128;
        pin.textContent = item.name.charAt(0).toUpperCase() + item.name.slice(1);
        pit.className = "pokemonitem";
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
        if (e.message === "404") alert("Error: Este Pokémon no se encontró. Asegurate de que lo estás escribiendo bien.");
        else alert("Se encontró un error interno: " + e.message + "\n" + e.stack);
        return;
    }
    document.querySelector("dialog#pokemondata > span").textContent = fancyShowName;
    document.querySelector("#pokemondatastatus").textContent = (isInFavorites(fancyShowName) ? "Favorito" : "");
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
    let showBox = () => {
        document.getElementById("pokemondata").showModal();
        addToHistory(fancyShowName);
        currentPokemon = fancyShowName;
        clearTimeout(sbTimeout)
    };
    imagen.onload = showBox;
    sbTimeout = setTimeout(showBox, 2000);
}

function addToHistory(fancyShowName) {
    let hist;
    try {
        hist = JSON.parse(localStorage.getItem("PokeDesktopHistory")) || [];
    }
    catch {
        hist = [];
    }
    if (hist[hist.length - 1] != fancyShowName) {
        hist = hist.filter(item => item !== fancyShowName)
        hist.push(fancyShowName);
        localStorage.setItem("PokeDesktopHistory", JSON.stringify(hist));
    }
    refreshHistory();
}

function refreshHistory() {
    let hist;
    try {
        hist = JSON.parse(localStorage.getItem("PokeDesktopHistory")) || [];
    }
    catch {
        hist = [];
    }
    const list = document.getElementById("history");
    list.replaceChildren();
    hist.toReversed().forEach((item) => {
        let historya = document.createElement("a");
        let historydiv = document.createElement("div");
        let removehist = document.createElement("img");
        let historyspan = document.createElement("span");
        removehist.src = "assets/process-stop.svg";
        removehist.width = 14;
        removehist.className = "smallbutton";
        removehist.title = "Quitar del historial";
        historyspan.textContent = item;
        historydiv.className = "history";
        historya.href = "#";
        historya.className = "historya";
        historya.onclick = historyButton;
        historydiv.appendChild(historyspan);
        historydiv.appendChild(removehist);
        historya.appendChild(historydiv);
        list.appendChild(historya);
    })
}

function historyButton(e) {
    if (e.target.className === "smallbutton") {
        deleteFromHistory(e.currentTarget);
    }
    else {
        mostrarPokemon(e.currentTarget.querySelector("div.history > span").textContent);
    }
    e.preventDefault();
    return false;
}

function deleteHistory() {
    localStorage.removeItem("PokeDesktopHistory");
    refreshHistory();
}

function deleteFromHistory(item) {
    // Al final por lo menos Chrome parece manejar esto mejor de lo que pensaba, esto quedó muy complejo
    let name = item.querySelector("div.history > span").textContent;
    let hist;
    try {
        hist = JSON.parse(localStorage.getItem("PokeDesktopHistory")) || [];
    }
    catch {
        hist = [];
    }
    hist = hist.filter(item => item !== name);
    localStorage.setItem("PokeDesktopHistory", JSON.stringify(hist));
    item.remove();
}

function addToFavorites(fancyShowName) {
    let favs;
    try {
        favs = JSON.parse(localStorage.getItem("PokeDesktopFavorites")) || [];
    }
    catch {
        favs = [];
    }
    favs = favs.filter(item => item !== fancyShowName)
    favs.push(fancyShowName);
    localStorage.setItem("PokeDesktopFavorites", JSON.stringify(favs));
    refreshFavorites();
}

function refreshFavorites() {
    let favs;
    try {
        favs = JSON.parse(localStorage.getItem("PokeDesktopFavorites")) || [];
    }
    catch {
        favs = [];
    }
    const list = document.getElementById("favorites");
    list.replaceChildren();
    favs.toReversed().forEach((item) => {
        let favoritea = document.createElement("a");
        let favoritediv = document.createElement("div");
        let removefav = document.createElement("img");
        let favoritespan = document.createElement("span");
        removefav.src = "assets/process-stop.svg";
        removefav.width = 14;
        removefav.className = "smallbutton";
        removefav.title = "Quitar de favoritos";
        favoritespan.textContent = item;
        favoritediv.className = "favorite";
        favoritea.href = "#";
        favoritea.className = "favoritea";
        favoritea.onclick = favoriteButton;
        favoritediv.appendChild(favoritespan);
        favoritediv.appendChild(removefav);
        favoritea.appendChild(favoritediv);
        list.appendChild(favoritea);
    })
}

function favoriteButton(e) {
    if (e.target.className === "smallbutton") {
        deleteFromFavorites(e.currentTarget);
    }
    else {
        mostrarPokemon(e.currentTarget.querySelector("div.favorite > span").textContent);
    }
    e.preventDefault();
    return false;
}

function deleteFavorites() {
    localStorage.removeItem("PokeDesktopFavorites");
    refreshFavorites();
}

function deleteFromFavorites(item) {
    // Al final Chrome parece manejar esto mejor de lo que pensaba, esto quedó muy complejo
    let name = item.querySelector("div.favorite > span").textContent;
    let favs;
    try {
        favs = JSON.parse(localStorage.getItem("PokeDesktopFavorites")) || [];
    }
    catch {
        favs = [];
    }
    favs = favs.filter(item => item !== name);
    localStorage.setItem("PokeDesktopFavorites", JSON.stringify(favs));
    item.remove();
}

function deleteFromFavoritesString(fancyShowName) {
    let favs;
    try {
        favs = JSON.parse(localStorage.getItem("PokeDesktopFavorites")) || [];
    }
    catch {
        favs = [];
    }
    favs = favs.filter(item => item !== fancyShowName);
    localStorage.setItem("PokeDesktopFavorites", JSON.stringify(favs));
    refreshFavorites();
}

function isInFavorites(fav) {
    let favs;
    try {
        favs = JSON.parse(localStorage.getItem("PokeDesktopFavorites")) || [];
    }
    catch {
        favs = [];
    }
    return favs.includes(fav);
}

function addToFav(elem) {
    if (isInFavorites(currentPokemon)) {
        elem.title = "Añadir a favoritos";
        deleteFromFavoritesString(currentPokemon);
    }
    else {
        elem.title = "Quitar de favoritos";
        addToFavorites(currentPokemon);
    }
    document.querySelector("#pokemondatastatus").textContent = (isInFavorites(currentPokemon) ? "Favorito" : "");
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