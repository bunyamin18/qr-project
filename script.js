// Main Script for QR Code Project
document.addEventListener('DOMContentLoaded', function() {
    console.log("Script başlatıldı");
    
    // Form element references
    const listForm = document.getElementById('listForm');
    const listTitleInput = document.getElementById('title');
    const itemsContainer = document.getElementById('itemsContainer');
    const addItemButton = document.getElementById('addItemButton');
    
    // Veri depolama fonksiyonları - direkt script.js içinde
    const dataStorage = {
        saveList: async function(listData) {
            console.log("saveList çağrıldı:", listData);
            // Liste ID'si oluştur
            const listId = Date.now().toString();
            
            // Liste verisini hazırla
            const list = {
                id: listId,
                title: listData.title,
                items: listData.items
            };

            // Veriyi localStorage'a kaydet
            try {
                const lists = JSON.parse(localStorage.getItem('lists') || '[]');
                lists.push(list);
                localStorage.setItem('lists', JSON.stringify(lists));
                console.log("Liste kaydedildi:", list);
                return list;
            } catch (error) {
                console.error('Liste kaydetme hatası:', error);
                throw error;
            }
        },

        updateList: function(listData) {
            console.log("updateList çağrıldı:", listData);
            try {
                const lists = JSON.parse(localStorage.getItem('lists') || '[]');
                const index = lists.findIndex(list => list.id === listData.id);
                
                if (index !== -1) {
                    lists[index] = listData;
                    localStorage.setItem('lists', JSON.stringify(lists));
                    console.log("Liste güncellendi:", listData);
                    return listData;
                } else {
                    throw new Error('Liste bulunamadı');
                }
            } catch (error) {
                console.error('Liste güncelleme hatası:', error);
                throw error;
            }
        },

        getList: function(listId) {
            console.log("getList çağrıldı:", listId);
            try {
                const lists = JSON.parse(localStorage.getItem('lists') || '[]');
                const list = lists.find(list => list.id === listId);
                console.log("Liste bulundu:", list);
                return list;
            } catch (error) {
                console.error('Liste alma hatası:', error);
                throw error;
            }
        },

        getAllLists: function() {
            try {
                return JSON.parse(localStorage.getItem('lists') || '[]');
            } catch (error) {
                console.error('Listeler alma hatası:', error);
                throw error;
            }
        }
    };

    // Global olarak da erişilebilir yap
    window.dataStorage = dataStorage;
    
    // Bilim kurgu tarzında enerji akışı animasyonu
    if (window.particlesJS) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 120, density: { enable: true, value_area: 800 } },
                color: { value: ["#00f5ff", "#0055ff", "#00bbff", "#88ff00", "#5500ff"] },
                shape: { type: "circle" },
                opacity: { value: 0.7, random: true, anim: { enable: true, speed: 1 } },
                size: { value: 3, random: true, anim: { enable: true, speed: 2 } },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#00f5ff",
                    opacity: 0.5,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 4,
                    direction: "right",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: { enable: true, rotateX: 600, rotateY: 1200 }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    onclick: { enable: true, mode: "repulse" },
                    resize: true
                },
                modes: {
                    grab: { distance: 200, line_linked: { opacity: 0.8 } },
                    repulse: { distance: 200, duration: 0.4 }
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
            console.log("Liste ID bulundu, liste verisi alınıyor:", listId);
            // We're in edit mode - get list data
            currentListData = dataStorage.getList(listId);
            
            if (currentListData) {
                console.log("Liste verisi yüklendi, formu dolduruyorum");
                // Fill form with existing data
                listTitleInput.value = currentListData.title;
                
                // Clear existing items
                itemsContainer.innerHTML = '';
                
                // Add existing items
                currentListData.items.forEach(item => {
                    addNewItemRow(item.content, item.value, item.image);
                });
            } else {
                console.log("Liste bulunamadı, boş öğe ekleniyor");
                addNewItemRow();
            }
        } else {
            console.log("Yeni liste oluşturuluyor, boş öğe ekleniyor");
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
        console.log("Yeni öğe ekleniyor");
        addNewItemRow();
    });
    
    // Form submission handler
    listForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log("Form gönderildi");
        
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
            
            console.log("Liste verisi hazırlandı:", listData);
            
            let savedList;
            
            // Save/update the list
            if (currentListData && currentListData.id) {
                // Update existing list
                console.log("Mevcut liste güncelleniyor");
                listData.id = currentListData.id;
                savedList = await dataStorage.updateList(listData);
                alert('Liste başarıyla güncellendi!');
            } else {
                // Create new list
                console.log("Yeni liste oluşturuluyor");
                savedList = await dataStorage.saveList(listData);
                alert('Liste başarıyla oluşturuldu!');
            }
            
            console.log("İşlem tamamlandı, kaydedilen liste:", savedList);
            
            if (savedList && savedList.id) {
                // Redirect to QR code generator page
                console.log("QR kod sayfasına yönlendiriliyor");
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