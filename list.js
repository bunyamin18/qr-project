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
}

document.getElementById('edit-list').addEventListener('click', function() {
    const listData = getQueryParameter('data');
    if (listData) {
        window.location.href = `index.html?data=${listData}`;
    }
});

window.onload = loadList;