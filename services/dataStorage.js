class DataStorage {
    constructor() {
        this.storageKey = 'lists';
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
            // Liste ID'si yoksa oluştur
            if (!listData.id) {
                listData.id = this.generateUniqueID();
            }

            const lists = this.getAllLists();
            const existingIndex = lists.findIndex(list => list.id === listData.id);
            
            if (existingIndex !== -1) {
                lists[existingIndex] = listData;
            } else {
                lists.push(listData);
            }

            // Veriyi kaydet
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
            throw new Error('Liste kaydedilirken bir hata oluştu');
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
}

// Singleton instance
const dataStorage = new DataStorage();

// Exporting the instance
window.dataStorage = dataStorage;

export default dataStorage;
