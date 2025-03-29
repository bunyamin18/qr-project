function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function loadList() {
    const listData = getQueryParameter('data');
    if (!listData) {
        alert('Liste verisi bulunamadı!');
        return;
    }

    const listContent = JSON.parse(decodeURIComponent(listData));
    document.getElementById('list-title').innerText = listContent.title;

    const table = document.getElementById('list-table').getElementsByTagName('tbody')[0];
    table.innerHTML = ''; // Mevcut satırları temizle
    
    listContent.items.forEach(item => {
        const newRow = table.insertRow();
        
        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        const cell3 = newRow.insertCell(2);
        
        cell1.innerText = item.description;
        cell2.innerText = item.value;
        
        if (item.image) {
            const img = document.createElement('img');
            img.src = item.image;
            img.style.width = '50px';
            cell3.appendChild(img);
        }
    });

    // QR kodu oluşturma ve gösterme
    const qrCodeContainer = document.getElementById('qr-code');
    qrCodeContainer.innerHTML = ''; // Mevcut QR kodunu temizle
    
    const qrCode = new QRCode(qrCodeContainer, {
        text: JSON.stringify(listContent),
        width: 256, // QR kod genişliğini arttır
        height: 256 // QR kod yüksekliğini arttır
    });
}

document.getElementById('edit-list').addEventListener('click', function() {
    const listData = getQueryParameter('data');
    if (listData) {
        window.location.href = `index.html?data=${encodeURIComponent(listData)}`;
    }
});

window.onload = loadList;