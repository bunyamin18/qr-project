// Veri depolama servisi
const dataStorage = {
    // Tüm listeleri getir
    getAllLists() {
        try {
            const listsString = localStorage.getItem('lists');
            return listsString ? JSON.parse(listsString) : [];
        } catch (error) {
            console.error('Listeleri alma hatası:', error);
            return [];
        }
    },
    
    // Belirli bir listeyi id'ye göre getir
    getList(id) {
        try {
            const lists = this.getAllLists();
            return lists.find(list => list.id === id) || null;
        } catch (error) {
            console.error('Liste alma hatası:', error);
            return null;
        }
    },
    
    // Yeni liste kaydet
    saveList(listData) {
        try {
            const lists = this.getAllLists();
            const listId = this.generateId();
            
            const list = { id: listId, title: listData.title, items: listData.items };
            lists.push(list);
            
            localStorage.setItem('lists', JSON.stringify(lists));
            return list;
        } catch (error) {
            console.error('Liste kaydetme hatası:', error);
            return null;
        }
    },
    
    // Mevcut bir listeyi güncelle
    updateList(listData) {
        try {
            const lists = this.getAllLists();
            const listIndex = lists.findIndex(list => list.id === listData.id);
            
            if (listIndex === -1) {
                return null;
            }
            
            lists[listIndex] = { id: listData.id, title: listData.title, items: listData.items };
            localStorage.setItem('lists', JSON.stringify(lists));
            
            return lists[listIndex];
        } catch (error) {
            console.error('Liste güncelleme hatası:', error);
            return null;
        }
    },
    
    // Benzersiz ID oluştur
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },
    
    // Veri tabanını temizle (test için)
    clear() {
        localStorage.removeItem('lists');
    }
};

export default dataStorage;
