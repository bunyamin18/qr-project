document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('listForm');
    const itemsContainer = document.getElementById('items');
    const addRowButton = document.getElementById('addRow');
    const isEditing = window.location.search.includes('edit=true');
    
    // If we're editing, load the existing data
    if (isEditing) {
        const editingData = JSON.parse(localStorage.getItem('editingList'));
        if (editingData) {
            document.getElementById('listTitle').value = editingData.title;
            
            // Remove default empty row
            itemsContainer.innerHTML = '';
            
            // Add rows for each item
            editingData.items.forEach(item => {
                addNewRow(item);
            });
        }
    }

    // Add row event listener
    addRowButton.addEventListener('click', () => addNewRow());

    // Delete row event delegation
    itemsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-row')) {
            const row = e.target.closest('.form-row');
            if (itemsContainer.children.length > 1) {
                row.remove();
            }
        }
    });

    // Image preview functionality
    itemsContainer.addEventListener('change', function(e) {
        if (e.target.classList.contains('item-image')) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.createElement('img');
                    preview.src = e.target.result;
                    preview.classList.add('image-preview');
                    
                    const container = e.target.parentElement;
                    // Remove existing preview if any
                    const existingPreview = container.querySelector('.image-preview');
                    if (existingPreview) {
                        existingPreview.remove();
                    }
                    
                    // Update stored image value
                    const storedImage = container.querySelector('.stored-image');
                    if (storedImage) {
                        storedImage.value = e.target.result;
                    }
                    
                    container.appendChild(preview);
                };
                reader.readAsDataURL(file);
            }
        }
    });

    // Form submit handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const listData = {
            title: document.getElementById('listTitle').value,
            items: []
        };

        // Collect all items
        document.querySelectorAll('.form-row.item-row').forEach(row => {
            const content = row.querySelector('.item-content').value;
            const quantity = row.querySelector('.item-quantity').value;
            const storedImage = row.querySelector('.stored-image');
            const imagePreview = row.querySelector('.image-preview');
            
            listData.items.push({
                content: content,
                quantity: quantity,
                image: storedImage ? storedImage.value : (imagePreview ? imagePreview.src : null)
            });
        });

        // Generate a unique ID for the list
        const listId = isEditing ? JSON.parse(localStorage.getItem('editingList')).id : 
                      Date.now().toString(36) + Math.random().toString(36).substr(2);
        listData.id = listId;

        // Generate QR code with absolute URL
        const qr = qrcode(0, 'L');
        const currentUrl = window.location.href;
        const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);
        const listUrl = baseUrl + `list.html?id=${listId}`;
        qr.addData(listUrl);
        qr.make();
        listData.qrCode = qr.createDataURL();

        // Save to localStorage with the ID
        localStorage.setItem(`list_${listId}`, JSON.stringify(listData));
        localStorage.setItem('currentList', JSON.stringify(listData));

        if (isEditing) {
            localStorage.removeItem('editingList');
        }

        // Redirect to list view
        window.location.href = `list.html?id=${listId}`;
    });

    function addNewRow(item = null) {
        const newRow = document.createElement('div');
        newRow.className = 'form-row item-row';
        newRow.innerHTML = `
            <div class="input-group content-field">
                <label>İçerik:</label>
                <input type="text" class="item-content" required value="${item ? item.content : ''}">
            </div>
            <div class="input-group">
                <label>Miktar:</label>
                <input type="text" class="item-quantity" required value="${item ? item.quantity : ''}">
            </div>
            <div class="input-group">
                <label>Resim:</label>
                <input type="file" class="item-image" accept="image/*">
                ${item && item.image ? `<img src="${item.image}" class="image-preview">` : ''}
                <input type="hidden" class="stored-image" value="${item && item.image ? item.image : ''}">
            </div>
            <button type="button" class="delete-row">×</button>
        `;
        itemsContainer.appendChild(newRow);
    }
});
