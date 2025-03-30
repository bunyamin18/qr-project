class DataStorage {
    constructor() {
        this.dbName = 'qr-lists-db';
        this.dbVersion = 1;
        this.storeName = 'lists';
        this.maxLists = 100; // Maksimum liste sayısı
        this.maxItemLength = 1000; // Her öğe için maksimum karakter sayısı
        this.db = null;
        this.initializeDB();
    }

    async initializeDB() {
        try {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.dbVersion);

                request.onerror = (event) => {
                    console.error('Database initialization error:', event.target.error);
                    reject(event.target.error);
                };

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    resolve();
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        db.createObjectStore(this.storeName, { keyPath: 'id' });
                    }
                };
            });
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }

    async getAllLists() {
        try {
            await this.initializeDB();
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.getAll();

                request.onsuccess = (event) => {
                    resolve(event.target.result || []);
                };

                request.onerror = (event) => {
                    console.error('Error getting lists:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error('Error getting lists:', error);
            throw error;
        }
    }

    async getList(listId) {
        try {
            const lists = await this.getAllLists();
            return lists.find(list => list.id === listId);
        } catch (error) {
            console.error('Liste alma hatası:', error);
            throw error;
        }
    }

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
            await this.saveLists(listData);
            
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

    async saveLists(listData) {
        try {
            await this.initializeDB();
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                
                // Önce mevcut listeyi sil
                if (listData.id) {
                    store.delete(listData.id);
                }
                
                // Yeni listeyi ekle
                const request = store.add(listData);

                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };

                request.onerror = (event) => {
                    console.error('Error saving list:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error('Error saving list:', error);
            throw error;
        }
    }

    generateUniqueID() {
        return 'list_' + Math.random().toString(36).substr(2, 9);
    }
}

// Singleton instance
const dataStorage = new DataStorage();

// Exporting the instance
export default dataStorage;
