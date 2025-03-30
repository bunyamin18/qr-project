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

    // URL parametrelerinden veri al
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');

    // Veri kontrolü
    if (!encodedData) {
        alert('Liste verisi bulunamadı');
        window.location.href = 'index.html';
        return;
    }

    // Liste verisini al
    let listData = null;

    try {
        const decodedString = decodeURIComponent(encodedData);
        listData = JSON.parse(decodedString);
        console.log('URL parametresinden veri alındı');
        
        // Veri yapısını kontrol et
        if (!isValidListData(listData)) {
            throw new Error('Geçersiz liste verisi');
        }

        // QR kod oluştur
        createQRCode(listData.id).then(qrData => {
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

    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        alert('Liste verisi yüklenirken bir hata oluştu');
        window.location.href = 'index.html';
        return;
    }

    // Düzenleme butonu event listener'ı ekle
    editButton.onclick = () => {
        // Mevcut veriyi sakla
        const encodedData = encodeURIComponent(JSON.stringify(listData));
        window.location.href = `index.html?data=${encodedData}`;
    };
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
            <div class="item-content">${escapeHtml(item.content)}</div>
            <div class="item-value">${escapeHtml(item.value)}</div>
            ${item.image ? `<img src="${item.image}" class="item-image" alt="Öğe resmi">` : ''}
        `;
        itemsList.appendChild(row);
    });

    // QR kodu göster
    if (data.qrCode) {
        qrContainer.innerHTML = `
            <div class="qr-code-container">
                <img src="${data.qrCode}" alt="QR Kod">
                <p class="qr-text">${data.id}</p>
            </div>
        `;
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
    try {
        // QR kod içeriğini daha kompakt hale getir
        const compactData = {
            id: listId,
            v: 1 // Versiyon bilgisi
        };
        
        // JSON verisini base64'e dönüştür
        const jsonString = JSON.stringify(compactData);
        const encoder = new TextEncoder();
        const encoded = encoder.encode(jsonString);
        const base64 = btoa(String.fromCharCode(...encoded));

        // QR kod oluştur
        const qr = await QRCode.toDataURL(base64, {
            width: 256,
            margin: 1,
            color: {
                dark: '#000000FF',
                light: '#FFFFFFFF'
            }
        });

        return qr;
    } catch (error) {
        console.error('QR kod oluşturma hatası:', error);
        return null;
    }
}
