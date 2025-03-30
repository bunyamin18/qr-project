// Main Script for QR Code Project
document.addEventListener('DOMContentLoaded', function() {
    console.log("Script başlatıldı");
    
    // Form element references
    const listForm = document.getElementById('listForm');
    const listTitleInput = document.getElementById('title');
    const itemsContainer = document.getElementById('itemsContainer');
    const addItemButton = document.getElementById('addItemButton');
    
    // LocalStorage temizleme - localStorage'dan hatalı verileri temizle
    try {
        const storedLists = localStorage.getItem('lists');
        if (storedLists) {
            const parsedLists = JSON.parse(storedLists);
            // Eğer array değilse temizle
            if (!Array.isArray(parsedLists)) {
                console.log("localStorage'da geçersiz veri bulundu, temizleniyor");
                localStorage.removeItem('lists');
            }
        }
    } catch (e) {
        console.log("localStorage verisi geçersiz, temizleniyor");
        localStorage.removeItem('lists');
    }
    
    // LocalStorage boyut sınırı hatalarını önlemek için görüntü boyutlarını sınırla ve compress et
    function resizeAndCompressImage(base64Image, maxWidth = 300, quality = 0.7) {
        return new Promise((resolve, reject) => {
            try {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Ölçeklendirme
                    if (width > maxWidth) {
                        height = Math.round(height * maxWidth / width);
                        width = maxWidth;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Quality ile compress et
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = function() {
                    reject(new Error('Görüntü yüklenirken hata oluştu'));
                };
                img.src = base64Image;
            } catch (error) {
                reject(error);
            }
        });
    }
    
    // Veri depolama fonksiyonları - direkt script.js içinde
    const dataStorage = {
        saveList: async function(listData) {
            console.log("saveList çağrıldı");
            try {
                // Liste ID'si oluştur
                const listId = Date.now().toString();
                
                // Compress edilmiş liste verisi
                const compressedList = {
                    id: listId,
                    title: listData.title,
                    items: []
                };
                
                // Görüntüleri compress et
                for (const item of listData.items) {
                    const compressedItem = {
                        content: item.content,
                        value: item.value,
                        image: ''
                    };
                    
                    if (item.image && item.image.startsWith('data:image')) {
                        compressedItem.image = await resizeAndCompressImage(item.image);
                    } else {
                        compressedItem.image = item.image;
                    }
                    
                    compressedList.items.push(compressedItem);
                }
                
                // Veriyi localStorage'a kaydet
                try {
                    // Liste sayısını sınırla ve eski listeleri temizle
                    let lists = [];
                    try {
                        const storedLists = localStorage.getItem('lists');
                        if (storedLists) {
                            const parsedLists = JSON.parse(storedLists);
                            if (Array.isArray(parsedLists)) {
                                lists = parsedLists;
                            }
                        }
                    } catch (e) {
                        console.log("localStorage verisi geçersiz");
                        // Geçersiz veri var, yeni array oluştur
                        lists = [];
                    }
                    
                    // Maksimum 10 liste sakla
                    while (lists.length >= 10) {
                        lists.shift(); // En eski listeyi çıkar
                    }
                    
                    lists.push(compressedList);
                    localStorage.setItem('lists', JSON.stringify(lists));
                    console.log("Liste kaydedildi");
                    return compressedList;
                } catch (error) {
                    console.error('Liste kaydetme hatası:', error);
                    
                    // StorageQuota hatası durumunda tüm listeleri temizle ve tekrar dene
                    if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                        console.log('Quota hatası, localStorage temizleniyor...');
                        localStorage.clear();
                        
                        const newLists = [compressedList];
                        localStorage.setItem('lists', JSON.stringify(newLists));
                        return compressedList;
                    }
                    
                    // Diğer hatalar için (push metodu bulunamadı vb.) yeni bir array oluştur
                    localStorage.removeItem('lists');
                    localStorage.setItem('lists', JSON.stringify([compressedList]));
                    return compressedList;
                }
            } catch (error) {
                console.error('Liste işleme hatası:', error);
                throw error;
            }
        },

        updateList: async function(listData) {
            console.log("updateList çağrıldı");
            try {
                let lists = [];
                try {
                    const storedLists = localStorage.getItem('lists');
                    if (storedLists) {
                        const parsedLists = JSON.parse(storedLists);
                        if (Array.isArray(parsedLists)) {
                            lists = parsedLists;
                        }
                    }
                } catch (e) {
                    console.log("localStorage verisi geçersiz");
                    // Geçersiz veri var, yeni array oluştur
                    lists = [];
                }
                
                const index = lists.findIndex(list => list && list.id === listData.id);
                
                if (index !== -1) {
                    // Compress edilmiş liste verisi
                    const compressedList = {
                        id: listData.id,
                        title: listData.title,
                        items: []
                    };
                    
                    // Görüntüleri compress et
                    for (const item of listData.items) {
                        const compressedItem = {
                            content: item.content,
                            value: item.value,
                            image: ''
                        };
                        
                        if (item.image && item.image.startsWith('data:image')) {
                            compressedItem.image = await resizeAndCompressImage(item.image);
                        } else {
                            compressedItem.image = item.image;
                        }
                        
                        compressedList.items.push(compressedItem);
                    }
                    
                    lists[index] = compressedList;
                    
                    try {
                        localStorage.setItem('lists', JSON.stringify(lists));
                        console.log("Liste güncellendi");
                        return compressedList;
                    } catch (error) {
                        if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                            console.log('Quota hatası, localStorage temizleniyor...');
                            localStorage.clear();
                            
                            const newLists = [compressedList];
                            localStorage.setItem('lists', JSON.stringify(newLists));
                            return compressedList;
                        }
                        
                        // Diğer hatalar için (push metodu bulunamadı vb.) yeni bir array oluştur
                        localStorage.removeItem('lists');
                        localStorage.setItem('lists', JSON.stringify([compressedList]));
                        return compressedList;
                    }
                } else {
                    // Bulunamadı, o zaman yeni bir liste olarak ekle
                    return this.saveList(listData);
                }
            } catch (error) {
                console.error('Liste güncelleme hatası:', error);
                // Hata durumunda yeni kaydet
                return this.saveList(listData);
            }
        },

        getList: function(listId) {
            console.log("getList çağrıldı");
            try {
                const storedLists = localStorage.getItem('lists');
                if (!storedLists) return null;
                
                let lists = [];
                try {
                    const parsedLists = JSON.parse(storedLists);
                    if (Array.isArray(parsedLists)) {
                        lists = parsedLists;
                    }
                } catch (e) {
                    return null;
                }
                
                const list = lists.find(list => list && list.id === listId);
                return list || null;
            } catch (error) {
                console.error('Liste alma hatası:', error);
                return null;
            }
        },

        getAllLists: function() {
            try {
                const storedLists = localStorage.getItem('lists');
                if (!storedLists) return [];
                
                let lists = [];
                try {
                    const parsedLists = JSON.parse(storedLists);
                    if (Array.isArray(parsedLists)) {
                        lists = parsedLists;
                    }
                } catch (e) {
                    return [];
                }
                
                return lists;
            } catch (error) {
                console.error('Listeler alma hatası:', error);
                return [];
            }
        }
    };

    // Global olarak da erişilebilir yap
    window.dataStorage = dataStorage;
    
    // Arka plan animasyonu için - karmaşık, detaylı ve parlak mavi çizgiler/noktalar
    if (window.particlesJS) {
        // Koyu lacivert arka plan ekle
        const techBg = document.querySelector('.tech-background');
        if (techBg) {
            techBg.style.background = 'radial-gradient(circle at center, #0a112e 0%, #03061a 100%)';
        }
        
        // Canvas oluştur ve detaylı ağ yapısı çiz
        const canvasElement = document.createElement('canvas');
        canvasElement.id = 'network-canvas';
        canvasElement.style.position = 'absolute';
        canvasElement.style.top = '0';
        canvasElement.style.left = '0';
        canvasElement.style.width = '100%';
        canvasElement.style.height = '100%';
        canvasElement.style.zIndex = '0';
        document.getElementById('particles-js').appendChild(canvasElement);
        
        // Canvas boyutunu ayarla
        const resizeCanvas = () => {
            canvasElement.width = window.innerWidth;
            canvasElement.height = window.innerHeight;
            drawComplexNetwork();
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        // Karmaşık ağ yapısı çizimi
        function drawComplexNetwork() {
            const ctx = canvasElement.getContext('2d');
            ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            
            // Merkez nokta - ekranın merkezinde
            const centerX = canvasElement.width / 2;
            const centerY = canvasElement.height / 2;
            
            // Noktalar ve bağlantılar için parametreler
            const points = [];
            const maxPoints = 150;
            
            // Ana noktalar ekle
            for (let i = 0; i < maxPoints; i++) {
                // Asimetrik dağılım
                let angle, distance;
                
                if (i === 0) {
                    // Merkez nokta
                    angle = 0;
                    distance = 0;
                } else {
                    // Ağırlıklı olarak merkez etrafında yoğunlaşma
                    angle = Math.random() * Math.PI * 2;
                    
                    // Merkeze daha yakın noktalar daha fazla olsun
                    const randomFactor = Math.pow(Math.random(), 1.5);
                    distance = (canvasElement.width / 3) * randomFactor;
                }
                
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                
                // Farklı boyutlarda noktalar oluştur
                points.push({
                    x: x,
                    y: y,
                    size: i === 0 ? 2 : 0.5 + Math.random() * 1.5,
                    connections: [],
                    brightness: 0.3 + Math.random() * 0.7 // Parlaklık değişkeni
                });
            }
            
            // Bağlantıları oluştur
            for (let i = 0; i < points.length; i++) {
                // Merkez noktayı diğer noktalara bağla
                if (i === 0) {
                    // Merkez noktayı bazı noktalara bağla
                    for (let j = 1; j < points.length; j++) {
                        if (Math.random() < 0.3) { // %30 olasılıkla bağlantı oluştur
                            points[i].connections.push(j);
                            points[j].connections.push(i);
                        }
                    }
                } else {
                    // Diğer noktaları birbirine bağla - karmaşık ağ yapısı oluştur
                    for (let j = i + 1; j < points.length; j++) {
                        const dx = points[i].x - points[j].x;
                        const dy = points[i].y - points[j].y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        // Yakın noktaları birbirine bağla
                        if (distance < 150 && Math.random() < 0.1) {
                            points[i].connections.push(j);
                            points[j].connections.push(i);
                        }
                    }
                }
            }
            
            // Bağlantıları çiz
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                
                for (let j = 0; j < point.connections.length; j++) {
                    const connectedPoint = points[point.connections[j]];
                    
                    // Merkeze olan uzaklığa göre çizgi rengi/transparanlığı
                    const dx1 = point.x - centerX;
                    const dy1 = point.y - centerY;
                    const dx2 = connectedPoint.x - centerX;
                    const dy2 = connectedPoint.y - centerY;
                    
                    const distanceFromCenter1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
                    const distanceFromCenter2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                    
                    const averageDistance = (distanceFromCenter1 + distanceFromCenter2) / 2;
                    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
                    
                    // Merkeze yakın çizgiler daha parlak
                    const opacity = Math.max(0.05, 0.4 * (1 - averageDistance / maxDistance));
                    
                    // Rastgele mavi ton
                    const blueIntensity = 180 + Math.floor(Math.random() * 75);
                    
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(connectedPoint.x, connectedPoint.y);
                    ctx.strokeStyle = `rgba(0, ${blueIntensity}, 255, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
            
            // Noktaları çiz
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                
                // Merkez noktayı daha parlak ve büyük yap
                if (i === 0) {
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, point.size * 2, 0, Math.PI * 2);
                    ctx.fillStyle = '#00ffff';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#00ffff';
                    ctx.fill();
                    ctx.shadowBlur = 0;
                } else {
                    // Bağlantısı olan noktalar daha parlak
                    const brightness = point.connections.length > 0 ? 1 : 0.5;
                    
                    // Merkeze yakın noktalar daha parlak
                    const dx = point.x - centerX;
                    const dy = point.y - centerY;
                    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
                    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
                    
                    // Bağlantı sayısı ve merkeze yakınlık parlaklığı etkiler
                    const intensityFactor = 1 - (distanceFromCenter / maxDistance);
                    const brightnessValue = Math.min(1, (brightness + intensityFactor) * point.brightness);
                    
                    // Glow efekti
                    const hasGlow = point.connections.length > 1 && Math.random() > 0.6;
                    
                    if (hasGlow) {
                        ctx.shadowBlur = 4 + Math.random() * 4;
                        ctx.shadowColor = '#00c8ff';
                    }
                    
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(0, ${150 + Math.floor(brightnessValue * 105)}, 255, ${0.3 + brightnessValue * 0.7})`;
                    ctx.fill();
                    
                    ctx.shadowBlur = 0;
                }
            }
        }
        
        // Sabit çizgiler çiz
        drawComplexNetwork();
        
        // Arka plandaki hareketli parçacıklar için particles.js ayarları
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 70,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: "#00a8ff"
                },
                shape: {
                    type: "circle"
                },
                opacity: {
                    value: 0.5,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 0.8,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 2,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        size_min: 0.5,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 120,
                    color: "#00a8ff",
                    opacity: 0.3,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1.2,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: {
                        enable: true,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: "grab"
                    },
                    onclick: {
                        enable: true,
                        mode: "push"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.8
                        }
                    },
                    push: {
                        particles_nb: 3
                    }
                }
            },
            retina_detect: true
        });
        
        // Enerji dalgası efekti - merkeze yeni nokta eklendiğinde dışa doğru yayılan halka
        let radiusOffset = 0;
        function drawEnergyWave() {
            const ctx = canvasElement.getContext('2d');
            
            // Dalgaların merkezi
            const centerX = canvasElement.width / 2;
            const centerY = canvasElement.height / 2;
            
            // Dalga hareketi
            radiusOffset += 1;
            if (radiusOffset > 150) radiusOffset = 0;
            
            // İç içe halkalar
            for (let i = 0; i < 3; i++) {
                const radius = 50 + (i * 60) + radiusOffset;
                const opacity = Math.max(0, 0.4 - (radius / 300));
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0, 200, 255, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            requestAnimationFrame(drawEnergyWave);
        }
        
        // Enerji dalgalarını başlat
        drawEnergyWave();
    }
    
    // Initialize item count
    let currentListData = null;
    
    // Check if we're in edit mode (URL has listId parameter)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const listId = urlParams.get('listId');
        
        if (listId) {
            console.log("Liste ID bulundu, liste verisi alınıyor");
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