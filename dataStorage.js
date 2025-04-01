// dataStorage.js - Liste verilerini localStorage'da saklama servisi

// Hemen self-invoking function ile global namespace'i kirletmeden çalışır
(function() {
    'use strict';

    // DataStorage servisini oluştur
    const dataStorage = {
        // Liste kaydetme
        saveList: function(listData) {
            if (!listData || !listData.id) {
                console.error('Geçersiz liste verisi');
                return false;
            }
            
            try {
                // Önce tüm listeleri al
                const lists = this.getAllLists();
                
                // Mevcut liste varsa güncelle, yoksa ekle
                const existingIndex = lists.findIndex(list => list.id === listData.id);
                if (existingIndex >= 0) {
                    lists[existingIndex] = listData;
                } else {
                    lists.push(listData);
                }
                
                // Tüm listeleri kaydet
                localStorage.setItem('qrLists', JSON.stringify(lists));
                
                // Başarılı
                return true;
            } catch (error) {
                console.error('Liste kaydedilirken hata oluştu:', error);
                return false;
            }
        },
        
        // Liste alma
        getList: function(listId) {
            if (!listId) {
                console.error('Liste ID belirtilmedi');
                return null;
            }
            
            try {
                // Tüm listeleri al
                const lists = this.getAllLists();
                
                // ID'ye göre liste bul
                return lists.find(list => list.id === listId) || null;
            } catch (error) {
                console.error('Liste alınırken hata oluştu:', error);
                return null;
            }
        },
        
        // Liste silme
        deleteList: function(listId) {
            if (!listId) {
                console.error('Liste ID belirtilmedi');
                return false;
            }
            
            try {
                // Tüm listeleri al
                const lists = this.getAllLists();
                
                // ID'ye göre filtreleme yaparak listeyi sil
                const filteredLists = lists.filter(list => list.id !== listId);
                
                // Güncellenmiş listeleri kaydet
                localStorage.setItem('qrLists', JSON.stringify(filteredLists));
                
                // Başarılı
                return true;
            } catch (error) {
                console.error('Liste silinirken hata oluştu:', error);
                return false;
            }
        },
        
        // Tüm listeleri alma
        getAllLists: function() {
            try {
                // LocalStorage'dan listeleri al
                const storedLists = localStorage.getItem('qrLists');
                
                // Veri yoksa boş dizi döndür
                if (!storedLists) {
                    return [];
                }
                
                // Veriyi parse et ve döndür
                return JSON.parse(storedLists);
            } catch (error) {
                console.error('Tüm listeler alınırken hata oluştu:', error);
                return [];
            }
        },
        
        // Test verisi oluştur (geliştirme için)
        createTestData: function() {
            const testLists = [
                {
                    id: 'test-list-1',
                    title: 'Örnek Alışveriş Listesi',
                    items: [
                        { id: 'item-1', content: 'Ekmek', value: '2 adet' },
                        { id: 'item-2', content: 'Süt', value: '1 litre' },
                        { id: 'item-3', content: 'Yumurta', value: '10 adet' }
                    ]
                },
                {
                    id: 'test-list-2',
                    title: 'Yapılacaklar Listesi',
                    items: [
                        { id: 'item-1', content: 'E-postaları kontrol et', value: 'Yüksek öncelik' },
                        { id: 'item-2', content: 'Raporu tamamla', value: 'Orta öncelik' },
                        { id: 'item-3', content: 'Toplantı notlarını hazırla', value: 'Düşük öncelik' }
                    ]
                }
            ];
            
            localStorage.setItem('qrLists', JSON.stringify(testLists));
            console.log('Test verileri oluşturuldu:', testLists);
            return testLists;
        },
        
        // Tüm listeleri temizle
        clearAllLists: function() {
            try {
                localStorage.removeItem('qrLists');
                return true;
            } catch (error) {
                console.error('Listeler temizlenirken hata oluştu:', error);
                return false;
            }
        }
    };
    
    // DataStorage'ı global window nesnesine ekle
    window.dataStorage = dataStorage;
    
    console.log('DataStorage servisi başarıyla yüklendi');
})();
