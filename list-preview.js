import dataStorage from './services/dataStorage.js';

// DOM elementleri
const listTitle = document.getElementById('listTitle');
const listContent = document.getElementById('listContent');
const qrContainer = document.getElementById('qrContainer');
const downloadButton = document.getElementById('downloadQR');
const backButton = document.getElementById('backToList');

// Liste önizlemesini göster
async function displayListPreview(listId) {
    try {
        // Liste verisini al
        const listData = await dataStorage.getList(listId);
        if (!listData) {
            throw new Error('Liste bulunamadı');
        }

        // Liste başlığını göster
        listTitle.textContent = listData.title;

        // Liste içeriğini göster
        listContent.innerHTML = listData.items.map(item => `
            <div class="list-item">
                <div class="item-content">${item.content}</div>
                <div class="item-value">${item.value || ''}</div>
                ${item.image ? `<img src="${item.image}" class="item-image" alt="Resim">` : ''}
            </div>
        `).join('');

        // QR kod içeriğini hazırla
        const qrContent = `https://okulprojesibunyamin.netlify.app/list.html?listId=${listId}`;

        // QR kodu oluştur
        const qr = new QRCode(qrContainer, {
            text: qrContent,
            width: 256,
            height: 256,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        // İndirme butonuna tıklama event listener'ı
        downloadButton.addEventListener('click', () => {
            const canvas = qr.getCanvas();
            const link = document.createElement('a');
            link.download = `liste_${listId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });

    } catch (error) {
        console.error('Liste önizleme hatası:', error);
        alert('Liste önizlenirken bir hata oluştu');
    }
}

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // URL'den liste ID'sini al
        const urlParams = new URLSearchParams(window.location.search);
        const listId = urlParams.get('listId');
        
        if (!listId) {
            throw new Error('Liste ID bulunamadı');
        }

        // Liste önizlemesini göster
        await displayListPreview(listId);

        // Geri butonu event listener'ı
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

    } catch (error) {
        console.error('Sayfa yükleme hatası:', error);
        alert(error.message || 'Sayfa yüklenirken bir hata oluştu');
    }
});
