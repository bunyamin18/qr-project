document.addEventListener("DOMContentLoaded", function () {
    const titleInput = document.getElementById("title");
    const contentInput = document.getElementById("content");
    const saveButton = document.getElementById("save");
    const qrImage = document.getElementById("qr-code");

    // Sayfa URL'sindeki parametreleri al
    const urlParams = new URLSearchParams(window.location.search);
    const listData = urlParams.get("data");

    if (listData) {
        // QR kodu ile açılmış, listeyi göster
        const parsedData = JSON.parse(decodeURIComponent(listData));
        document.body.innerHTML = `
            <h1>${parsedData.title}</h1>
            <p>${parsedData.content.replace(/\n/g, "<br>")}</p>
        `;
    } else {
        // Normal açılışta liste oluşturma ekranı göster
        document.body.innerHTML = `
            <h1>Yeni Liste Oluştur</h1>
            <label for="title">Başlık:</label>
            <input type="text" id="title" placeholder="Başlık girin"><br><br>

            <label for="content">İçerik:</label>
            <textarea id="content" placeholder="Liste içeriği yazın"></textarea><br><br>

            <button id="save">Listeyi Kaydet</button>

            <h2>QR Kod:</h2>
            <img id="qr-code" src="" alt="QR kodu gösterilecek">

            <script>
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
            </script>
        `;
    }
});
