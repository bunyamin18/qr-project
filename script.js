// QR kodunu oluşturacak ve listeyi yönetecek JavaScript kodu
let items = [];

document.getElementById("addItem").addEventListener("click", function() {
    const name = document.getElementById("itemName").value;
    const quantity = document.getElementById("itemQuantity").value;
    const imageFile = document.getElementById("itemImage").files[0];

    if (name && quantity) {
        const item = {
            itemName: name,
            quantity: quantity,
            imgSrc: imageFile ? URL.createObjectURL(imageFile) : ""
        };
        items.push(item);

        // Reset inputs
        document.getElementById("itemName").value = "";
        document.getElementById("itemQuantity").value = "";
        document.getElementById("itemImage").value = "";

        alert('Öğe eklendi!');
    } else {
        alert('Öğe adı ve miktarı doldurun!');
    }
});

function generateQRCode() {
    const listTitle = "Liste Başlığı";  // Liste başlığı (değiştirilebilir)
    const qrCodeUrl = `${window.location.origin}/list.html?title=${encodeURIComponent(listTitle)}&items=${encodeURIComponent(JSON.stringify(items))}`;

    document.getElementById("qrCodeDisplay").innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeUrl)}&size=150x150" alt="QR Code">`;
}

// Kaydet ve QR Kod oluştur
generateQRCode();
