const bienvenidoTexto = "                               .:: Aplicación de Pokemones ::.                               ";
let offset = 0;
let tamaño = 31; // Ignorá esta Ñ
const itemScroll = document.getElementById("statustext");
function scrollear() {
    if (offset === tamaño*2) offset = 0;
    itemScroll.textContent = bienvenidoTexto.substring(offset, offset+tamaño);
    offset++;
}
setInterval(scrollear, 100);