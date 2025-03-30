import dataStorage from './services/dataStorage.js';
import qrcode from 'qrcodejs2';

document.addEventListener('DOMContentLoaded', function() {
    try {
        // DOM elementlerini al
        const qrContainer = document.getElementById('qrContainer');
        const downloadButton = document.querySelector('.download-button');
        const backButton = document.querySelector('.back-button');
        
        if (!qrContainer || !downloadButton || !backButton) {
            throw new Error('Gerekli DOM elementleri bulunamadı');
        }

        // URL'den liste ID'sini al
        const urlParams = new URLSearchParams(window.location.search);
        const listId = urlParams.get('listId');
        
        if (!listId) {
            throw new Error('Liste ID bulunamadı');
        }

        // Liste verisini al
        const listData = dataStorage.getList(listId);
        if (!listData) {
            throw new Error('Liste bulunamadı');
        }

        // QR kod içeriğini hazırla - kullanıcı bunu ziyaret edecek
        const qrContent = `https://okulprojesibunyamin.netlify.app/list.html?listId=${listId}`;

        // QR kodu oluştur - qrcode-generator kütüphanesini kullanarak
        const qr = qrcode(0, 'L');
        qr.addData(qrContent);
        qr.make();

        // QR kodu göster
        const qrImage = qr.createSvgTag(4);
        
        // Container'ı temizle
        qrContainer.innerHTML = qrImage;
        
        // QR kodu resmine erişim
        const svgElement = qrContainer.querySelector('svg');
        svgElement.style.width = '100%';
        svgElement.style.maxWidth = '300px';
        svgElement.style.height = 'auto';

        // İndirme butonuna tıklama event listener'ı
        downloadButton.addEventListener('click', () => {
            // SVG'yi PNG'ye dönüştür ve indir
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // Canvas'ı PNG'ye dönüştür ve indir
                const pngUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `liste_${listId}.png`;
                link.href = pngUrl;
                link.click();
            };
            
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        });

        // Geri butonu event listener'ı
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

    } catch (error) {
        console.error('QR kod oluşturma hatası:', error);
        alert(error.message || 'QR kod oluşturulurken bir hata oluştu');
    }
});
