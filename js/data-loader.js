/**
 * Office Eğitim Sistemi - Veri Yönetimi Modülü
 * JSON veri yükleme ve içerik yönetimi
 */

class DataLoader {
    constructor() {
        this.cache = new Map();
        this.baseURL = 'data/';
        this.loadedContent = {};
    }

    /**
     * Load JSON data with caching
     */
    async loadJSON(path, useCache = true) {
        const fullPath = `${this.baseURL}${path}`;
        
        // Check cache first
        if (useCache && this.cache.has(fullPath)) {
            return this.cache.get(fullPath);
        }

        try {
            const response = await fetch(fullPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Cache the data
            if (useCache) {
                this.cache.set(fullPath, data);
            }
            
            return data;
        } catch (error) {
            console.error(`Failed to load ${fullPath}:`, error);
            return null;
        }
    }

    /**
     * Load menu content structure
     */
    async loadMenuContent(appId, menuId) {
        // Try to load specific menu content
        const specificContent = await this.loadJSON(`${appId}/${menuId}.json`);
        
        if (specificContent) {
            return specificContent;
        }
        
        // Return default content if specific content not found
        return this.generateDefaultContent(appId, menuId);
    }

    /**
     * Generate default content structure
     */
    generateDefaultContent(appId, menuId) {
        const appNames = {
            word: 'Microsoft Word',
            excel: 'Microsoft Excel',
            powerpoint: 'Microsoft PowerPoint',
            outlook: 'Microsoft Outlook'
        };

        const menuNames = {
            dosya: 'Dosya',
            giris: 'Giriş',
            ekle: 'Ekle',
            tasarim: 'Tasarım',
            duzen: 'Düzen',
            formul: 'Formüller',
            veri: 'Veri',
            gecisler: 'Geçişler',
            animasyonlar: 'Animasyonlar'
        };

        return {
            title: `${appNames[appId]} - ${menuNames[menuId]} Menüsü`,
            description: `${appNames[appId]} uygulamasının ${menuNames[menuId]} menüsü eğitim içeriği`,
            sections: this.generateDefaultSections(appId, menuId)
        };
    }

    /**
     * Generate default sections based on app and menu
     */
    generateDefaultSections(appId, menuId) {
        const sections = [];
        
        // Word specific sections
        if (appId === 'word') {
            if (menuId === 'giris') {
                sections.push(
                    {
                        title: "Pano İşlemleri",
                        content: {
                            type: "detailed",
                            introduction: "Pano işlemleri, metinleri ve nesneleri kopyalama, kesme ve yapıştırma işlemlerini içerir.",
                            steps: [
                                {
                                    title: "Kopyalama (Ctrl+C)",
                                    description: "Seçili metni veya nesneyi panoya kopyalar",
                                    menu: "Giriş > Pano > Kopyala"
                                },
                                {
                                    title: "Kesme (Ctrl+X)",
                                    description: "Seçili içeriği keser ve panoya alır",
                                    menu: "Giriş > Pano > Kes"
                                },
                                {
                                    title: "Yapıştırma (Ctrl+V)",
                                    description: "Panodaki içeriği belgede imlecin bulunduğu yere yapıştırır",
                                    menu: "Giriş > Pano > Yapıştır"
                                }
                            ],
                            tip: "Pano geçmişi için Windows+V tuş kombinasyonunu kullanabilirsiniz"
                        }
                    },
                    {
                        title: "Yazı Tipi Biçimlendirme",
                        content: {
                            type: "detailed",
                            introduction: "Metinlerinizi daha etkili hale getirmek için yazı tipi özelliklerini değiştirebilirsiniz.",
                            features: [
                                "Yazı tipi seçimi",
                                "Yazı boyutu ayarlama",
                                "Kalın, italik, altı çizili",
                                "Yazı rengi değiştirme",
                                "Vurgulama rengi"
                            ],
                            interactive: {
                                id: "font-formatting-demo",
                                title: "Yazı Tipi Biçimlendirme Demosu",
                                description: "Farklı yazı tipi biçimlendirme seçeneklerini deneyin",
                                buttonText: "Demoyu Başlat"
                            }
                        }
                    },
                    {
                        title: "Paragraf Düzenleme",
                        content: {
                            type: "detailed",
                            introduction: "Paragraf düzenleme, metninizin düzenli ve profesyonel görünmesini sağlar.",
                            tabs: [
                                {
                                    title: "Hizalama",
                                    content: "Sol, sağ, orta ve iki yana yaslama seçenekleri"
                                },
                                {
                                    title: "Girinti",
                                    content: "Sol ve sağ girintiler, ilk satır girintisi"
                                },
                                {
                                    title: "Aralık",
                                    content: "Satır aralığı ve paragraf aralığı ayarları"
                                }
                            ]
                        }
                    }
                );
            } else if (menuId === 'ekle') {
                sections.push(
                    {
                        title: "Tablo Ekleme",
                        content: {
                            type: "detailed",
                            introduction: "Tablolar, verileri düzenli bir şekilde sunmanın en etkili yollarından biridir.",
                            steps: [
                                {
                                    title: "Hızlı Tablo Ekleme",
                                    description: "Ekle menüsünden tablo simgesine tıklayın ve boyutu seçin",
                                    menu: "Ekle > Tablo > Tablo Ekle"
                                },
                                {
                                    title: "Özel Tablo",
                                    description: "Satır ve sütun sayısını belirleyerek özel tablo oluşturun",
                                    menu: "Ekle > Tablo > Tablo Ekle... (iletişim kutusu)"
                                }
                            ],
                            quiz: {
                                title: "Tablo Bilgi Testi",
                                questions: [
                                    {
                                        question: "Tabloya yeni satır eklemek için hangi kısayol kullanılır?",
                                        options: ["Tab tuşu", "Enter tuşu", "Ctrl+Enter", "Shift+Enter"],
                                        correct: 0
                                    },
                                    {
                                        question: "Tablo stillerini nereden değiştirebilirsiniz?",
                                        options: ["Dosya menüsü", "Tablo Araçları > Tasarım", "Gözden Geçir menüsü", "Görünüm menüsü"],
                                        correct: 1
                                    }
                                ]
                            }
                        }
                    },
                    {
                        title: "Resim ve Grafik",
                        content: {
                            type: "detailed",
                            introduction: "Görsel öğeler belgenizi daha ilgi çekici hale getirir.",
                            accordion: [
                                {
                                    title: "Bilgisayardan Resim Ekleme",
                                    content: "Ekle > Resimler > Bu Cihaz yolunu takip ederek bilgisayarınızdan resim ekleyebilirsiniz."
                                },
                                {
                                    title: "Çevrimiçi Resim",
                                    content: "Bing görsel arama veya OneDrive üzerinden çevrimiçi resim ekleyebilirsiniz."
                                },
                                {
                                    title: "SmartArt Grafikleri",
                                    content: "Profesyonel görünümlü diyagramlar ve organizasyon şemaları oluşturabilirsiniz."
                                }
                            ]
                        }
                    }
                );
            }
        }
        
        // Excel specific sections
        if (appId === 'excel') {
            if (menuId === 'formul') {
                sections.push(
                    {
                        title: "Temel Formüller",
                        content: {
                            type: "detailed",
                            introduction: "Excel'de en çok kullanılan temel formüller ve fonksiyonlar.",
                            code_examples: [
                                {
                                    title: "SUM (TOPLA)",
                                    code: "=TOPLA(A1:A10)",
                                    description: "Belirtilen aralıktaki değerleri toplar"
                                },
                                {
                                    title: "AVERAGE (ORTALAMA)",
                                    code: "=ORTALAMA(B1:B20)",
                                    description: "Belirtilen aralığın ortalamasını hesaplar"
                                },
                                {
                                    title: "IF (EĞER)",
                                    code: "=EĞER(C1>100;\"Yüksek\";\"Düşük\")",
                                    description: "Koşullu mantık uygular"
                                }
                            ],
                            warning: "Formül yazarken hücre referanslarının doğru olduğundan emin olun!"
                        }
                    },
                    {
                        title: "VLOOKUP Fonksiyonu",
                        content: {
                            type: "detailed",
                            introduction: "VLOOKUP, verileri başka bir tablodan çekmek için kullanılır.",
                            video: {
                                type: "placeholder",
                                title: "VLOOKUP Kullanım Videosu",
                                duration: "5:30"
                            },
                            practice: {
                                title: "VLOOKUP Alıştırması",
                                description: "Örnek veri setiyle VLOOKUP kullanımını pratik edin"
                            }
                        }
                    }
                );
            }
        }

        // PowerPoint specific sections  
        if (appId === 'powerpoint') {
            if (menuId === 'animasyonlar') {
                sections.push(
                    {
                        title: "Giriş Animasyonları",
                        content: {
                            type: "detailed",
                            introduction: "Nesnelerin slaytta görünme şeklini kontrol eden animasyonlar.",
                            gallery: [
                                {
                                    title: "Belirme",
                                    description: "Nesne yavaşça belirerek görünür"
                                },
                                {
                                    title: "Uçarak Giriş",
                                    description: "Nesne belirlenen yönden uçarak gelir"
                                },
                                {
                                    title: "Yakınlaştırma",
                                    description: "Nesne büyüyerek görünür"
                                }
                            ]
                        }
                    }
                );
            }
        }

        // Add common sections for all
        sections.push(
            {
                title: "Özet ve İpuçları",
                content: {
                    type: "summary",
                    points: [
                        "Klavye kısayolları ile daha hızlı çalışabilirsiniz",
                        "Düzenli kaydetmeyi unutmayın (Ctrl+S)",
                        "Yedekleme için bulut depolama kullanın"
                    ],
                    next_steps: "Öğrendiklerinizi pekiştirmek için alıştırmaları tamamlayın"
                }
            }
        );

        return sections;
    }

    /**
     * Search content across all applications
     */
    async searchContent(query) {
        const results = [];
        const normalizedQuery = query.toLowerCase();

        // Load all applications
        const applicationsData = await this.loadJSON('applications.json');
        if (!applicationsData) return results;

        // Search through applications and menus
        for (const app of applicationsData.applications) {
            for (const menu of app.menus) {
                // Check if menu name or description contains query
                if (menu.name.toLowerCase().includes(normalizedQuery) ||
                    menu.description.toLowerCase().includes(normalizedQuery)) {
                    results.push({
                        title: `${app.name} - ${menu.name}`,
                        snippet: menu.description,
                        app: app.name,
                        menu: menu.name,
                        appId: app.id,
                        menuId: menu.id,
                        query: query
                    });
                }
            }

            // Check popular topics
            for (const topic of app.popular_topics) {
                if (topic.toLowerCase().includes(normalizedQuery)) {
                    results.push({
                        title: `${app.name} - ${topic}`,
                        snippet: `Popüler konu: ${topic}`,
                        app: app.name,
                        menu: 'Popüler Konular',
                        appId: app.id,
                        menuId: null,
                        query: query
                    });
                }
            }
        }

        return results;
    }

    /**
     * Preload content for better performance
     */
    async preloadContent(appId) {
        const app = await this.loadJSON('applications.json');
        if (!app || !app.applications) return;

        const selectedApp = app.applications.find(a => a.id === appId);
        if (!selectedApp) return;

        // Preload menu contents in background
        for (const menu of selectedApp.menus) {
            this.loadMenuContent(appId, menu.id).then(content => {
                console.log(`Preloaded: ${appId}/${menu.id}`);
            });
        }
    }

    /**
     * Export user progress data
     */
    exportProgress(progress) {
        const exportData = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            progress: progress,
            statistics: this.calculateStatistics(progress)
        };

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Import user progress data
     */
    importProgress(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Validate version
            if (!data.version || data.version !== '2.0') {
                throw new Error('Incompatible version');
            }

            return data.progress;
        } catch (error) {
            console.error('Failed to import progress:', error);
            return null;
        }
    }

    /**
     * Calculate statistics from progress
     */
    calculateStatistics(progress) {
        const stats = {
            totalCompleted: 0,
            byApplication: {},
            lastUpdated: new Date().toISOString()
        };

        for (const [key, value] of Object.entries(progress)) {
            if (key.includes('_menus')) {
                const appId = key.replace('_menus', '');
                stats.byApplication[appId] = {
                    completed: 0,
                    menus: {}
                };

                for (const [menuId, menuProgress] of Object.entries(value)) {
                    stats.byApplication[appId].menus[menuId] = menuProgress.completed;
                    stats.byApplication[appId].completed += menuProgress.completed;
                    stats.totalCompleted += menuProgress.completed;
                }
            }
        }

        return stats;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        this.loadedContent = {};
    }

    /**
     * Get cached content size
     */
    getCacheSize() {
        return this.cache.size;
    }
}

// Create global instance
const dataLoader = new DataLoader();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataLoader;
}