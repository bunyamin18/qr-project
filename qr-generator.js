// QR kod oluşturma ve görüntüleme işlemleri
document.addEventListener('DOMContentLoaded', function () {
    console.log('QR Generator sayfası yüklendi');

    // DOM öğelerini seç
    const qrContainer = document.getElementById('qrContainer');
    const listForm = document.getElementById('listForm');
    const addItemButton = document.getElementById('addItemButton');
    const itemsContainer = document.getElementById('itemsContainer');

    // Liste öğelerini tutacak bir dizi
    let items = [];

    // Yeni öğe ekleme
    addItemButton.addEventListener('click', function () {
        const newItem = document.createElement('div');
        newItem.className = 'form-group';
        newItem.innerHTML = `
            <input type="text" class="form-control item-content" placeholder="Öğe İçeriği" required>
            <input type="text" class="form-control item-value" placeholder="Öğe Değeri">
        `;
        itemsContainer.appendChild(newItem);
    });

    // Form gönderildiğinde QR kod oluştur
    listForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Liste başlığını al
        const title = document.getElementById('title').value;

        // Liste öğelerini al
        items = [];
        const itemElements = itemsContainer.querySelectorAll('.form-group');
        itemElements.forEach(itemElement => {
            const content = itemElement.querySelector('.item-content').value;
            const value = itemElement.querySelector('.item-value').value;
            items.push({ content, value });
        });

        // Liste verilerini oluştur
        const listData = {
            title,
            items
        };

        // QR kodu oluştur
        generateQRCode(listData);
    });

    // QR kod oluşturma fonksiyonu
    function generateQRCode(listData) {
        try {
            // Liste verilerini JSON'a çevir
            const jsonData = JSON.stringify(listData);
            const base64Data = btoa(unescape(encodeURIComponent(jsonData)));
            const finalUrl = `${window.location.origin}/viewer.html?data=${encodeURIComponent(base64Data)}`;

            console.log('Oluşturulan URL:', finalUrl);

            // QR kodu oluştur
            qrContainer.innerHTML = ''; // Önceki QR kodu temizle
            const qrCode = new QRCode(qrContainer, {
                text: finalUrl,
                width: 200,
                height: 200
            });
        } catch (error) {
            console.error('QR kod oluşturulamadı:', error);
            qrContainer.innerHTML = `<p style="color: red;">QR kod oluşturulamadı. Lütfen tekrar deneyin.</p>`;
        }
    }
});