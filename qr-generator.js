// URL'den liste ID'sini al
const urlParams = new URLSearchParams(window.location.search);
const listId = urlParams.get('listId');
let currentListData = null;

if (listId) {
    try {
        // Liste verisini al
        fetch(`https://okulprojesibunyamin.netlify.app/api/lists/${listId}`)
        .then(response => response.json())
        .then(data => {
            currentListData = data;
            
            if (!currentListData) {
                throw new Error('Liste bulunamadı');
            }

            // QR kodu oluştur
            const qrPreview = document.getElementById('qrPreview');
            const qr = new QRCode(qrPreview, {
                text: `https://okulprojesibunyamin.netlify.app/list.html?listId=${currentListData.id}`,
                width: 256,
                height: 256,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        })
        .catch(error => {
            console.error('Veri yükleme hatası:', error);
            alert('Liste verisi yüklenirken bir hata oluştu');
            window.location.href = 'index.html';
        });

    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        alert('Liste verisi yüklenirken bir hata oluştu');
        window.location.href = 'index.html';
        return;
    }
}

// İndirme butonu event listener'ı
document.getElementById('downloadQR').addEventListener('click', () => {
    if (currentListData) {
        const qrElement = document.querySelector('.qr-preview canvas');
        if (qrElement) {
            const link = document.createElement('a');
            link.download = `liste-qr-${currentListData.id}.png`;
            link.href = qrElement.toDataURL("image/png");
            link.click();
        }
    }
});

// Listeye dön butonu event listener'ı
document.getElementById('backToList').addEventListener('click', () => {
    if (currentListData) {
        window.location.href = `list.html?listId=${currentListData.id}`;
    }
});

// Yeni liste oluşturma butonu event listener'ı
document.querySelector('.new-list-button').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Düzenleme butonu event listener'ı
document.querySelector('.edit-button').addEventListener('click', () => {
    if (currentListData) {
        window.location.href = `index.html?listId=${currentListData.id}`;
    }
});
