// Main Script for QR Code Project
document.addEventListener('DOMContentLoaded', function() {
    // Form element references
    const listForm = document.getElementById('listForm');
    const listTitleInput = document.getElementById('title');
    const itemsContainer = document.getElementById('itemsContainer');
    const addItemButton = document.getElementById('addItemButton');
    
    // Veri depolama servisi - doğrudan script.js içinde tanımlıyoruz
    const dataStorage = {
        // Liste verilerini sakla
        async saveList(listData) {
            try {
                // Liste ID'si oluştur
                const listId = Date.now().toString();
                
                // Liste verisini hazırla
                const list = {
                    id: listId,
                    title: listData.title,
                    items: listData.items
                };

                // Veriyi localStorage'a kaydet
                const lists = JSON.parse(localStorage.getItem('lists') || '[]');
                lists.push(list);
                localStorage.setItem('lists', JSON.stringify(lists));

                return list;
            } catch (error) {
                console.error('Liste kaydetme hatası:', error);
                throw error;
            }
        },

        // Liste verisini güncelle
        updateList(listData) {
            try {
                const lists = JSON.parse(localStorage.getItem('lists') || '[]');
                const index = lists.findIndex(list => list.id === listData.id);
                
                if (index !== -1) {
                    lists[index] = listData;
                    localStorage.setItem('lists', JSON.stringify(lists));
                    return listData;
                } else {
                    throw new Error('Liste bulunamadı');
                }
            } catch (error) {
                console.error('Liste güncelleme hatası:', error);
                throw error;
            }
        },

        // Liste verisini al
        getList(listId) {
            try {
                const lists = JSON.parse(localStorage.getItem('lists') || '[]');
                return lists.find(list => list.id === listId);
            } catch (error) {
                console.error('Liste alma hatası:', error);
                throw error;
            }
        },

        // Tüm listeleri al
        getAllLists() {
            try {
                return JSON.parse(localStorage.getItem('lists') || '[]');
            } catch (error) {
                console.error('Listeler alma hatası:', error);
                throw error;
            }
        }
    };
    
    // Veri depolama servisini global olarak da erişilebilir yap
    window.dataStorage = dataStorage;
    
    // Initialize particles.js for background animation - düz çizgiler ve hareket eden ışık
    if (window.particlesJS) {
        // Sabit çizgileri oluştur
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        const canvasEl = document.createElement('canvas');
        canvasEl.width = width;
        canvasEl.height = height;
        canvasEl.style.position = 'absolute';
        canvasEl.style.top = '0';
        canvasEl.style.left = '0';
        canvasEl.style.pointerEvents = 'none';
        document.getElementById('particles-js').appendChild(canvasEl);
        
        const ctx = canvasEl.getContext('2d');
        
        // Sabit düz çizgileri çiz
        function drawLines() {
            ctx.clearRect(0, 0, width, height);
            ctx.strokeStyle = '#2a2a5a';
            ctx.lineWidth = 1;
            
            // Yatay çizgiler
            for (let i = 0; i < 15; i++) {
                const y = height * (i / 15);
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
            
            // Dikey çizgiler
            for (let i = 0; i < 20; i++) {
                const x = width * (i / 20);
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            
            // Çapraz çizgiler
            for (let i = 0; i < 10; i++) {
                // Sağ üstten sol alta
                ctx.beginPath();
                ctx.moveTo(width, i * (height / 10));
                ctx.lineTo(0, (i + 5) * (height / 10));
                if ((i + 5) <= 10) {
                    ctx.stroke();
                }
                
                // Sol üstten sağ alta
                ctx.beginPath();
                ctx.moveTo(0, i * (height / 10));
                ctx.lineTo(width, (i + 5) * (height / 10));
                if ((i + 5) <= 10) {
                    ctx.stroke();
                }
            }
        }
        
        drawLines();
        
        // Hareket eden ışıklar
        particlesJS('particles-js', {
            particles: {
                number: { value: 50, density: { enable: true, value_area: 800 } },
                color: { value: "#00f5ff" },
                shape: { type: "circle" },
                opacity: { value: 0.8, random: false },
                size: { value: 3, random: false },
                line_linked: {
                    enable: false
                },
                move: {
                    enable: true,
                    speed: 3,
                    direction: "none",
                    random: true,
                    straight: true,
                    out_mode: "out",
                    bounce: false,
                    attract: { enable: false }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "bubble" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                },
                modes: {
                    bubble: { distance: 100, size: 5, duration: 2 }
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
        
        if (listId) {
            // We're in edit mode - get list data
            currentListData = dataStorage.getList(listId);
            
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
                savedList = dataStorage.updateList(listData);
                alert('Liste başarıyla güncellendi!');
            } else {
                // Create new list
                savedList = dataStorage.saveList(listData);
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