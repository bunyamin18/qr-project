// QR kodu oluşturmak için gerekli kütüphaneyi dahil edin
// Bu dosyanın HTML'de doğru şekilde yüklendiğinden emin olun
// <script src="qrcode.min.js"></script>

// Veri depolama nesnesi
window.dataStorage = {
    lists: {
        "1": { id: "1", title: "Örnek Liste", items: [{ content: "Öğe 1", value: "Değer 1" }] }
    },
    getList: function (id) {
        return this.lists[id];
    }
};

// Sayfa yüklendiğinde çalışacak ana fonksiyon
document.addEventListener('DOMContentLoaded', function () {
    console.log('QR Generator sayfası yüklendi');

    // DOM öğelerini seç
    const listTitle = document.getElementById('listTitle');
    const previewItems = document.getElementById('preview-items');
    const qrContainer = document.getElementById('qrContainer');
    const backButton = document.getElementById('backButton');
    const editButton = document.getElementById('editButton');
    const downloadButton = document.getElementById('downloadButton');

    // İndirme butonunu başlangıçta devre dışı bırak
    if (downloadButton) {
        downloadButton.disabled = true;
    }

    // URL'den liste ID'sini al
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('listId');

    if (!listId) {
        showError('Liste ID bulunamadı. Lütfen geçerli bir liste seçin.');
        return;
    }

    // Liste verilerini al
    const listData = window.dataStorage.getList(listId);

    if (!listData) {
        showError('Liste bulunamadı. Lütfen geçerli bir liste seçin.');
        return;
    }

    // Liste verilerini göster ve QR kodu oluştur
    displayListData(listData);
    generateQRCode(listData);

    // Ana sayfaya dönme butonunu ayarla
    if (backButton) {
        backButton.addEventListener('click', function () {
            window.location.href = 'index.html';
        });
    }

    // Liste düzenleme butonunu ayarla
    if (editButton) {
        editButton.addEventListener('click', function () {
            window.location.href = `index.html?edit=${listId}`;
        });
    }

    // Hata mesajını göster
    function showError(message) {
        console.error(message);
        qrContainer.innerHTML = `<p style="color: red;">${message}</p>`;
    }

    // Liste verilerini görüntüle
    function displayListData(listData) {
        if (listTitle) {
            listTitle.textContent = listData.title || 'Liste';
        }

        if (previewItems) {
            previewItems.innerHTML = '';
            if (listData.items && listData.items.length > 0) {
                listData.items.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'preview-item';
                    itemElement.innerHTML = `
                        <div class="item-content">${escapeHtml(item.content)}</div>
                        ${item.value ? `<div class="item-value">${escapeHtml(item.value)}</div>` : ''}
                    `;
                    previewItems.appendChild(itemElement);
                });
            } else {
                previewItems.innerHTML = '<p>Bu listede öğe bulunmuyor.</p>';
            }
        }
    }

    // QR kod oluşturma fonksiyonu
    function generateQRCode(listData) {
        try {
            const jsonData = JSON.stringify(listData);
            const base64Data = btoa(unescape(encodeURIComponent(jsonData)));
            const finalUrl = `${window.location.origin}/viewer.html?data=${encodeURIComponent(base64Data)}`;

            console.log('Oluşturulan URL:', finalUrl);

            const { img, url } = generateQRImage(finalUrl, 200);

            qrContainer.innerHTML = '';
            qrContainer.appendChild(img);

            // İndirme butonunu etkinleştir
            setupDownloadButton(url);
        } catch (error) {
            showError('QR kod oluşturulamadı: ' + error.message);
        }
    }

    // QR kodu oluşturmak için yardımcı fonksiyon
    function generateQRImage(data, size) {
        const qrCodeContainer = document.createElement('div');
        const qrCode = new QRCode(qrCodeContainer, {
            text: data,
            width: size,
            height: size,
        });

        const img = qrCodeContainer.querySelector('img');
        const url = img.src;

        return { img, url };
    }

    // İndirme butonunu hazırla
    function setupDownloadButton(qrCodeUrl) {
        if (downloadButton) {
            downloadButton.disabled = false;
            downloadButton.addEventListener('click', function () {
                const link = document.createElement('a');
                link.href = qrCodeUrl;
                link.download = 'qrcode.png';
                link.click();
            });
        }
    }

    // HTML karakterlerini escape et
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, function (m) { return map[m]; });
    }
});