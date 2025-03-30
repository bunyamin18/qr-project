import dataStorage from './services/dataStorage.js';

// Gerekli elementleri sakla
let qrContainer;
let downloadButton;
let backButton;
let currentListData;

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
        const qr = new QRCode(qrContainer, {
            text: qrContent,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // İndirme butonuna tıklama event listener'ı
        downloadButton.addEventListener('click', () => {
            const canvas = qrContainer.querySelector('img');
            if (canvas) {
                const link = document.createElement('a');
                link.download = `liste_${listId}.png`;
                link.href = canvas.src;
                link.click();
            }
        });

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
        
        if (!qrContainer || !downloadButton || !backButton) {
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
            window.location.href = 'list.html?listId=' + listId;
        });

    } catch (error) {
        console.error('Sayfa yükleme hatası:', error);
        alert(error.message || 'Sayfa yüklenirken bir hata oluştu');
    }
});
