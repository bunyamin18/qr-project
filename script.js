document.addEventListener("DOMContentLoaded", function () {
    const titleInput = document.getElementById("title");
    const contentInput = document.getElementById("content");
    const saveButton = document.getElementById("save");
    const qrImage = document.getElementById("qr-code");

    // Kaydet butonuna tıklama işlemi
    saveButton.addEventListener("click", function () {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (title === "" || content === "") {
            alert("Lütfen bir başlık ve içerik girin!");
            return;
        }

        // Benzersiz ID oluştur
        const listID = generateRandomID();
        
        // Veriyi localStorage'a kaydet
        localStorage.setItem(listID, JSON.stringify({ title, content }));

        // QR kod oluşturulması
        const qrText = `${window.location.origin}?id=${listID}`;
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrText)}`;

        alert("QR kod oluşturuldu! QR'yi tarayarak listeye ulaşabilirsiniz.");
    });

    // ID oluşturma fonksiyonu
    function generateRandomID() {
        return Math.random().toString(36).substr(2, 9); // Benzersiz bir ID üretir
    }

    // Sayfa yüklenince URL parametresinden id'yi alalım ve veriyi bulalım
    const urlParams = new URLSearchParams(window.location.search); // URL parametrelerini al
    const listID = urlParams.get("id"); // "id" parametresini al

    if (listID) {
        // Eğer URL'de id varsa, LocalStorage'dan veriyi çekelim
        const savedData = localStorage.getItem(listID);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Başlık ve içerik bilgilerini sayfada göster
            document.body.innerHTML = `
                <h1>${parsedData.title}</h1>
                <p>${parsedData.content.replace(/\n/g, "<br>")}</p>
            `;
        } else {
            // Liste bulunamazsa uyarı göster
            document.body.innerHTML = `<h1>Liste bulunamadı!</h1>`;
        }
    }
});
