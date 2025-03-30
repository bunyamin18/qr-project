import dataStorage from './services/dataStorage.js';

// URL'den liste ID'sini al
const urlParams = new URLSearchParams(window.location.search);
const listId = urlParams.get('listId');
let currentListData = null;

if (listId) {
    try {
        // Liste verisini al
        currentListData = dataStorage.getList(listId);
        
        if (!currentListData) {
            throw new Error('Liste bulunamadı');
        }

        // QR kodu oluştur
        const qrPreview = document.getElementById('qrPreview');
        if (!qrPreview) {
            throw new Error('QR kodu gösterimi için gerekli element bulunamadı');
        }

        const qr = new QRCode(qrPreview, {
            text: `https://okulprojesibunyamin.netlify.app/list.html?listId=${currentListData.id}`,
            width: 300,
            height: 300,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // Liste önizlemesini göster
        const listPreview = document.getElementById('listPreview');
        if (listPreview) {
            listPreview.innerHTML = '';
            
            // Başlığı göster
            const titleElement = document.createElement('h3');
            titleElement.textContent = currentListData.title;
            titleElement.style.marginBottom = '16px';
            listPreview.appendChild(titleElement);

            // Öğeleri göster
            currentListData.items.forEach(item => {
                const itemRow = document.createElement('div');
                itemRow.className = 'list-item';
                
                itemRow.innerHTML = `
                    <div class="list-item-content">${escapeHtml(item.content)}</div>
                    <div class="list-item-value">${escapeHtml(item.value)}</div>
                    ${item.image ? `<img src="${item.image}" class="list-item-image" alt="Öğe resmi">` : ''}
                `;
                listPreview.appendChild(itemRow);
            });
        }

    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        alert(error.message || 'Liste verisi yüklenirken bir hata oluştu');
        window.location.href = 'index.html';
    }
}

// İndirme butonu event listener'ı
document.getElementById('downloadQR').addEventListener('click', () => {
    try {
        if (!currentListData) {
            throw new Error('Liste verisi bulunamadı');
        }

        const qrElement = document.querySelector('.qr-preview canvas');
        if (!qrElement) {
            throw new Error('QR kodu bulunamadı');
        }

        const link = document.createElement('a');
        link.download = `liste-qr-${currentListData.id}.png`;
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
        if (!currentListData) {
            throw new Error('Liste verisi bulunamadı');
        }

        window.location.href = `list.html?listId=${currentListData.id}`;

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
        if (!currentListData) {
            throw new Error('Liste verisi bulunamadı');
        }

        window.location.href = `index.html?listId=${currentListData.id}`;

    } catch (error) {
        console.error('Düzenleme hatası:', error);
        alert(error.message || 'Düzenleme sırasında bir hata oluştu');
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
