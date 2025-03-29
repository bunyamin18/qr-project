document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('listForm');
    const itemsContainer = document.getElementById('items');
    const addRowButton = document.getElementById('addRow');
    const saveButton = document.getElementById('saveButton');

    // Check if we're editing an existing list
    const urlParams = new URLSearchParams(window.location.search);
    const isEditing = urlParams.get('edit') === 'true';

    // Load editing data if available
    if (isEditing) {
        const editingData = JSON.parse(localStorage.getItem('editingList'));
        if (editingData) {
            document.getElementById('listTitle').value = editingData.title;
            // Remove default empty row
            itemsContainer.innerHTML = '';
            // Add rows for each item
            editingData.items.forEach(item => addNewRow(item));
            const buttonText = saveButton.querySelector('.button-text');
            if (buttonText) {
                buttonText.textContent = 'Değişiklikleri Kaydet';
            }
        }
    }

    // Add first row if no items
    if (itemsContainer.children.length === 0) {
        addNewRow();
    }

    // Add row button click handler
    addRowButton.addEventListener('click', () => addNewRow());

    // Delete row button click handler
    itemsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-row')) {
            const row = e.target.closest('.form-row');
            if (itemsContainer.children.length > 1) {
                row.remove();
            }
        }
    });

    // Handle image file selection
    itemsContainer.addEventListener('change', function(e) {
        if (e.target.classList.contains('item-image')) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                const row = e.target.closest('.form-row');
                const storedImage = row.querySelector('.stored-image');
                const container = e.target.parentElement;
                
                reader.onload = function(e) {
                    const imageData = e.target.result;
                    storedImage.value = imageData;
                    
                    // Update or create preview
                    let preview = row.querySelector('.image-preview');
                    if (preview) {
                        preview.src = imageData;
                    } else {
                        preview = document.createElement('img');
                        preview.src = imageData;
                        preview.className = 'image-preview';
                        container.appendChild(preview);
                    }
                };
                
                reader.readAsDataURL(file);
            }
        }
    });

    // Form submit handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Disable save button
            saveButton.disabled = true;
            const buttonText = saveButton.querySelector('.button-text');
            if (buttonText) {
                buttonText.textContent = 'Kaydediliyor...';
            }

            // Check if title is empty
            const title = document.getElementById('listTitle').value.trim();
            if (!title) {
                throw new Error('Liste başlığı boş olamaz');
            }

            const items = Array.from(itemsContainer.children);
            if (items.length === 0) {
                throw new Error('En az bir öğe eklemelisiniz');
            }

            // Get list ID and QR code
            let listId;
            let qrCode;
            
            if (isEditing) {
                const editingData = JSON.parse(localStorage.getItem('editingList'));
                if (!editingData) {
                    throw new Error('Düzenleme verisi bulunamadı');
                }
                listId = editingData.id;
                qrCode = editingData.qrCode;
                console.log('Using existing QR code:', qrCode ? 'yes' : 'no');
            } else {
                listId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            }

            // Create list data object
            const listData = {
                id: listId,
                title: title,
                items: []
            };

            // Collect all items
            for (const row of items) {
                const content = row.querySelector('.item-content')?.value?.trim();
                const quantity = row.querySelector('.item-quantity')?.value?.trim();
                const storedImage = row.querySelector('.stored-image')?.value || '';
                
                if (!content || !quantity) {
                    throw new Error('Lütfen tüm içerik ve miktar alanlarını doldurun');
                }

                listData.items.push({
                    content: content,
                    quantity: quantity,
                    image: storedImage
                });
            }

            // Generate or use existing QR code
            const baseUrl = `${window.location.origin}${window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))}`;
            const finalData = JSON.stringify(listData);
            const encodedData = encodeURIComponent(finalData);
            const listUrl = `${baseUrl}/list.html?id=${listId}&data=${encodedData}`;

            if (!qrCode) {
                const qr = qrcode(0, 'L');
                qr.addData(listUrl);
                qr.make();
                qrCode = qr.createDataURL(10);
                console.log('Generated new QR code');
            }

            // Add QR code to list data
            listData.qrCode = qrCode;

            // Save to localStorage
            localStorage.setItem(`list_${listId}`, JSON.stringify(listData));
            localStorage.setItem('currentList', JSON.stringify(listData));

            if (isEditing) {
                localStorage.removeItem('editingList');
            }

            // Redirect to list view
            window.location.href = listUrl;

        } catch (error) {
            console.error('Error saving list:', error);
            alert(error.message || 'Beklenmeyen bir hata oluştu');
            
            // Re-enable save button on error
            saveButton.disabled = false;
            const buttonText = saveButton.querySelector('.button-text');
            if (buttonText) {
                buttonText.textContent = isEditing ? 'Değişiklikleri Kaydet' : 'Kaydet';
            }
        }
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
                <input type="hidden" class="stored-image" value="${item && item.image ? item.image : ''}">
                ${item && item.image ? `<img src="${item.image}" class="image-preview">` : ''}
            </div>
            <button type="button" class="delete-row">×</button>
        `;
        itemsContainer.appendChild(newRow);
    }
});
