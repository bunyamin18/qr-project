let items = [];

// Mevcut listeyi yükle
function loadList() {
    const storedList = localStorage.getItem('itemList');
    if (storedList) {
        items = JSON.parse(storedList);
        updateTable();
    }
}

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
    items.forEach((item) => {
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
    localStorage.setItem('itemList', listData); // Listeyi localStorage'a kaydet

    const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?data=' + encodeURIComponent(location.href.replace('index.html', 'list.html') + '?list=' + btoa(listData));
    qrCodeContainer.innerHTML = `<img src="${qrCodeUrl}" alt="QR Kodu">`;
});

// Sayfa yüklendiğinde listeyi yükle
loadList();
