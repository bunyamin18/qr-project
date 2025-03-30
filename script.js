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
    
    // Teknolojik devre tarzı arka plan animasyonu
    if (window.particlesJS) {
        // Canvas oluştur
        const canvasEl = document.createElement('canvas');
        const bgElement = document.getElementById('particles-js');
        
        if (!bgElement) {
            console.error("particles-js elementi bulunamadı");
            return;
        }
        
        // Koyu lacivert arka plan ekle
        bgElement.style.background = 'radial-gradient(circle at center, #061638 0%, #02071A 100%)';
        
        canvasEl.style.position = 'absolute';
        canvasEl.style.top = '0';
        canvasEl.style.left = '0';
        canvasEl.style.width = '100%';
        canvasEl.style.height = '100%';
        canvasEl.style.zIndex = '0';
        canvasEl.style.opacity = '0.8';
        
        bgElement.appendChild(canvasEl);
        
        // Canvas boyutunu ayarla
        function resizeCanvas() {
            canvasEl.width = window.innerWidth;
            canvasEl.height = window.innerHeight;
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        const ctx = canvasEl.getContext('2d');
        
        // Devre çizgileri oluştur - gönderilen resme benzer şekilde
        const circuits = [];
        const centerX = canvasEl.width / 2;
        const centerY = canvasEl.height / 2;
        
        // Merkezdeki ışık efekti
        function drawCenterGlow() {
            const radius = 80 + Math.sin(Date.now() / 1000) * 10;
            const gradient = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, radius
            );
            
            gradient.addColorStop(0, 'rgba(0, 150, 255, 0.6)');
            gradient.addColorStop(0.5, 'rgba(0, 100, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 50, 255, 0)');
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
        
        // Devre çizgisi oluştur
        function createCircuit() {
            // Devre başlangıç noktası - kenarlardan başlat
            let startX, startY;
            const side = Math.floor(Math.random() * 4); // 0: üst, 1: sağ, 2: alt, 3: sol
            
            switch(side) {
                case 0: // Üst
                    startX = Math.random() * canvasEl.width;
                    startY = 0;
                    break;
                case 1: // Sağ
                    startX = canvasEl.width;
                    startY = Math.random() * canvasEl.height;
                    break;
                case 2: // Alt
                    startX = Math.random() * canvasEl.width;
                    startY = canvasEl.height;
                    break;
                case 3: // Sol
                    startX = 0;
                    startY = Math.random() * canvasEl.height;
                    break;
            }
            
            // Devre noktaları
            const points = [{x: startX, y: startY}];
            let currentX = startX;
            let currentY = startY;
            
            // Merkeze doğru ilerleyen dönemeçli yol
            const steps = 3 + Math.floor(Math.random() * 4); // 3-6 dönemeç
            
            for (let i = 0; i < steps; i++) {
                // Merkeze doğru yönelim
                const towardsCenter = i >= steps - 2; // Son 2 adımda merkeze doğru
                
                let nextX, nextY;
                
                if (towardsCenter) {
                    // Son düzlükte merkeze doğru yönlendir
                    const angle = Math.atan2(centerY - currentY, centerX - currentX);
                    const distance = Math.hypot(centerX - currentX, centerY - currentY);
                    const stepDistance = distance * (0.4 + Math.random() * 0.4); // %40-%80 arasında yaklaş
                    
                    nextX = currentX + Math.cos(angle) * stepDistance;
                    nextY = currentY + Math.sin(angle) * stepDistance;
                } else {
                    // 90 derecelik dönüşler - devre tarzı
                    const horizontal = Math.random() > 0.5;
                    
                    if (horizontal) {
                        nextX = currentX + (Math.random() > 0.5 ? 1 : -1) * (50 + Math.random() * 150);
                        nextY = currentY;
                    } else {
                        nextX = currentX;
                        nextY = currentY + (Math.random() > 0.5 ? 1 : -1) * (50 + Math.random() * 150);
                    }
                }
                
                // Sınırları aşmayacak şekilde ayarla
                nextX = Math.max(0, Math.min(canvasEl.width, nextX));
                nextY = Math.max(0, Math.min(canvasEl.height, nextY));
                
                points.push({x: nextX, y: nextY});
                currentX = nextX;
                currentY = nextY;
            }
            
            // Son nokta olarak merkezi ekle
            const finalPoint = {
                x: centerX + (Math.random() - 0.5) * 80, // Tam merkez yerine biraz çevresinde
                y: centerY + (Math.random() - 0.5) * 80
            };
            points.push(finalPoint);
            
            return {
                points: points,
                width: 1 + Math.random() * 1.5, // Çizgi kalınlığı
                color: `rgba(0, ${150 + Math.floor(Math.random() * 100)}, 255, 0.8)`, // Mavi tonları
                energy: {
                    position: 0, // 0-1 arası, enerji parçacığının konumu
                    speed: 0.001 + Math.random() * 0.002, // Hareket hızı
                    size: 2 + Math.random() * 3, // Enerji parçacığı boyutu
                    active: false, // Enerji akıyor mu
                    delay: Math.random() * 5000 // Başlama gecikmesi
                }
            };
        }
        
        // Başlangıçta devreleri oluştur
        for (let i = 0; i < 25; i++) {
            circuits.push(createCircuit());
        }
        
        // Devre çizgilerini çiz
        function drawCircuits() {
            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
            
            // Merkezdeki glow efektini çiz
            drawCenterGlow();
            
            // Her devreyi çiz
            circuits.forEach(circuit => {
                const { points, width, color, energy } = circuit;
                
                // Devrenin kendisini çiz
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                
                ctx.strokeStyle = color;
                ctx.lineWidth = width;
                ctx.stroke();
                
                // Devrenin uç noktalarını çiz (nodelar)
                points.forEach((point, idx) => {
                    // Başlangıç, son ve dönüş noktalarında node'lar
                    if (idx === 0 || idx === points.length - 1 || idx % 2 === 0) {
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, width + 1, 0, Math.PI * 2);
                        ctx.fillStyle = color;
                        ctx.fill();
                    }
                });
                
                // Enerji akışını çiz
                if (Date.now() > energy.delay) {
                    energy.active = true;
                }
                
                if (energy.active) {
                    // Enerji akışı pozisyonunu güncelle
                    energy.position += energy.speed;
                    
                    // Enerji akışı tamamlandı mı?
                    if (energy.position >= 1) {
                        energy.position = 0; // Başa dön
                        energy.delay = Date.now() + Math.random() * 5000; // Yeni gecikme
                        energy.active = false;
                    } else {
                        // Enerji parçacığı pozisyonunu hesapla
                        const segmentCount = points.length - 1;
                        const totalPosition = energy.position * segmentCount;
                        const segmentIndex = Math.floor(totalPosition);
                        const segmentPosition = totalPosition - segmentIndex;
                        
                        if (segmentIndex < segmentCount) {
                            const p1 = points[segmentIndex];
                            const p2 = points[segmentIndex + 1];
                            
                            const energyX = p1.x + (p2.x - p1.x) * segmentPosition;
                            const energyY = p1.y + (p2.y - p1.y) * segmentPosition;
                            
                            // Enerji parçacığını çiz
                            const glow = ctx.createRadialGradient(
                                energyX, energyY, 0,
                                energyX, energyY, energy.size * 4
                            );
                            
                            glow.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
                            glow.addColorStop(0.5, 'rgba(0, 180, 255, 0.4)');
                            glow.addColorStop(1, 'rgba(0, 100, 255, 0)');
                            
                            ctx.beginPath();
                            ctx.arc(energyX, energyY, energy.size * 4, 0, Math.PI * 2);
                            ctx.fillStyle = glow;
                            ctx.fill();
                            
                            // Parçacık merkezi
                            ctx.beginPath();
                            ctx.arc(energyX, energyY, energy.size, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(180, 240, 255, 0.9)';
                            ctx.fill();
                        }
                    }
                }
            });
            
            requestAnimationFrame(drawCircuits);
        }
        
        // Animasyonu başlat
        drawCircuits();
        
        // Arka plan parçacıkları için particles.js ayarları
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 30,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: "#0080ff"
                },
                shape: {
                    type: "circle"
                },
                opacity: {
                    value: 0.3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 0.5,
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
                    color: "#0080ff",
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 0.8,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: {
                        enable: false,
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
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        });
    }
    
    // Mevcut liste verisi (düzenleme modu için)
    let currentListData = null;
    
    // Sayfa yüklendiğinde edit parametresini kontrol et
    const urlParams = new URLSearchParams(window.location.search);
    const editListId = urlParams.get('edit');
    
    if (editListId) {
        console.log("Düzenleme modu, liste ID:", editListId);
        try {
            // Liste verisini al
            const listToEdit = dataStorage.getList(editListId);
            
            if (listToEdit) {
                console.log("Düzenlenecek liste yüklendi:", listToEdit);
                
                // Mevcut liste verisini sakla
                currentListData = listToEdit;
                
                // Form alanlarını doldur
                listTitleInput.value = listToEdit.title || '';
                
                // Öğeleri ekle
                if (listToEdit.items && listToEdit.items.length > 0) {
                    // Önce varsayılan boş öğe satırını temizle
                    itemsContainer.innerHTML = '';
                    
                    // Her öğeyi ekle
                    listToEdit.items.forEach(item => {
                        addNewItemRow(item.content, item.value, item.image);
                    });
                }
                
                // Başlığı güncelle
                document.querySelector('h1').textContent = 'Listeyi Düzenle';
                document.querySelector('button[type="submit"]').textContent = 'Değişiklikleri Kaydet';
                
                // Düzenleme modunda olduğumuzu göstermek için sınıf ekle
                document.querySelector('.center-card').classList.add('edit-mode');
            } else {
                console.error("Düzenlenecek liste bulunamadı, ID:", editListId);
                alert("Düzenlenecek liste bulunamadı");
            }
        } catch (error) {
            console.error("Liste düzenleme hatası:", error);
            alert("Liste yüklenirken bir hata oluştu: " + error.message);
        }
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
                console.log("QR kod sayfasına yönlendiriliyor, liste ID:", savedList.id);
                
                // Liste ID'sini hem URL'de hem localStorage'da saklayalım (ek güvence)
                localStorage.setItem('currentQRListId', savedList.id);
                
                // Tam bir URL ile yönlendirme yapalım
                const qrPageUrl = new URL('qr-generator.html', window.location.href);
                qrPageUrl.searchParams.append('listId', savedList.id);
                
                window.location.href = qrPageUrl.toString();
            } else {
                throw new Error('Liste kaydedilirken bir hata oluştu');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            alert('Bir hata oluştu: ' + error.message);
        }
    });
});