import dataStorage from './services/dataStorage.js';
import qrcode from './qrcode.js';

// Gerekli elementleri sakla
let qrContainer;
let downloadButton;
let backButton;
let listTitleElement;
let itemsPreviewElement;
let currentListData;

// Liste önizlemesini göster
function showListPreview(listData) {
    try {
        // Başlığı göster
        listTitleElement.textContent = listData.title;

        // Öğeleri göster
        itemsPreviewElement.innerHTML = '';
        listData.items.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'preview-item';
            
            const content = item.content || '';
            const value = item.value || '';
            const image = item.image || '';

            itemDiv.innerHTML = `
                <div class="item-content">${content}</div>
                <div class="item-value">${value}</div>
                ${image ? `<img src="${image}" class="item-image">` : ''}
            `;

            itemsPreviewElement.appendChild(itemDiv);
        });

    } catch (error) {
        console.error('Liste önizleme hatası:', error);
        alert('Liste önizleme oluşturulurken bir hata oluştu');
    }
}

// QR kodu oluştur
function generateQRCode(listId) {
    try {
        // Liste verisini al
        currentListData = dataStorage.getList(listId);
        if (!currentListData) {
            throw new Error('Liste bulunamadı');
        }

        // QR kod içeriğini hazırla
        const qrContent = `https://okulprojesibunyamin.netlify.app/list.html?listId=${listId}`;

        // QR kodu oluştur
        const qr = qrcode(0, 'L');
        qr.addData(qrContent);
        qr.make();

        // QR kodu göster
        const qrImage = qr.createDataURL(4);
        
        // Container'ı temizle
        qrContainer.innerHTML = '';
        
        // QR kodunu göster
        const img = document.createElement('img');
        img.src = qrImage;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '300px';
        img.style.objectFit = 'contain';
        
        qrContainer.appendChild(img);

        // İndirme butonuna tıklama event listener'ı
        downloadButton.addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = `liste_${listId}.png`;
            link.href = qrImage;
            link.click();
        });

        // Liste önizlemesini göster
        showListPreview(currentListData);

    } catch (error) {
        console.error('QR kod oluşturma hatası:', error);
        alert('QR kod oluşturulurken bir hata oluştu');
    }
}

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    try {
        // DOM elementlerini al
        qrContainer = document.getElementById('qrContainer');
        downloadButton = document.querySelector('.download-button');
        backButton = document.querySelector('.back-button');
        listTitleElement = document.getElementById('listTitle');
        itemsPreviewElement = document.getElementById('itemsPreview');
        
        if (!qrContainer || !downloadButton || !backButton || !listTitleElement || !itemsPreviewElement) {
            throw new Error('Gerekli DOM elementleri bulunamadı');
        }

        // URL'den liste ID'sini al
        const urlParams = new URLSearchParams(window.location.search);
        const listId = urlParams.get('listId');
        
        if (!listId) {
            throw new Error('Liste ID bulunamadı');
        }

        // QR kodu oluştur
        generateQRCode(listId);

        // Geri butonu event listener'ı
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

    } catch (error) {
        console.error('Sayfa yükleme hatası:', error);
        alert(error.message || 'Sayfa yüklenirken bir hata oluştu');
    }
});
