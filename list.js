import dataStorage from './services/dataStorage.js';
import QRCode from 'qrcode';

// DOM elementleri
const listTitle = document.getElementById('listTitle');
const listContent = document.getElementById('listContent');
const qrContainer = document.getElementById('qrContainer');
const backButton = document.getElementById('backToList');

// Liste içeriğini göster
async function displayListContent(listId) {
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
        const qrData = await QRCode.toDataURL(qrContent, {
            width: 256,
            height: 256,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff'
            },
            errorCorrectionLevel: 'H'
        });

        // QR kodu göster
        const qrImage = document.createElement('img');
        qrImage.src = qrData;
        qrImage.style.maxWidth = '256px';
        qrImage.style.maxHeight = '256px';
        
        qrContainer.innerHTML = '';
        qrContainer.appendChild(qrImage);

    } catch (error) {
        console.error('Liste gösterme hatası:', error);
        alert('Liste gösterilirken bir hata oluştu');
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

        // Liste içeriğini göster
        await displayListContent(listId);

        // Geri butonu event listener'ı
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

    } catch (error) {
        console.error('Sayfa yükleme hatası:', error);
        alert(error.message || 'Sayfa yüklenirken bir hata oluştu');
    }
});
