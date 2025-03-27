window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const qrData = urlParams.get('data');

    if (qrData) {
        const listData = JSON.parse(atob(qrData));
        document.getElementById('listTitle').innerText = listData.listName;

        const viewList = document.getElementById('viewList');
        listData.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.itemName}</td>
                <td>${item.itemAmount}</td>
                <td><img src="${item.itemImage}" alt="${item.itemName}" style="width: 50px;"></td>
            `;
            viewList.appendChild(row);
        });

        document.getElementById('editButton').addEventListener('click', function() {
            localStorage.setItem('listData', JSON.stringify(listData));
            window.location.href = 'index.html';
        });
    } else {
        alert("Geçersiz QR Kodu!");
    }
};
