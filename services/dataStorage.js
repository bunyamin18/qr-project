class DataStorage {
    constructor() {
        this.storagePath = 'data/lists.json';
        this.maxLists = 100; // Maksimum liste sayısı
        this.maxItemLength = 1000; // Her öğe için maksimum karakter sayısı
        this.initializeStorage();
    }

    // Depolamayı başlat
    async initializeStorage() {
        try {
            const file = await fetch(this.storagePath);
            if (!file.ok) {
                // Dosya yoksa yeni bir dosya oluştur
                await this.saveLists([]);
            }
        } catch (error) {
            console.error('Depolama başlatma hatası:', error);
            await this.saveLists([]);
        }
    }

    // Tüm listeleri al
    async getAllLists() {
        try {
            const response = await fetch(this.storagePath);
            if (!response.ok) {
                throw new Error('Dosya okuma hatası');
            }
            const lists = await response.json();
            return Array.isArray(lists) ? lists : [];
        } catch (error) {
            console.error('Veri okuma hatası:', error);
            await this.initializeStorage();
            return [];
        }
    }

    // Liste ekle veya güncelle
    async saveList(listData) {
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
            const lists = await this.getAllLists();
            
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
            await this.saveLists(lists);
            
            // Kaydedilen veriyi doğrula
            const savedLists = await this.getAllLists();
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

    // Tüm listeleri kaydet
    async saveLists(lists) {
        try {
            const response = await fetch(this.storagePath, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(lists)
            });

            if (!response.ok) {
                throw new Error('Dosya kaydetme hatası');
            }
        } catch (error) {
            console.error('Dosya kaydetme hatası:', error);
            throw error;
        }
    }

    // Benzersiz ID oluştur
    generateUniqueID() {
        return 'list_' + Math.random().toString(36).substr(2, 9);
    }
}

// Singleton instance
const dataStorage = new DataStorage();

// Exporting the instance
export default dataStorage;
