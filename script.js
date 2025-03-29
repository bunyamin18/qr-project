document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('listForm');
    const itemsContainer = document.getElementById('items');
    const addRowButton = document.getElementById('addRow');
    const saveButton = document.getElementById('saveButton');
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
    if (addRowButton) {
        addRowButton.addEventListener('click', () => addNewRow());
    }

    // Delete row event delegation
    if (itemsContainer) {
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
    }

    // Form submit handler
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Form submitted');

            // Disable save button
            if (saveButton) {
                saveButton.disabled = true;
                saveButton.textContent = 'Kaydediliyor...';
            }
            
            try {
                // Generate a unique ID for the list if not editing
                const listId = isEditing ? 
                    JSON.parse(localStorage.getItem('editingList')).id : 
                    Date.now().toString(36) + Math.random().toString(36).substr(2);

                const listData = {
                    id: listId,
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

                // Store the list data in localStorage
                localStorage.setItem(`list_${listId}`, JSON.stringify(listData));
                localStorage.setItem('currentList', JSON.stringify(listData));

                // Generate QR code with URL and encoded data
                const qr = qrcode(4, 'L');
                const currentUrl = window.location.href;
                const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);
                const encodedData = encodeURIComponent(JSON.stringify(listData));
                const listUrl = baseUrl + `list.html?id=${listId}&data=${encodedData}`;
                qr.addData(listUrl);
                qr.make();
                
                // Create larger QR code
                listData.qrCode = qr.createDataURL(10);

                // Update storage with QR code
                localStorage.setItem(`list_${listId}`, JSON.stringify(listData));
                localStorage.setItem('currentList', JSON.stringify(listData));

                if (isEditing) {
                    localStorage.removeItem('editingList');
                }

                // Redirect to list view with data
                window.location.href = `list.html?id=${listId}&data=${encodedData}`;
            } catch (error) {
                console.error('Error saving list:', error);
                alert('Liste kaydedilirken bir hata oluştu: ' + error.message);
                
                // Re-enable save button on error
                if (saveButton) {
                    saveButton.disabled = false;
                    saveButton.textContent = 'Kaydet';
                }
            }
        });
    }

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
