class DataStorage {
    constructor() {
        this.storageKey = 'lists';
        this.maxLists = 100; // Maksimum liste sayısı
        this.maxItemLength = 1000; // Her öğe için maksimum karakter sayısı
        this.initializeStorage();
    }

    // Depolamayı başlat
    initializeStorage() {
        try {
            const lists = localStorage.getItem(this.storageKey);
            if (!lists) {
                localStorage.setItem(this.storageKey, JSON.stringify([]));
            }
        } catch (error) {
            console.error('Depolama başlatma hatası:', error);
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }

    // Tüm listeleri al
    getAllLists() {
        try {
            const lists = localStorage.getItem(this.storageKey);
            if (!lists) {
                this.initializeStorage();
                return [];
            }
            const parsedLists = JSON.parse(lists);
            return Array.isArray(parsedLists) ? parsedLists : [];
        } catch (error) {
            console.error('Veri okuma hatası:', error);
            this.initializeStorage();
            return [];
        }
    }

    // Liste ekle veya güncelle
    saveList(listData) {
        try {
            // Liste verisini doğrula
            if (!listData || typeof listData !== 'object') {
                throw new Error('Geçersiz liste verisi');
            }

            if (!listData.title || typeof listData.title !== 'string') {
                throw new Error('Geçersiz liste başlığı');
            }

            if (!Array.isArray(listData.items)) {
                throw new Error('Geçersiz liste öğeleri');
            }

            // Veri boyutunu kontrol et
            const titleSize = listData.title.length;
            const itemsSize = listData.items.reduce((total, item) => {
                return total + item.content.length + (item.value ? item.value.length : 0);
            }, 0);

            if (titleSize > this.maxItemLength || itemsSize > this.maxItemLength) {
                throw new Error('Liste verisi çok büyük');
            }

            // Mevcut listeleri al
            const lists = this.getAllLists();
            
            // Liste sayısını kontrol et
            if (lists.length >= this.maxLists && !lists.some(list => list.id === listData.id)) {
                throw new Error('Maksimum liste limiti aşıldı');
            }

            // Liste ID'si yoksa oluştur
            if (!listData.id) {
                listData.id = this.generateUniqueID();
            }

            // Liste güncelleme veya ekleme
            const existingIndex = lists.findIndex(list => list.id === listData.id);
            
            if (existingIndex !== -1) {
                lists[existingIndex] = listData;
            } else {
                lists.push(listData);
            }

            // Veriyi sakla
            localStorage.setItem(this.storageKey, JSON.stringify(lists));
            
            // Kaydedilen veriyi doğrula
            const savedLists = this.getAllLists();
            const savedList = savedLists.find(list => list.id === listData.id);
            
            if (!savedList) {
                throw new Error('Liste kaydedilemedi');
            }

            return savedList;
        } catch (error) {
            console.error('Veri kaydetme hatası:', error);
            throw error;
        }
    }

    // Liste al
    getList(listId) {
        try {
            const lists = this.getAllLists();
            return lists.find(list => list.id === listId);
        } catch (error) {
            console.error('Veri okuma hatası:', error);
            return null;
        }
    }

    // Liste sil
    deleteList(listId) {
        try {
            const lists = this.getAllLists();
            const updatedLists = lists.filter(list => list.id !== listId);
            localStorage.setItem(this.storageKey, JSON.stringify(updatedLists));
        } catch (error) {
            console.error('Veri silme hatası:', error);
        }
    }

    // Benzersiz ID oluşturma
    generateUniqueID() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Depolama kullanımını kontrol et
    checkStorageUsage() {
        try {
            const lists = this.getAllLists();
            const storageSize = JSON.stringify(lists).length;
            const quota = 5 * 1024 * 1024; // 5MB
            
            if (storageSize > quota) {
                throw new Error('Depolama limiti aşıldı');
            }
            
            return {
                used: storageSize,
                quota: quota,
                percentage: (storageSize / quota) * 100
            };
        } catch (error) {
            console.error('Depolama kullanımını kontrol etme hatası:', error);
            return {
                used: 0,
                quota: 5 * 1024 * 1024,
                percentage: 0
            };
        }
    }
}

// Singleton instance
const dataStorage = new DataStorage();

// Exporting the instance
window.dataStorage = dataStorage;

export default dataStorage;
