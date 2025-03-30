// Main Script for QR Code Project
document.addEventListener('DOMContentLoaded', function() {
    // Form element references
    const listForm = document.getElementById('listForm');
    const listTitleInput = document.getElementById('listTitle');
    const itemsContainer = document.getElementById('items');
    const addRowButton = document.querySelector('.add-row-button');
    const saveButton = document.querySelector('.save-button');
    
    // Initialize particles.js for background animation
    if (window.particlesJS) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#00bcd4" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#00bcd4",
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: false,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                }
            },
            retina_detect: true
        });
    }
    
    // Initialize item count
    let itemCount = 0;
    
    // Check if we're in edit mode (URL has listId parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const editListId = urlParams.get('listId');
    let currentListData = null;
    
    // If editing existing list, load its data
    if (editListId && window.dataStorage) {
        try {
            currentListData = window.dataStorage.getList(editListId);
            if (currentListData) {
                // Fill form with existing data
                listTitleInput.value = currentListData.title;
                
                // Add existing items
                currentListData.items.forEach(item => {
                    addNewItemRow(item.content, item.value);
                });
            }
        } catch (error) {
            console.error('Liste yükleme hatası:', error);
        }
    } else {
        // Add one empty item row by default for new lists
        addNewItemRow();
    }
    
    // Add new item row
    function addNewItemRow(content = '', value = '') {
        itemCount++;
        
        const itemRow = document.createElement('div');
        itemRow.className = 'form-group item-row';
        itemRow.id = `item-${itemCount}`;
        
        itemRow.innerHTML = `
            <div class="item-container">
                <div class="item-fields">
                    <input type="text" class="form-control item-content" placeholder="Öğe Adı" value="${content}" required>
                    <input type="text" class="form-control item-value" placeholder="Değer" value="${value}" required>
                </div>
                <button type="button" class="delete-button remove-item">Sil</button>
            </div>
        `;
        
        // Add remove functionality to the item
        const removeButton = itemRow.querySelector('.remove-item');
        removeButton.addEventListener('click', function() {
            itemRow.remove();
        });
        
        itemsContainer.appendChild(itemRow);
    }
    
    // Add Row Button Functionality
    if (addRowButton) {
        addRowButton.addEventListener('click', function() {
            addNewItemRow();
        });
    }
    
    // Form Submit Functionality
    if (listForm) {
        listForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log("Form submitted");
            
            try {
                if (!window.dataStorage) {
                    throw new Error('Veri depolama servisi bulunamadı');
                }
                
                // Get list title
                const title = listTitleInput.value.trim();
                if (!title) {
                    alert('Lütfen liste başlığı girin');
                    return;
                }
                
                // Get all items
                const itemRows = document.querySelectorAll('.item-row');
                if (itemRows.length === 0) {
                    alert('En az bir öğe ekleyin');
                    return;
                }
                
                // Collect items data
                const items = [];
                let hasValidItems = false;
                
                itemRows.forEach(row => {
                    const contentInput = row.querySelector('.item-content');
                    const valueInput = row.querySelector('.item-value');
                    
                    if (contentInput && valueInput) {
                        const content = contentInput.value.trim();
                        const value = valueInput.value.trim();
                        
                        if (content && value) {
                            items.push({
                                content: content,
                                value: value
                            });
                            hasValidItems = true;
                        }
                    }
                });
                
                if (!hasValidItems) {
                    alert('Lütfen en az bir geçerli öğe ekleyin');
                    return;
                }
                
                // Prepare list data
                const listData = {
                    title: title,
                    items: items
                };
                
                console.log("Saving list data:", listData);
                
                // Save the list
                const savedList = await window.dataStorage.saveList(listData);
                console.log("List saved:", savedList);
                
                // Redirect to QR code page
                window.location.href = `qr-generator.html?listId=${savedList.id}`;
                
            } catch (error) {
                console.error('Liste kaydetme hatası:', error);
                alert('Liste kaydedilemedi: ' + error.message);
            }
        });
    }
});