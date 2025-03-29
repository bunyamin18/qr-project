let items = [];

document.getElementById('addItem').addEventListener('click', function() {
    const name = document.getElementById('itemName').value;
    const value = document.getElementById('itemValue').value;
    const imageInput = document.getElementById('itemImage');
    const image = imageInput.files[0];

    if (name && value && image) {
        const reader = new FileReader();
        reader.onload = function(e) {
            items.push({ name, value, image: e.target.result });
            updateTable();
            clearInputs();
        };
        reader.readAsDataURL(image);
    } else {
        alert('Lütfen tüm alanları doldurun.');
    }
});

function updateTable() {
    const tbody = document.getElementById('itemTable').querySelector('tbody');
    tbody.innerHTML = '';
    items.forEach((item, index) => {
        const row = `<tr>
            <td>${item.name}</td>
            <td>${item.value}</td>
            <td><img src="${item.image}" alt="${item.name}" width="50"></td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function clearInputs() {
    document.getElementById('itemName').value = '';
    document.getElementById('itemValue').value = '';
    document.getElementById('itemImage').value = '';
}

document.getElementById('saveList').addEventListener('click', function() {
    const qrCodeContainer = document.getElementById('qrCode');
    const listData = JSON.stringify(items);
    const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?data=' + encodeURIComponent(listData);
    qrCodeContainer.innerHTML = `<img src="${qrCodeUrl}" alt="QR Kodu">`;
});
