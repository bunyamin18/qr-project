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
                const newRow = document.createElement('div');
                newRow.className = 'form-group item-row';
                newRow.innerHTML = `
                    <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                        <div style="flex: 2;">
                            <label>İçerik:</label>
                            <input type="text" class="item-content" required value="${item.content}">
                        </div>
                        <div style="flex: 1;">
                            <label>Miktar:</label>
                            <input type="number" class="item-quantity" required min="1" value="${item.quantity}">
                        </div>
                        <div style="flex: 2;">
                            <label>Resim:</label>
                            <input type="file" class="item-image" accept="image/*">
                            ${item.image ? `<img src="${item.image}" class="image-preview">` : ''}
                            <input type="hidden" class="stored-image" value="${item.image || ''}">
                        </div>
                        <div style="display: flex; align-items: flex-end;">
                            <button type="button" class="btn btn-danger delete-row">Sil</button>
                        </div>
                    </div>
                `;
                itemsContainer.appendChild(newRow);
            });
        }
    }

    // Add row event listener
    addRowButton.addEventListener('click', () => addNewRow());

    // Delete row event delegation
    itemsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-row')) {
            const row = e.target.closest('.item-row');
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
        document.querySelectorAll('.item-row').forEach(row => {
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

        // Save to localStorage
        localStorage.setItem('currentList', JSON.stringify(listData));
        
        // Clear editing data if we were editing
        if (isEditing) {
            localStorage.removeItem('editingList');
        }

        // Redirect to list view
        window.location.href = 'list.html';
    });

    function addNewRow() {
        const newRow = document.createElement('div');
        newRow.className = 'form-group item-row';
        newRow.innerHTML = `
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <div style="flex: 2;">
                    <label>İçerik:</label>
                    <input type="text" class="item-content" required>
                </div>
                <div style="flex: 1;">
                    <label>Miktar:</label>
                    <input type="number" class="item-quantity" required min="1" value="1">
                </div>
                <div style="flex: 2;">
                    <label>Resim:</label>
                    <input type="file" class="item-image" accept="image/*">
                    <input type="hidden" class="stored-image" value="">
                </div>
                <div style="display: flex; align-items: flex-end;">
                    <button type="button" class="btn btn-danger delete-row">Sil</button>
                </div>
            </div>
        `;
        itemsContainer.appendChild(newRow);
    }
});
