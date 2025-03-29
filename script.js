document.getElementById('add-row').addEventListener('click', function() {
    const table = document.getElementById('list-table').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);
    
    cell1.innerHTML = '<input type="text" placeholder="Ne Olduğu">';
    cell2.innerHTML = '<input type="text" placeholder="Miktarı/Değeri">';
    cell3.innerHTML = '<input type="file" accept="image/*">';
    cell4.innerHTML = '<button class="delete-row">Sil</button>';
    
    cell4.querySelector('.delete-row').addEventListener('click', function() {
        newRow.remove();
    });
});

document.getElementById('save-list').addEventListener('click', function() {
    const title = document.getElementById('list-title').value;
    const table = document.getElementById('list-table');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    const listContent = {
        title: title,
        items: []
    };
    
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const item = {
            description: cells[0].querySelector('input').value,
            value: cells[1].querySelector('input').value,
            image: cells[2].querySelector('input').files[0] ? URL.createObjectURL(cells[2].querySelector('input').files[0]) : null
        };
        listContent.items.push(item);
    }
    
    // Listeyi kaydetme işlemi
    localStorage.setItem('savedList', JSON.stringify(listContent));
    
    // QR kodu oluşturma ve gösterme
    const qrCodeContainer = document.getElementById('qr-code');
    qrCodeContainer.innerHTML = ''; // Mevcut QR kodunu temizle
    
    const qrCode = new QRCode(qrCodeContainer, {
        text: JSON.stringify(listContent),
        width: 256, // QR kod genişliğini arttır
        height: 256 // QR kod yüksekliğini arttır
    });
    
    alert('Liste kaydedildi ve QR kodu oluşturuldu!');
});

function loadListFromQRCode(qrCodeData) {
    const listContent = JSON.parse(qrCodeData);
    document.getElementById('list-title').value = listContent.title;
    
    const table = document.getElementById('list-table').getElementsByTagName('tbody')[0];
    table.innerHTML = ''; // Mevcut satırları temizle
    
    listContent.items.forEach(item => {
        const newRow = table.insertRow();
        
        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        const cell3 = newRow.insertCell(2);
        const cell4 = newRow.insertCell(3);
        
        cell1.innerHTML = `<input type="text" value="${item.description}">`;
        cell2.innerHTML = `<input type="text" value="${item.value}">`;
        cell3.innerHTML = `<input type="file" accept="image/*">`;
        cell4.innerHTML = '<button class="delete-row">Sil</button>';
        
        cell4.querySelector('.delete-row').addEventListener('click', function() {
            newRow.remove();
        });
        
        if (item.image) {
            const img = document.createElement('img');
            img.src = item.image;
            img.style.width = '50px';
            cell3.appendChild(img);
        }
    });
}

document.getElementById('qr-code').addEventListener('click', function() {
    const qrCodeData = prompt('QR kodu verisini girin:');
    if (qrCodeData) {
        loadListFromQRCode(qrCodeData);
    }
});

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('data');
    if (data) {
        loadListFromQRCode(decodeURIComponent(data));
    }
}