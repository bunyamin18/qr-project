document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('id');
    
    console.log("Aranan Liste Kimliği:", listId); // Kontrol için konsol çıktısı
    
    if (listId) {
        const savedList = localStorage.getItem(listId);
        
        console.log("Bulunan Liste:", savedList); // Kontrol için konsol çıktısı
        
        if (savedList) {
            const list = JSON.parse(savedList);
            displayList(list);
        } else {
            const listDetailsBody = document.getElementById('listDetailsBody');
            listDetailsBody.innerHTML = '<tr><td colspan="3">Liste bulunamadı. Lütfen doğru QR kodu kullandığınızdan emin olun.</td></tr>';
        }
    } else {
        const listDetailsBody = document.getElementById('listDetailsBody');
        listDetailsBody.innerHTML = '<tr><td colspan="3">Geçerli bir liste kimliği bulunamadı.</td></tr>';
    }
});

function displayList(list) {
    const listTitleElement = document.getElementById('listTitle');
    const listDetailsBody = document.getElementById('listDetailsBody');
    
    listTitleElement.textContent = list.title;
    listDetailsBody.innerHTML = ''; // Önceki içeriği temizle
    
    list.items.forEach(item => {
        const row = listDetailsBody.insertRow();
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.value}</td>
            <td>${item.image ? `<img src="${item.image}" style="max-width:100px; max-height:100px;">` : 'Resim Yok'}</td>
        `;
    });
}

// Diğer fonksiyonlar aynı kalacak