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

// QR kod oluşturma ve görüntüleme işlemleri
document.addEventListener('DOMContentLoaded', function () {
    // DOM elementlerini seç
    const listTitle = document.getElementById('listTitle');
    const previewItems = document.getElementById('preview-items');
    const qrContainer = document.getElementById('qrContainer');
    const backButton = document.getElementById('backButton');
    const editButton = document.getElementById('editButton');
    const downloadButton = document.getElementById('downloadButton');

    // URL'den liste ID'sini al
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('listId');

    if (!listId) {
        showError('Liste ID bulunamadı');
        return;
    }

    // Liste verilerini al ve göster
    const listData = window.dataStorage.getList(listId);
    if (!listData) {
        showError('Liste bulunamadı');
        return;
    }

    // Liste başlığını ve öğeleri göster
    displayListData(listData);
    
    // QR kodu oluştur
    createQRCode(listData);

    // Buton işlevlerini ayarla
    setupButtons(listId);

    function showError(message) {
        qrContainer.innerHTML = `<p class="error">${message}</p>`;
        if (downloadButton) downloadButton.disabled = true;
    }

    function displayListData(data) {
        // Başlığı göster
        if (listTitle) {
            listTitle.textContent = data.title || 'Liste';
        }

        // Liste öğelerini göster
        if (previewItems) {
            previewItems.innerHTML = '';
            if (data.items && data.items.length > 0) {
                data.items.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'preview-item';
                    div.innerHTML = `
                        <div class="item-content">${escapeHtml(item.content)}</div>
                        ${item.value ? `<div class="item-value">${escapeHtml(item.value)}</div>` : ''}
                    `;
                    previewItems.appendChild(div);
                });
            } else {
                previewItems.innerHTML = '<p>Bu listede öğe bulunmuyor</p>';
            }
        }
    }

    function createQRCode(data) {
        try {
            // Liste verilerini JSON'a çevir
            const jsonData = JSON.stringify(data);
            
            // Viewer URL'ini oluştur
            const viewerUrl = `${window.location.origin}/viewer.html?data=${encodeURIComponent(btoa(jsonData))}`;
            
            // QR kod resmini oluştur
            const {img, url} = generateQRImage(viewerUrl, 300);
            
            // QR kodu göster
            qrContainer.innerHTML = '';
            qrContainer.appendChild(img);
            
            // İndirme butonunu aktifleştir
            if (downloadButton) {
                downloadButton.disabled = false;
                downloadButton.onclick = () => downloadQRCode(url, `liste-${data.title || 'qr'}.png`);
            }
        } catch (error) {
            showError('QR kod oluşturulurken hata oluştu');
            console.error('QR kod hatası:', error);
        }
    }

    function setupButtons(listId) {
        // Ana sayfaya dönüş butonu
        if (backButton) {
            backButton.onclick = () => window.location.href = 'index.html';
        }

        // Düzenleme butonu
        if (editButton) {
            editButton.onclick = () => window.location.href = `index.html?edit=${listId}`;
        }
    }

    function downloadQRCode(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});