import dataStorage from './services/dataStorage.js';

// Gerekli elementleri sakla
let qrCodeElement;
let listPreview;
let downloadButton;
let backButton;

// Liste verisini göster
function displayListData(data) {
    try {
        // Başlığı göster
        const titleElement = document.getElementById('listTitle');
        if (titleElement) {
            titleElement.textContent = data.title;
        }

        // Listeyi göster
        const itemsContainer = document.getElementById('items');
        if (itemsContainer) {
            itemsContainer.innerHTML = '';
            
            data.items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'list-item';
                
                // İçeriği ve değeri göster
                itemElement.innerHTML = `
                    <div class="item-content">${escapeHtml(item.content)}</div>
                    <div class="item-value">${escapeHtml(item.value)}</div>
                `;

                // Resim varsa görüntüleme butonunu ekle
                if (item.image) {
                    const viewButton = document.createElement('button');
                    viewButton.className = 'view-image-button';
                    viewButton.textContent = 'Resmi Görüntüle';
                    
                    viewButton.addEventListener('click', () => {
                        window.open(item.image, '_blank');
                    });

                    itemElement.appendChild(viewButton);
                }

                itemsContainer.appendChild(itemElement);
            });
        }

        // QR kodu oluştur
        const qr = new QRCode(qrCodeElement, {
            text: `https://okulprojesibunyamin.netlify.app/list.html?listId=${data.id}`,
            width: 300,
            height: 300,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // İndirme butonu event listener'ı
        downloadButton.addEventListener('click', () => {
            const canvas = qrCodeElement.querySelector('canvas');
            if (canvas) {
                const link = document.createElement('a');
                link.download = `${data.title.replace(/\s+/g, '_')}_qr_code.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        });

        // Geri butonu event listener'ı
        backButton.addEventListener('click', () => {
            window.location.href = 'list.html?listId=' + data.id;
        });

    } catch (error) {
        console.error('Liste gösterme hatası:', error);
        alert('Liste gösterilemedi');
    }
}

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    try {
        // DOM elementlerini al
        qrCodeElement = document.getElementById('qrCode');
        listPreview = document.getElementById('listPreview');
        downloadButton = document.getElementById('downloadButton');
        backButton = document.getElementById('backButton');
        
        if (!qrCodeElement || !listPreview || !downloadButton || !backButton) {
            throw new Error('Gerekli DOM elementleri bulunamadı');
        }

        // URL'den veri al
        const urlParams = new URLSearchParams(window.location.search);
        const listId = urlParams.get('listId');
        
        if (listId) {
            // Liste verisini al
            const data = dataStorage.getList(listId);
            
            if (!data) {
                throw new Error('Liste bulunamadı');
            }

            // Veriyi göster
            displayListData(data);
        } else {
            throw new Error('Liste ID bulunamadı');
        }

    } catch (error) {
        console.error('Sayfa yükleme hatası:', error);
        alert(error.message || 'Sayfa yüklenirken bir hata oluştu');
    }
});

// HTML escape fonksiyonu
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// İndirme butonu event listener'ı
document.getElementById('downloadQR').addEventListener('click', () => {
    try {
        const qrElement = document.querySelector('.qr-preview canvas');
        if (!qrElement) {
            throw new Error('QR kodu bulunamadı');
        }

        const link = document.createElement('a');
        link.download = `liste-qr-${listId}.png`;
        link.href = qrElement.toDataURL("image/png");
        link.click();

    } catch (error) {
        console.error('QR kodu indirme hatası:', error);
        alert(error.message || 'QR kodu indirilirken bir hata oluştu');
    }
});

// Listeye dön butonu event listener'ı
document.getElementById('backToList').addEventListener('click', () => {
    try {
        window.location.href = `list.html?listId=${listId}`;

    } catch (error) {
        console.error('Listeye dönme hatası:', error);
        alert(error.message || 'Listeye dönme sırasında bir hata oluştu');
    }
});

// Yeni liste oluşturma butonu event listener'ı
document.querySelector('.new-list-button').addEventListener('click', () => {
    try {
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Yeni liste hatası:', error);
        alert(error.message || 'Yeni liste oluşturulurken bir hata oluştu');
    }
});

// Düzenleme butonu event listener'ı
document.querySelector('.edit-button').addEventListener('click', () => {
    try {
        window.location.href = `index.html?listId=${listId}`;

    } catch (error) {
        console.error('Düzenleme hatası:', error);
        alert(error.message || 'Düzenleme sırasında bir hata oluştu');
    }
});
