document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const form = document.getElementById('listForm');
    const itemsContainer = document.getElementById('items');
    const addRowButton = document.getElementById('addRow');
    const saveButton = document.getElementById('saveButton');
    const titleInput = document.getElementById('listTitle');

    if (!form || !itemsContainer || !addRowButton || !saveButton || !titleInput) {
        console.error('Required DOM elements not found');
        alert('Sayfa yüklenirken hata oluştu');
        return;
    }

    // Initialize
    const urlParams = new URLSearchParams(window.location.search);
    const isEditing = urlParams.get('edit') === 'true';
    let currentListData = null;

    // Load editing data if available
    if (isEditing) {
        try {
            const editingData = localStorage.getItem('editingList');
            if (editingData) {
                currentListData = JSON.parse(editingData);
                titleInput.value = currentListData.title || '';
                itemsContainer.innerHTML = ''; // Clear default row
                
                if (Array.isArray(currentListData.items)) {
                    currentListData.items.forEach(item => addNewRow(item));
                }

                const buttonText = saveButton.querySelector('.button-text');
                if (buttonText) {
                    buttonText.textContent = 'Değişiklikleri Kaydet';
                }
            }
        } catch (error) {
            console.error('Error loading editing data:', error);
            alert('Düzenleme verisi yüklenirken hata oluştu');
            return;
        }
    }

    // Add first row if no items
    if (itemsContainer.children.length === 0) {
        addNewRow();
    }

    // Event Listeners
    addRowButton.addEventListener('click', () => addNewRow());

    itemsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-row')) {
            const row = e.target.closest('.form-row');
            if (row && itemsContainer.children.length > 1) {
                row.remove();
            }
        }
    });

    itemsContainer.addEventListener('change', function(e) {
        if (e.target.classList.contains('item-image')) {
            handleImageUpload(e.target);
        }
    });

    form.addEventListener('submit', handleFormSubmit);

    // Helper Functions
    async function handleImageUpload(input) {
        if (!input.files || !input.files[0]) return;

        const file = input.files[0];
        const row = input.closest('.form-row');
        if (!row) return;

        const storedImage = row.querySelector('.stored-image');
        const container = input.parentElement;
        if (!storedImage || !container) return;

        try {
            const imageData = await readFileAsDataURL(file);
            storedImage.value = imageData;

            let preview = row.querySelector('.image-preview');
            if (preview) {
                preview.src = imageData;
            } else {
                preview = document.createElement('img');
                preview.src = imageData;
                preview.className = 'image-preview';
                preview.alt = 'Ürün resmi';
                container.appendChild(preview);
            }
        } catch (error) {
            console.error('Error handling image:', error);
            alert('Resim yüklenirken hata oluştu');
        }
    }

    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(e);
            reader.readAsDataURL(file);
        });
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        // Disable save button
        saveButton.disabled = true;
        const buttonText = saveButton.querySelector('.button-text');
        if (buttonText) {
            buttonText.textContent = 'Kaydediliyor...';
        }

        try {
            // Validate title
            const title = titleInput.value.trim();
            if (!title) {
                throw new Error('Liste başlığı boş olamaz');
            }

            // Validate items
            const items = Array.from(itemsContainer.children);
            if (!items.length) {
                throw new Error('En az bir öğe eklemelisiniz');
            }

            // Get or create list ID
            let listId = currentListData?.id;
            let qrCode = currentListData?.qrCode;
            
            if (!listId) {
                listId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            }

            // Create list data
            const listData = {
                id: listId,
                title: title,
                items: []
            };

            // Collect items
            for (const row of items) {
                const content = row.querySelector('.item-content')?.value?.trim();
                const quantity = row.querySelector('.item-quantity')?.value?.trim();
                const storedImage = row.querySelector('.stored-image')?.value || '';
                
                if (!content || !quantity) {
                    throw new Error('Lütfen tüm içerik ve miktar alanlarını doldurun');
                }

                // Resmi Base64'den sıkıştır
                const compressedImage = storedImage ? storedImage.substring(0, 1000) : '';
                
                listData.items.push({ 
                    content, 
                    quantity, 
                    image: compressedImage 
                });
            }

            // Create URL and QR code
            const baseUrl = window.location.origin;
            const finalData = JSON.stringify(listData);
            const encodedData = encodeURIComponent(finalData);
            const listUrl = `${baseUrl}/list.html?id=${listId}&data=${encodedData}`;

            if (!qrCode) {
                try {
                    if (typeof qrcode !== 'function') {
                        throw new Error('QR kod kütüphanesi yüklenemedi. Lütfen sayfayı yenileyin.');
                    }

                    // QR kod oluştur
                    const qr = qrcode(0, 'L');
                    qr.addData(listUrl);
                    qr.make();
                    qrCode = qr.createDataURL(10);

                    if (!qrCode || typeof qrCode !== 'string') {
                        throw new Error('QR kod oluşturulamadı');
                    }

                } catch (error) {
                    console.error('Error generating QR code:', error);
                    throw new Error(error.message || 'QR kod oluşturulurken hata oluştu');
                }
            }

            // Add QR code to list data
            listData.qrCode = qrCode;

            try {
                // Save data
                localStorage.setItem(`list_${listId}`, JSON.stringify(listData));
                localStorage.setItem('currentList', JSON.stringify(listData));

                if (isEditing) {
                    localStorage.removeItem('editingList');
                }

                // Navigate to list view
                window.location.href = listUrl;
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                throw new Error('Liste kaydedilirken hata oluştu');
            }

        } catch (error) {
            console.error('Form submission error:', error);
            alert(error.message || 'Beklenmeyen bir hata oluştu');
            
            // Re-enable save button
            saveButton.disabled = false;
            const buttonText = saveButton.querySelector('.button-text');
            if (buttonText) {
                buttonText.textContent = isEditing ? 'Değişiklikleri Kaydet' : 'Kaydet';
            }
        }
    }

    function addNewRow(item = null) {
        const newRow = document.createElement('div');
        newRow.className = 'form-row item-row';
        newRow.innerHTML = `
            <div class="input-group content-field">
                <label>İçerik:</label>
                <input type="text" class="item-content" required value="${item?.content || ''}">
            </div>
            <div class="input-group">
                <label>Miktar:</label>
                <input type="text" class="item-quantity" required value="${item?.quantity || ''}">
            </div>
            <div class="input-group">
                <label>Resim:</label>
                <input type="file" class="item-image" accept="image/*">
                <input type="hidden" class="stored-image" value="${item?.image || ''}">
                ${item?.image ? `<img src="${item.image}" class="image-preview" alt="Ürün resmi">` : ''}
            </div>
            <button type="button" class="delete-row" title="Satırı sil">×</button>
        `;
        itemsContainer.appendChild(newRow);
    }
});
