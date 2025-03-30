import dataStorage from './services/dataStorage.js';
import qrcode from 'qrcodejs2';

// Gerekli elementleri sakla
let qrContainer;
let downloadButton;
let backButton;

// QR kodu oluştur
function generateQRCode(listId) {
    try {
        // Liste verisini al
        const listData = dataStorage.getList(listId);
        if (!listData) {
            throw new Error('Liste bulunamadı');
        }

        // QR kod içeriğini hazırla
        const qrContent = `https://okulprojesibunyamin.netlify.app/list.html?listId=${listId}`;

        // QR kodu oluştur - farklı bir metot kullanıyoruz
        const qr = qrcode(4, 'M'); // Daha yüksek hata düzeltme seviyesi
        qr.addData(qrContent);
        qr.make();

        // QR kodu göster - createDataURL yerine createImgTag
        const qrImageTag = qr.createImgTag(5, 0);
        
        // Container'ı temizle
        qrContainer.innerHTML = '';
        
        // QR kodunu HTML olarak ekle
        qrContainer.innerHTML = qrImageTag;
        
        // QR kod resmi
        const img = qrContainer.querySelector('img');
        if (img) {
            img.style.maxWidth = '100%';
            img.style.maxHeight = '300px';
            img.style.objectFit = 'contain';
        }

        // İndirme butonuna tıklama event listener'ı
        downloadButton.addEventListener('click', () => {
            if (img) {
                // Canvas kullanarak daha iyi resim kalitesi
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                const link = document.createElement('a');
                link.download = `liste_${listId}.png`;
                link.href = canvas.toDataURL('image/png');
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
            window.location.href = 'index.html';
        });

    } catch (error) {
        console.error('Sayfa yükleme hatası:', error);
        alert(error.message || 'Sayfa yüklenirken bir hata oluştu');
    }
});
