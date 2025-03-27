window.onload = function() {
    // URL parametrelerinden liste ismini alıyoruz
    let urlParams = new URLSearchParams(window.location.search);
    let listName = urlParams.get("list");

    // Eğer URL'de list parametresi varsa ve bu liste kayıtlıysa, listeyi gösteriyoruz
    if (listName && lists[listName]) {
        displayList(listName); // İlgili listeyi göster
    }

    // Sayfada daha önce kaydedilen listeleri yükle
    loadSavedLists();
};

function displayList(listName) {
    let container = document.getElementById("savedLists");
    container.innerHTML = "";  // Listeyi sıfırlıyoruz

    // Listeyi sayfada görüntülemek için içerik oluşturuyoruz
    let div = document.createElement("div");
    div.innerHTML = `<h3>${listName}</h3>`;

    // Liste öğelerini görüntülüyoruz
    lists[listName].items.forEach(item => {
        div.innerHTML += `
            <p><strong>${item.itemName}</strong> - ${item.quantity} 
            ${item.imgSrc ? `<img src="${item.imgSrc}" width="50" height="50">` : ""}</p>
        `;
    });

    container.appendChild(div);
}
