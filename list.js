// Gerekli elementleri sakla
let titleElement;
let itemsList;
let qrContainer;
let qrError;
let editButton;

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    // DOM elementlerini al
    titleElement = document.getElementById('listTitle');
    itemsList = document.getElementById('itemsList');
    qrContainer = document.getElementById('qrContainer');
    qrError = document.getElementById('qrError');
    editButton = document.querySelector('.edit-button');

    // Kontroller
    if (!titleElement || !itemsList || !qrContainer || !qrError || !editButton) {
        console.error('Gerekli DOM elementleri bulunamadı');
        alert('Sayfa yüklenirken bir hata oluştu');
        return;
    }

    // URL parametrelerini al
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('id');

    // Liste ID kontrolü
    if (!listId) {
        alert('Liste ID bulunamadı');
        window.location.href = 'index.html';
        return;
    }

    // Liste verisini al
    let listData = null;

    // localStorage'dan veri al
    try {
        const storedData = localStorage.getItem(`list_${listId}`);
        if (storedData) {
            listData = JSON.parse(storedData);
            console.log('LocalStorage'dan veri alındı');
            
            // Veri yapısını kontrol et
            if (!isValidListData(listData)) {
                throw new Error('Geçersiz liste verisi');
            }

            // QR kod oluştur
            createQRCode(listId).then(qrData => {
                if (qrData) {
                    listData.qrCode = qrData;
                    displayListData(listData);
                } else {
                    throw new Error('QR kod oluşturulamadı');
                }
            }).catch(error => {
                console.error('QR kod oluşturma hatası:', error);
                alert('QR kod oluşturulamadı');
            });

        } else {
            throw new Error('Liste bulunamadı');
        }
    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        alert('Liste verisi yüklenirken bir hata oluştu');
        window.location.href = 'index.html';
        return;
    }

    // Düzenleme butonu event listener'ı ekle
    editButton.onclick = () => {
        window.location.href = `index.html?edit=true&id=${listId}`;
    };

    // Düzenleme butonunu ve stilini düzelt
    editButton.textContent = 'Düzenle';
    editButton.style.backgroundColor = '#4CAF50';
    editButton.style.color = '#ffffff';
    editButton.style.padding = '10px 20px';
    editButton.style.border = 'none';
    editButton.style.borderRadius = '5px';
    editButton.style.cursor = 'pointer';
});

// Veri yapısını kontrol et
function isValidListData(data) {
    return (
        data &&
        typeof data === 'object' &&
        typeof data.id === 'string' &&
        typeof data.title === 'string' &&
        Array.isArray(data.items) &&
        data.items.every(item => 
            item &&
            typeof item === 'object' &&
            typeof item.content === 'string' &&
            typeof item.value === 'string'
        )
    );
}

// Liste verisini göster
function displayListData(data) {
    // Başlığı göster
    titleElement.textContent = data.title;
    
    // Öğeleri göster
    data.items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'list-row';
        
        row.innerHTML = `
            <div class="content">
                <span class="label">İçerik</span>
                <div class="value">${escapeHtml(item.content)}</div>
            </div>
            <div class="value-container">
                <span class="label">Miktar/Değer</span>
                <div class="value">${escapeHtml(item.value)}</div>
            </div>
            <div class="image-container">
                <span class="label">Resim</span>
                ${item.image ? 
                    `<div class="image-wrapper">
                        <img src="${item.image}" class="item-image" alt="Ürün resmi" style="max-width: 100px; max-height: 100px;">
                    </div>` : 
                    '<div class="value">Resim yok</div>'
                }
            </div>
        `;
        
        itemsList.appendChild(row);
    });

    // QR kodu göster
    if (data.qrCode) {
        const qrImg = document.createElement('img');
        qrImg.src = data.qrCode;
        qrImg.alt = 'QR Kod';
        qrImg.style.maxWidth = '256px';
        qrImg.style.maxHeight = '256px';
        
        qrContainer.innerHTML = '';
        qrContainer.appendChild(qrImg);
        qrError.style.display = 'none';
    } else {
        qrContainer.innerHTML = '';
        qrError.style.display = 'block';
        qrError.textContent = 'QR kod oluşturulamadı';
    }
}

// HTML escape fonksiyonu
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// QR kod oluşturma fonksiyonu
async function createQRCode(listId) {
    return new Promise((resolve, reject) => {
        try {
            // QR kod kütüphanesini kontrol et
            if (typeof QRCode === 'undefined') {
                console.error('QR kod kütüphanesi yüklenemedi');
                reject(new Error('QR kod kütüphanesi yüklenemedi'));
                return;
            }

            // QR kod oluştur
            const qrElement = document.createElement('div');
            document.body.appendChild(qrElement);
            
            const qr = new QRCode(qrElement, {
                text: `list.html?id=${listId}`,
                width: 256,
                height: 256,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            // QR kodu veri olarak al
            const canvas = qrElement.querySelector('canvas');
            if (canvas) {
                const qrData = canvas.toDataURL();
                document.body.removeChild(qrElement);
                resolve(qrData);
            } else {
                document.body.removeChild(qrElement);
                reject(new Error('QR kod oluşturulamadı'));
            }

        } catch (error) {
            console.error('QR kod oluşturma hatası:', error);
            reject(error);
        }
    });
}
