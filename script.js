document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('listForm');
    const itemsContainer = document.getElementById('items');
    const addRowButton = document.getElementById('addRow');
    const saveButton = document.getElementById('saveButton');
    const isEditing = window.location.search.includes('edit=true');
    
    // Update save button text based on mode
    if (saveButton) {
        const buttonText = saveButton.querySelector('.button-text');
        if (buttonText) {
            buttonText.textContent = isEditing ? 'Değişiklikleri Kaydet' : 'Kaydet';
        }
    }
    
    // If we're editing, load the existing data
    if (isEditing) {
        try {
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
        } catch (e) {
            console.error('Error loading editing data:', e);
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
                const buttonText = saveButton.querySelector('.button-text');
                if (buttonText) {
                    buttonText.textContent = 'Kaydediliyor...';
                }
            }
            
            try {
                // Check if title is empty
                const title = document.getElementById('listTitle').value.trim();
                if (!title) {
                    throw new Error('Liste başlığı boş olamaz');
                }

                // Check if there are items
                const items = document.querySelectorAll('.form-row.item-row');
                if (items.length === 0) {
                    throw new Error('En az bir öğe eklemelisiniz');
                }

                // Generate a unique ID for the list if not editing
                let listId;
                let existingQrCode;
                if (isEditing) {
                    try {
                        const editingData = JSON.parse(localStorage.getItem('editingList'));
                        listId = editingData.id;
                        existingQrCode = editingData.qrCode;
                    } catch (e) {
                        console.error('Error getting editing list ID:', e);
                        listId = Date.now().toString(36) + Math.random().toString(36).substr(2);
                    }
                } else {
                    listId = Date.now().toString(36) + Math.random().toString(36).substr(2);
                }

                const listData = {
                    id: listId,
                    title: title,
                    items: []
                };

                // Collect all items
                let hasError = false;
                items.forEach((row, index) => {
                    const content = row.querySelector('.item-content').value.trim();
                    const quantity = row.querySelector('.item-quantity').value.trim();
                    
                    if (!content || !quantity) {
                        hasError = true;
                        throw new Error(`Sıra ${index + 1}: İçerik ve miktar alanları boş olamaz`);
                    }

                    const storedImage = row.querySelector('.stored-image');
                    const imagePreview = row.querySelector('.image-preview');
                    
                    const imageData = storedImage && storedImage.value ? storedImage.value : 
                                    (imagePreview ? imagePreview.src : null);

                    listData.items.push({
                        content: content,
                        quantity: quantity,
                        image: imageData
                    });
                });

                if (hasError) {
                    throw new Error('Lütfen tüm alanları doldurun');
                }

                // Store the list data in localStorage first
                const savedData = JSON.stringify(listData);
                localStorage.setItem(`list_${listId}`, savedData);
                localStorage.setItem('currentList', savedData);

                // Keep existing QR code if editing, or generate new one if new list
                if (isEditing && existingQrCode) {
                    listData.qrCode = existingQrCode;
                } else {
                    const qr = qrcode(0, 'L');
                    const currentUrl = window.location.href;
                    const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);
                    const listUrl = `${baseUrl}list.html?id=${listId}`;
                    
                    qr.addData(listUrl);
                    qr.make();
                    
                    listData.qrCode = qr.createDataURL(10);
                }

                // Update storage with final data
                const finalData = JSON.stringify(listData);
                localStorage.setItem(`list_${listId}`, finalData);
                localStorage.setItem('currentList', finalData);

                if (isEditing) {
                    localStorage.removeItem('editingList');
                }

                // Redirect to list view with just ID
                window.location.href = `list.html?id=${listId}`;

            } catch (error) {
                console.error('Error saving list:', error);
                alert(error.message || 'Liste kaydedilirken bir hata oluştu');
                
                // Re-enable save button on error
                if (saveButton) {
                    saveButton.disabled = false;
                    const buttonText = saveButton.querySelector('.button-text');
                    if (buttonText) {
                        buttonText.textContent = isEditing ? 'Değişiklikleri Kaydet' : 'Kaydet';
                    }
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
                <input type="hidden" class="stored-image" value="${item && item.image ? item.image : ''}">
                ${item && item.image ? `<img src="${item.image}" class="image-preview">` : ''}
            </div>
            <button type="button" class="delete-row">×</button>
        `;
        itemsContainer.appendChild(newRow);
    }
});
