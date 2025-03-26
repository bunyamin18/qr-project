document.addEventListener("DOMContentLoaded", function () {
    const titleInput = document.getElementById("title");
    const contentInput = document.getElementById("content");
    const saveButton = document.getElementById("save");
    const qrImage = document.getElementById("qr-code");
    const displayTitle = document.getElementById("display-title");
    const displayContent = document.getElementById("display-content");

    function generateRandomID() {
        return Math.random().toString(36).substr(2, 9);
    }

    saveButton.addEventListener("click", function () {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (title === "" || content === "") {
            alert("Lütfen bir başlık ve içerik girin!");
            return;
        }

        const listID = generateRandomID();
        localStorage.setItem(listID, JSON.stringify({ title, content }));

        const qrText = `${window.location.origin}?id=${listID}`;
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrText)}`;
    });

    const urlParams = new URLSearchParams(window.location.search);
    const listID = urlParams.get("id");

    if (listID) {
        const savedData = localStorage.getItem(listID);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            displayTitle.textContent = parsedData.title;
            displayContent.textContent = parsedData.content;
        } else {
            displayTitle.textContent = "Hata!";
            displayContent.textContent = "Bu liste bulunamadı.";
        }
    }
});
