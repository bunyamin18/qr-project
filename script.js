// Main Script for QR Code Project
document.addEventListener('DOMContentLoaded', function() {
    // Form element references
    const listForm = document.getElementById('listForm');
    const listTitleInput = document.getElementById('title');
    const itemsContainer = document.getElementById('itemsContainer');
    const addItemButton = document.getElementById('addItemButton');
    
    // Initialize particles.js for background animation - cable-style effect
    if (window.particlesJS) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 70, density: { enable: true, value_area: 800 } },
                color: { value: ["#00f5ff", "#6e36df", "#2be8d9"] },
                shape: { type: "line" },
                opacity: { value: 0.7, random: false },
                size: { value: 2, random: true },
                line_linked: {
                    enable: true,
                    distance: 200,
                    color: "#00f5ff",
                    opacity: 0.5,
                    width: 2
                },
                move: {
                    enable: true,
                    speed: 3,
                    direction: "none",
                    random: false,
                    straight: false,
                    out_mode: "bounce",
                    attract: { enable: true, rotateX: 600, rotateY: 1200 }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                },
                modes: {
                    repulse: { distance: 100, duration: 0.4 }
                }
            },
            retina_detect: true
        });
    }
    
    // Initialize item count
    let currentListData = null;
    
    // Check if we're in edit mode (URL has listId parameter)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const listId = urlParams.get('listId');
        
        if (listId && window.dataStorage) {
            // We're in edit mode - get list data
            currentListData = window.dataStorage.getList(listId);
            
            if (currentListData) {
                // Fill form with existing data
                listTitleInput.value = currentListData.title;
                
                // Clear existing items
                itemsContainer.innerHTML = '';
                
                // Add existing items
                currentListData.items.forEach(item => {
                    addNewItemRow(item.content, item.value, item.image);
                });
            }
        } else {
            // We're in create mode - add a blank item
            addNewItemRow();
        }
    } catch (error) {
        console.error('Error checking edit mode:', error);
        // Default to create mode with one blank item
        addNewItemRow();
    }
    
    // Add new item row
    function addNewItemRow(content = '', value = '', image = '') {
        const itemRow = document.createElement('div');
        itemRow.className = 'item-container';
        
        // Öğe Adı solda, Miktar/Değer sağda
        itemRow.innerHTML = `
            <div class="item-fields">
                <input type="text" class="form-control item-content" placeholder="Öğe Adı" value="${content}">
                <input type="text" class="form-control item-value" placeholder="Miktar/Değer" value="${value}">
            </div>
            <div class="image-container">
                <label class="image-upload-label">
                    <i class="fas fa-image"></i>
                    <input type="file" class="image-input" accept="image/*" style="display: none;">
                </label>
                <div class="image-preview">
                    ${image ? `<div class="thumbnail-container"><img src="${image}" class="thumbnail" /><button type="button" class="remove-image-button">×</button></div>` : ''}
                </div>
            </div>
            <button type="button" class="delete-button">Sil</button>
        `;
        
        // Add event listener to remove button
        const removeButton = itemRow.querySelector('.delete-button');
        removeButton.addEventListener('click', () => {
            itemRow.remove();
        });
        
        // Add image upload functionality
        const imageInput = itemRow.querySelector('.image-input');
        const imagePreview = itemRow.querySelector('.image-preview');
        const removeImageButton = itemRow.querySelector('.remove-image-button');
        
        imageInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    // Create preview image
                    imagePreview.innerHTML = `
                        <div class="thumbnail-container">
                            <img src="${event.target.result}" class="thumbnail" />
                            <button type="button" class="remove-image-button">×</button>
                        </div>
                    `;
                    
                    // Add remove button event
                    const newRemoveButton = imagePreview.querySelector('.remove-image-button');
                    newRemoveButton.addEventListener('click', function() {
                        imagePreview.innerHTML = '';
                        imageInput.value = '';
                    });
                };
                
                reader.readAsDataURL(e.target.files[0]);
            }
        });
        
        if (removeImageButton) {
            removeImageButton.addEventListener('click', function() {
                imagePreview.innerHTML = '';
                imageInput.value = '';
            });
        }
        
        itemsContainer.appendChild(itemRow);
    }
    
    // Add event listeners
    addItemButton.addEventListener('click', () => {
        addNewItemRow();
    });
    
    // Form submission handler
    listForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Validate title
            const title = listTitleInput.value.trim();
            if (!title) {
                alert('Lütfen liste başlığı girin');
                return;
            }
            
            // Get all item rows
            const itemRows = document.querySelectorAll('.item-container');
            if (itemRows.length === 0) {
                alert('Lütfen en az bir öğe ekleyin');
                return;
            }
            
            // Prepare items array
            const items = [];
            let hasValidItems = false;
            
            // Process each item row
            itemRows.forEach(row => {
                const contentInput = row.querySelector('.item-content');
                const valueInput = row.querySelector('.item-value');
                const imagePreview = row.querySelector('.image-preview img');
                
                if (contentInput && valueInput) {
                    const content = contentInput.value.trim();
                    const value = valueInput.value.trim();
                    const image = imagePreview ? imagePreview.src : '';
                    
                    if (content) {
                        items.push({
                            content: content,
                            value: value,
                            image: image
                        });
                        hasValidItems = true;
                    }
                }
            });
            
            if (!hasValidItems) {
                alert('Lütfen en az bir öğeye isim girin');
                return;
            }
            
            // Prepare list data object
            const listData = {
                title: title,
                items: items
            };
            
            let savedList;
            
            // Save/update the list
            if (currentListData && currentListData.id) {
                // Update existing list
                listData.id = currentListData.id;
                savedList = window.dataStorage.updateList(listData);
                alert('Liste başarıyla güncellendi!');
            } else {
                // Create new list
                savedList = window.dataStorage.saveList(listData);
                alert('Liste başarıyla oluşturuldu!');
            }
            
            if (savedList && savedList.id) {
                // Redirect to QR code generator page
                window.location.href = `qr-generator.html?listId=${savedList.id}`;
            } else {
                throw new Error('Liste kaydedilirken bir hata oluştu');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            alert('Bir hata oluştu: ' + error.message);
        }
    });
});