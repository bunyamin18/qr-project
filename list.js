document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('id');
    
    if (listId) {
        const savedList = localStorage.getItem(listId);
        
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

function editList() {
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('id');
    const savedList = JSON.parse(localStorage.getItem(listId));
    
    const editListModal = document.getElementById('editListModal');
    const editListBody = document.getElementById('editListBody');
    editListBody.innerHTML = '';
    
    savedList.items.forEach((item, index) => {
        const row = editListBody.insertRow();
        row.innerHTML = `
            <td><input type="text" class="edit-item-name" value="${item.name}"></td>
            <td><input type="text" class="edit-item-value" value="${item.value}"></td>
            <td>
                ${item.image ? `<img src="${item.image}" style="max-width:100px; max-height:100px;">` : 'Resim Yok'}
                <input type="file" accept="image/*" class="edit-item-image">
            </td>
            <td><button onclick="removeEditRow(this)">Sil</button></td>
        `;
    });
    
    editListModal.style.display = 'flex';
}

function addNewEditRow() {
    const editListBody = document.getElementById('editListBody');
    const newRow = editListBody.insertRow();
    
    newRow.innerHTML = `
        <td><input type="text" class="edit-item-name"></td>
        <td><input type="text" class="edit-item-value"></td>
        <td><input type="file" accept="image/*" class="edit-item-image"></td>
        <td><button onclick="removeEditRow(this)">Sil</button></td>
    `;
}

function removeEditRow(button) {
    button.closest('tr').remove();
}

function saveEditedList() {
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('id');
    const savedList = JSON.parse(localStorage.getItem(listId));
    
    const editListBody = document.getElementById('editListBody');
    const rows = editListBody.getElementsByTagName('tr');
    
    const updatedItems = [];
    
    for (let row of rows) {
        const itemName = row.querySelector('.edit-item-name').value;
        const itemValue = row.querySelector('.edit-item-value').value;
        const imageInput = row.querySelector('.edit-item-image');
        
        if (itemName && itemValue) {
            const listItem = {
                name: itemName,
                value: itemValue,
                image: null
            };
            
            if (imageInput.files.length > 0) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    listItem.image = e.target.result;
                };
                reader.readAsDataURL(imageInput.files[0]);
            }
            
            updatedItems.push(listItem);
        }
    }
    
    savedList.items = updatedItems;
    localStorage.setItem(listId, JSON.stringify(savedList));
    
    const editListModal = document.getElementById('editListModal');
    editListModal.style.display = 'none';
    
    location.reload();
}

function cancelEdit() {
    const editListModal = document.getElementById('editListModal');
    editListModal.style.display = 'none';
}