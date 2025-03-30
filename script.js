document.addEventListener('DOMContentLoaded', function() {
    const qrContentInput = document.getElementById('qrContent');
    const generateButton = document.getElementById('generateButton');
    const qrContainer = document.getElementById('qrContainer');

    if (!qrContentInput || !generateButton || !qrContainer) {
        console.error('Gerekli DOM elementleri bulunamadı');
        return;
    }

    generateButton.addEventListener('click', function() {
        const content = qrContentInput.value.trim();
        
        if (!content) {
            alert('Lütfen içerik girin');
            return;
        }

        try {
            // QR kodu oluştur
            const qr = qrcode(0, 'L');
            qr.addData(content);
            qr.make();

            // QR kodu göster
            const qrImage = qr.createDataURL(4);
            
            // Container'ı temizle
            qrContainer.innerHTML = '';
            
            // QR kodunu göster
            const img = document.createElement('img');
            img.src = qrImage;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '256px';
            img.style.objectFit = 'contain';
            
            qrContainer.appendChild(img);

            // İndirme butonu ekle
            const downloadButton = document.createElement('button');
            downloadButton.className = 'download-button';
            downloadButton.textContent = 'QR Kodu İndir';
            
            downloadButton.addEventListener('click', () => {
                const link = document.createElement('a');
                link.download = 'qr_kod.png';
                link.href = qrImage;
                link.click();
            });

            qrContainer.appendChild(downloadButton);

        } catch (error) {
            console.error('QR kod oluşturma hatası:', error);
            alert('QR kod oluşturulurken bir hata oluştu');
        }
    });
});