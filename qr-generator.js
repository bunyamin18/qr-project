// QR Generator Script
// NOT: Bu dosya script.js tarafından yüklenen dataStorage objesini kullanır
// Global olarak tanımlanan window.dataStorage'ı kullanacağız - import yapmayacağız

// Gerekli elementleri sakla
let qrContainer;
let downloadButton;
let backButton;

// QR kodu oluştur
function generateQRCode(listId) {
    try {
        console.log('generateQRCode çağrıldı, listId:', listId);
        
        // Liste verisini al
        if (!window.dataStorage) {
            throw new Error('dataStorage bulunamadı. Lütfen sayfayı yenileyin.');
        }
        
        const listData = window.dataStorage.getList(listId);
        console.log('Liste verisi:', listData);
        
        if (!listData) {
            throw new Error('Liste bulunamadı. Geçersiz veya silinmiş bir QR kod olabilir.');
        }

        // QR kod içeriğini hazırla - göreceli URL kullanarak daha güvenli
        const baseUrl = window.location.origin;
        const qrContent = `${baseUrl}/list.html?listId=${listId}`;
        console.log('QR içeriği:', qrContent);

        // QR kodunu oluştur - qrcode.js kütüphanesi kullanılıyor
        if (typeof QRCode === 'undefined') {
            throw new Error('QRCode kütüphanesi yüklenemedi. Lütfen internet bağlantınızı kontrol edin.');
        }
        
        // Önceki QR kodunu temizle
        qrContainer.innerHTML = '';
        
        // Yeni QR kodu oluştur
        new QRCode(qrContainer, {
            text: qrContent,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H // Yüksek hata düzeltme seviyesi
        });
        
        console.log('QR kodu başarıyla oluşturuldu');

        // İndirme butonuna tıklama işlevi ekle
        downloadButton.onclick = function() {
            try {
                // QR kod resmini al
                const img = qrContainer.querySelector('img');
                if (!img) {
                    throw new Error('QR kod resmi bulunamadı');
                }
                
                // Canvas oluştur ve resmi çiz
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                // Resmi indir
                const link = document.createElement('a');
                link.download = `liste_${listId}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error('QR kod indirme hatası:', error);
                alert('QR kod indirirken bir hata oluştu: ' + error.message);
            }
        };

    } catch (error) {
        console.error('QR kod oluşturma hatası:', error);
        qrContainer.innerHTML = `<div class="error-message">QR kod oluşturulamadı: ${error.message}</div>`;
    }
}

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('QR generator sayfası yüklendi');
        
        // DOM elementlerini al
        qrContainer = document.getElementById('qrContainer');
        downloadButton = document.querySelector('.download-button');
        backButton = document.querySelector('.back-button');
        
        if (!qrContainer) {
            throw new Error('qrContainer elementi bulunamadı');
        }
        
        if (!downloadButton) {
            console.warn('download-button elementi bulunamadı');
        }
        
        if (!backButton) {
            console.warn('back-button elementi bulunamadı');
        }

        // URL'den liste ID'sini al
        const urlParams = new URLSearchParams(window.location.search);
        const listId = urlParams.get('listId');
        
        if (!listId) {
            throw new Error('Liste ID bulunamadı. Lütfen geçerli bir QR kod kullanın.');
        }
        
        console.log('URL parametrelerinden liste ID alındı:', listId);

        // Geri butonu işlevi
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
        
        // QR kodu oluştur
        generateQRCode(listId);

    } catch (error) {
        console.error('Sayfa yükleme hatası:', error);
        if (qrContainer) {
            qrContainer.innerHTML = `<div class="error-message">Hata: ${error.message}</div>`;
        } else {
            alert('Sayfa yüklenirken bir hata oluştu: ' + error.message);
        }
    }
});
