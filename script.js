// QR Kodundan gelen veriyi al
function getListFromQRCode() {
    // URL'den 'data' parametresini al
    const urlParams = new URLSearchParams(window.location.search);
    const qrData = urlParams.get('data');

    if (qrData) {
        // QR kodundan gelen veriyi çözümle (Base64 çözümlemesi)
        const listData = JSON.parse(atob(qrData)); // Base64 decode ve JSON parse

        // Liste Başlığı
        document.getElementById('viewListTitle').innerText = listData.listName;

        // Listeyi Görüntüle
        const viewTableBody = document.getElementById('viewListBody');
        viewTableBody.innerHTML = ''; // Önceden eklenen satırları temizle

        // Liste öğelerini tabloya ekle
        listData.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.itemName}</td>
                <td>${item.itemAmount}</td>
                <td><img src="${item.itemImage}" alt="${item.itemName}" style="width: 50px;"></td>
            `;
            viewTableBody.appendChild(row);
        });

        // Düzenle butonunu göster
        document.getElementById('editListBtn').style.display = 'inline-block';
    } else {
        alert("Geçersiz QR Kodu!");
    }
}

// Düzenle Butonuna Tıklama
document.getElementById('editListBtn').addEventListener('click', function() {
    // Düzenleme sayfasına yönlendir
    window.location.href = 'index.html'; // Ya da uygun düzenleme sayfası
});

// Sayfa yüklendiğinde listeyi al
window.onload = getListFromQRCode;
