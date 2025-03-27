function generateQRCode(listName) {
    // QR kodu için URL'yi liste ismiyle oluşturuyoruz.
    let url = `${window.location.origin}?list=${encodeURIComponent(listName)}`;
    return url;
}

window.onload = function() {
    let urlParams = new URLSearchParams(window.location.search);
    let listName = urlParams.get("list");

    // URL'deki listeyi alıp, sayfada gösteriyoruz.
    if (listName && lists[listName]) {
        displayList(listName);
    }

    loadSavedLists();
};

function displayList(listName) {
    let container = document.getElementById("savedLists");
    container.innerHTML = "";

    // Listeyi sayfada görüntülemek için içeriği oluşturuyoruz
    let div = document.createElement("div");
    div.innerHTML = `<h3>${listName}</h3>`;
    
    // Liste öğelerini görüntülüyoruz.
    lists[listName].items.forEach(item => {
        div.innerHTML += `
            <p><strong>${item.itemName}</strong> - ${item.quantity} 
            ${item.imgSrc ? `<img src="${item.imgSrc}" width="50" height="50">` : ""}</p>
        `;
    });

    container.appendChild(div);
}
