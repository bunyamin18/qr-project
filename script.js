document.getElementById('addRow').addEventListener('click', function() {
    const tbody = document.querySelector('#listTable tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" placeholder="Öğe Adı"></td>
        <td><input type="text" placeholder="Miktar / Değer"></td>
        <td><button onclick="this.parentNode.parentNode.remove()">Sil</button></td>
    `;
    tbody.appendChild(row);
});

document.getElementById('saveList').addEventListener('click', function() {
    const title = document.getElementById('listTitle').value;
    const rows = document.querySelectorAll('#listTable tbody tr');
    let listData = { title: title, items: [] };

    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        listData.items.push({
            name: inputs[0].value,
            quantity: inputs[1].value
        });
    });

    const listId = Date.now();
    localStorage.setItem(`list-${listId}`, JSON.stringify(listData));

    const qrCodeContainer = document.getElementById('qrCodeContainer');
    qrCodeContainer.innerHTML = '';

    const qrCodeUrl = `liste.html?id=${listId}`;
    new QRCode(qrCodeContainer, qrCodeUrl);
});
