document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('listForm');
    const itemsContainer = document.getElementById('items');
    const addRowButton = document.getElementById('addRow');

    // Add row event listener
    addRowButton.addEventListener('click', addNewRow);

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
                    
                    // Remove existing preview if any
                    const existingPreview = e.target.parentElement.querySelector('.image-preview');
                    if (existingPreview) {
                        existingPreview.remove();
                    }
                    
                    e.target.parentElement.appendChild(preview);
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
            const imagePreview = row.querySelector('.image-preview');
            
            listData.items.push({
                content: content,
                quantity: quantity,
                image: imagePreview ? imagePreview.src : null
            });
        });

        // Save to localStorage
        localStorage.setItem('currentList', JSON.stringify(listData));

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
                    <input type="number" class="item-quantity" required min="1">
                </div>
                <div style="flex: 2;">
                    <label>Resim:</label>
                    <input type="file" class="item-image" accept="image/*">
                </div>
                <div style="display: flex; align-items: flex-end;">
                    <button type="button" class="btn btn-danger delete-row">Sil</button>
                </div>
            </div>
        `;
        itemsContainer.appendChild(newRow);
    }
});
