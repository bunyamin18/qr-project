import dataStorage from './services/dataStorage.js';
import QRCode from 'qrcode';

// DOM elementleri
const qrContainer = document.getElementById('qrContainer');
const downloadButton = document.getElementById('downloadQR');
const backButton = document.getElementById('backToList');

// QR kodu oluştur
async function generateQRCode(listId) {
    try {
        // Liste verisini al
        const listData = await dataStorage.getList(listId);
        if (!listData) {
            throw new Error('Liste bulunamadı');
        }

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

        // İndirme butonuna tıklama event listener'ı
        downloadButton.addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = `liste_${listId}.png`;
            link.href = qrData;
            link.click();
        });

    } catch (error) {
        console.error('QR kod oluşturma hatası:', error);
        alert('QR kod oluşturulurken bir hata oluştu');
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

        // QR kodu oluştur
        await generateQRCode(listId);

        // Geri butonu event listener'ı
        backButton.addEventListener('click', () => {
            window.location.href = 'list.html?listId=' + listId;
        });

    } catch (error) {
        console.error('Sayfa yükleme hatası:', error);
        alert(error.message || 'Sayfa yüklenirken bir hata oluştu');
    }
});
