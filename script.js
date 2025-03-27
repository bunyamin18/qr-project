document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const listData = urlParams.get("data");

    if (listData) {
        // QR kod ile açıldıysa, listeyi göster
        const parsedData = JSON.parse(decodeURIComponent(listData));
        document.body.innerHTML = `
            <div class="container">
                <h1>${parsedData.title}</h1>
                <p>${parsedData.content.replace(/\n/g, "<br>")}</p>
            </div>
        `;
    } else {
        // Liste oluşturma ekranını göster
        document.body.innerHTML = `
            <div class="container">
                <h1>Yeni Liste Oluştur</h1>
                <label for="title">Başlık:</label>
                <input type="text" id="title" placeholder="Başlık girin">

                <label for="content">İçerik:</label>
                <textarea id="content" placeholder="Liste içeriği yazın"></textarea>

                <button id="save">Listeyi Kaydet</button>

                <h2>QR Kod:</h2>
                <img id="qr-code" src="" alt="QR kodu burada gözükecek">
            </div>

            <footer>2003230030 // Bünyamin Ekmekcioğlu</footer>
        `;

        // Buton Event Listener
        document.getElementById("save").addEventListener("click", function () {
            const title = document.getElementById("title").value.trim();
            const content = document.getElementById("content").value.trim();

            if (title === "" || content === "") {
                alert("Lütfen bir başlık ve içerik girin!");
                return;
            }

            const encodedData = encodeURIComponent(JSON.stringify({ title, content }));
            const qrText = window.location.origin + "?data=" + encodedData;

            document.getElementById("qr-code").src = 
                "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(qrText);

            alert("QR kod oluşturuldu! QR'yi tarayarak listeye ulaşabilirsiniz.");
        });
    }
});
