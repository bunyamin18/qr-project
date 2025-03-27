function saveList() {
    let title = document.getElementById("listTitle").value;
    let content = document.getElementById("listContent").value;

    if (!title.trim() || !content.trim()) {
        alert("Lütfen liste adı ve içeriğini girin!");
        return;
    }

    let listData = { title: title, content: content };
    let listString = JSON.stringify(listData);
    let encodedData = encodeURIComponent(listString);
    let pageURL = window.location.origin + "/liste.html?data=" + encodedData;

    let qrCodeContainer = document.getElementById("qrcode");
    qrCodeContainer.innerHTML = "";
    new QRCode(qrCodeContainer, pageURL);
}
