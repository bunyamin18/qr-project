document.addEventListener("DOMContentLoaded", () => {
    yuklenmisListeyiGoster();
});

function listeyeEkle() {
    let table = document.getElementById("listeBody");
    let row = table.insertRow();

    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);

    cell1.innerHTML = `<input type="text" placeholder="Öğe adı">`;
    cell2.innerHTML = `<input type="number" placeholder="Miktar">`;
    cell3.innerHTML = `<input type="file" accept="image/*">`;
    cell4.innerHTML = `<button onclick="satiriSil(this)">Sil</button>`;
}

function satiriSil(button) {
    let row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function listeyiKaydet() {
    let tableRows = document.querySelectorAll("#listeBody tr");
    let liste = [];

    tableRows.forEach(row => {
        let item = row.cells[0].querySelector("input").value;
        let amount = row.cells[1].querySelector("input").value;
        liste.push({ item, amount });
    });

    let jsonListe = JSON.stringify(liste);
    localStorage.setItem("kayitliListe", jsonListe);

    let qrcodeDiv = document.getElementById("qrcode");
    qrcodeDiv.innerHTML = "";
    new QRCode(qrcodeDiv, window.location.href + "?data=" + encodeURIComponent(jsonListe));

    alert("Liste kaydedildi ve QR kod oluşturuldu!");
}

function yuklenmisListeyiGoster() {
    let params = new URLSearchParams(window.location.search);
    let data = params.get("data");

    if (data) {
        let liste = JSON.parse(decodeURIComponent(data));
        let table = document.getElementById("listeBody");

        liste.forEach(entry => {
            let row = table.insertRow();
            let cell1 = row.insertCell(0);
            let cell2 = row.insertCell(1);
            let cell3 = row.insertCell(2);
            let cell4 = row.insertCell(3);

            cell1.innerHTML = `<input type="text" value="${entry.item}">`;
            cell2.innerHTML = `<input type="number" value="${entry.amount}">`;
            cell3.innerHTML = `<input type="file" accept="image/*">`;
            cell4.innerHTML = `<button onclick="satiriSil(this)">Sil</button>`;
        });
    }
}
