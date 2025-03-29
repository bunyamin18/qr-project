let items = [];

// URL'den liste verilerini al
function getListFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedList = urlParams.get('list');
    if (encodedList) {
        const decodedList = atob(encodedList);
        items = JSON.parse(decodedList);
        updateTable();
    }
}

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

document.getElementById('editList').addEventListener('click', function() {
    localStorage.setItem('itemList', JSON.stringify(items)); // Mevcut listeyi kaydet
    window.location.href = 'index.html'; // Ana sayfaya yönlendir
});

// Sayfa yüklendiğinde listeyi yükle
getListFromUrl();
