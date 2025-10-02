/**
 * Office Eğitim Sistemi - Ana Uygulama
 * Dinamik menü sistemi ve uygulama yönetimi
 */

class OfficeEducationApp {
    constructor() {
        this.applications = [];
        this.currentApp = null;
        this.currentMenu = null;
        this.currentContent = null;
        this.userProgress = {};
        this.settings = {
            theme: 'light',
            language: 'tr',
            notifications: true
        };
        
        // Initialize application
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Show loading screen
            this.showLoading();
            
            // Load applications data
            await this.loadApplications();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load user settings and progress
            this.loadUserData();
            
            // Render initial view
            this.renderApplications();
            
            // Hide loading screen
            this.hideLoading();
            
            // Show welcome notification
            this.showNotification('Sistem başarıyla yüklendi!', 'success');
            
        } catch (error) {
            console.error('Application initialization failed:', error);
            this.showNotification('Sistem yüklenirken hata oluştu!', 'error');
            this.hideLoading();
        }
    }

    /**
     * Load applications data from JSON
     */
    async loadApplications() {
        try {
            // Use the embedded data from applications.json
            if (window.applicationsData) {
                this.applications = window.applicationsData.applications;
                this.systemInfo = window.applicationsData.system_info;
                this.globalSettings = window.applicationsData.global_settings;
                this.statistics = window.applicationsData.statistics;
                console.log(`Loaded ${this.applications.length} applications from embedded data`);
                return;
            }
            
            // Fallback to fetch if embedded data not available
            const response = await fetch('./data/applications.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.applications = data.applications;
            this.systemInfo = data.system_info;
            this.globalSettings = data.global_settings;
            this.statistics = data.statistics;
            
            console.log(`Loaded ${this.applications.length} applications successfully`);
            
        } catch (error) {
            console.error('Failed to load applications:', error);
            throw new Error('Applications data could not be loaded');
        }
    }

    /**
     * Setup event listeners for the application
     */
    setupEventListeners() {
        // Global search
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleGlobalSearch(e.target.value));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Before unload (save progress)
        window.addEventListener('beforeunload', () => this.saveUserData());
        
        // Theme change detection
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (this.settings.theme === 'auto') {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    /**
     * Render applications grid
     */
    renderApplications() {
        const container = document.getElementById('applications-grid');
        if (!container) return;

        container.innerHTML = '';
        
        this.applications.forEach(app => {
            const appCard = this.createApplicationCard(app);
            container.appendChild(appCard);
        });

        // Show application selection panel
        this.showPanel('app-selection');
        
        // Update statistics
        this.updateStatistics();
    }

    /**
     * Create application card element
     */
    createApplicationCard(app) {
        const card = document.createElement('div');
        card.className = 'application-card';
        card.style.background = app.gradient;
        card.setAttribute('data-app-id', app.id);
        
        // Calculate completion percentage
        const completedLessons = this.getUserProgress(app.id);
        const completionPercentage = Math.round((completedLessons / app.total_lessons) * 100);
        
        card.innerHTML = `
            <div class="card-header">
                <span class="app-icon">${app.icon}</span>
                <div class="app-info">
                    <h3 class="app-name">${app.name}</h3>
                    <span class="app-version">${app.version}</span>
                </div>
            </div>
            
            <div class="card-content">
                <p class="app-description">${app.description}</p>
                
                <div class="app-stats">
                    <div class="stat">
                        <span class="stat-label">Dersler:</span>
                        <span class="stat-value">${app.total_lessons}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Süre:</span>
                        <span class="stat-value">${app.estimated_time}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Seviye:</span>
                        <span class="stat-value">${app.difficulty}</span>
                    </div>
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${completionPercentage}%"></div>
                    </div>
                    <span class="progress-text">${completionPercentage}% Tamamlandı</span>
                </div>
             
				<div class="popular-topics">
                    <h4>Popüler Konular:</h4>
                    <div class="topic-tags">
                        ${app.popular_topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
                    </div>
                </div>
            </div>
            
            <div class="card-footer">
                <button class="btn btn-primary start-btn" onclick="app.selectApplication('${app.id}')">
                    Eğitime Başla
                </button>
                <a href="${app.microsoft_support}" target="_blank" class="btn btn-secondary support-btn">
                    📚 Microsoft Desteği
                </a>
            </div>
        `;
        
        // Add hover effects
        card.addEventListener('mouseenter', () => this.handleCardHover(card, true));
        card.addEventListener('mouseleave', () => this.handleCardHover(card, false));
        
        return card;
    }

    /**
     * Select and load application menus
     */
    async selectApplication(appId) {
        try {
            const selectedApp = this.applications.find(app => app.id === appId);
            if (!selectedApp) {
                throw new Error(`Application ${appId} not found`);
            }
            
         
            
			
			this.currentApp = selectedApp;
            
            // Update UI
            const iconElement = document.getElementById('current-app-icon');
            const nameElement = document.getElementById('current-app-name');
            const breadcrumbElement = document.getElementById('breadcrumb-app');
            
            // Icon - HTML içeriği varsa innerHTML, yoksa textContent kullan
            if (selectedApp.icon.includes('<')) {
                iconElement.innerHTML = selectedApp.icon;
            } else {
                iconElement.textContent = selectedApp.icon;
            }
            
            nameElement.textContent = selectedApp.name;
            breadcrumbElement.textContent = selectedApp.name;
			
            // Render menus
            this.renderMenus(selectedApp);
            
            // Show menu panel
            this.showPanel('menu-selection');
            
            // Track analytics
            this.trackEvent('application_selected', { app_id: appId });
            
        } catch (error) {
            console.error('Failed to select application:', error);
            this.showNotification('Uygulama yüklenirken hata oluştu!', 'error');
        }
    }

    /**
     * Render application menus
     */
    renderMenus(app) {
        const container = document.getElementById('menus-grid');
        if (!container) return;

        container.innerHTML = '';
        
        app.menus.forEach(menu => {
            const menuCard = this.createMenuCard(app, menu);
            container.appendChild(menuCard);
        });
    }

    /**
     * Create menu card element
     */
    createMenuCard(app, menu) {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.setAttribute('data-menu-id', menu.id);
        
        // Calculate menu progress
        const menuProgress = this.getMenuProgress(app.id, menu.id);
        const completionPercentage = Math.round((menuProgress.completed / menu.lesson_count) * 100);
        
        card.innerHTML = `
            <div class="menu-header">
                <span class="menu-icon">${menu.icon}</span>
                <h3 class="menu-name">${menu.name}</h3>
            </div>
            
            <div class="menu-content">
                <p class="menu-description">${menu.description}</p>
                
                <div class="menu-stats">
                    <div class="stat">
                        <span class="stat-icon">📚</span>
                        <span class="stat-text">${menu.lesson_count} Ders</span>
                    </div>
                    <div class="stat">
                        <span class="stat-icon">✅</span>
                        <span class="stat-text">${menuProgress.completed} Tamamlandı</span>
                    </div>
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar small">
                        <div class="progress-fill" style="width: ${completionPercentage}%"></div>
                    </div>
                    <span class="progress-text">${completionPercentage}%</span>
                </div>
            </div>
            
            <div class="menu-footer">
                <button class="btn btn-primary" onclick="app.selectMenu('${app.id}', '${menu.id}')">
                    ${completionPercentage > 0 ? 'Devam Et' : 'Başla'}
                </button>
            </div>
        `;
        
        return card;
    }

    /**
     * Select and load menu content
     */
    async selectMenu(appId, menuId) {
        try {
            this.showLoading();
            
            // Load menu content from JSON file
            const menuContent = await this.loadMenuContent(appId, menuId);
            
            this.currentMenu = {
                appId: appId,
                menuId: menuId,
                content: menuContent
            };
            
            // Update breadcrumb
            const menu = this.currentApp.menus.find(m => m.id === menuId);
            document.getElementById('breadcrumb-menu').textContent = menu.name;
            
            // Render content
            this.renderContent(menuContent);
            
            // Show content panel
            this.showPanel('content-panel');
            
            this.hideLoading();
            
            // Track analytics
            this.trackEvent('menu_selected', { app_id: appId, menu_id: menuId });
            
        } catch (error) {
            console.error('Failed to load menu content:', error);
            this.showNotification('İçerik yüklenirken hata oluştu!', 'error');
            this.hideLoading();
        }
    }

    /**
     * Load menu content from JSON file
     */
    async loadMenuContent(appId, menuId) {
        try {
            // First try to use embedded content
            if (window.menuContents && window.menuContents[`${appId}-${menuId}`]) {
                return window.menuContents[`${appId}-${menuId}`];
            }
            
            // Fallback to fetch
            const response = await fetch(`./data/${appId}/${menuId}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error(`Failed to load content for ${appId}/${menuId}:`, error);
            
            // Return default content if specific content not found
            return this.generateDefaultContent(appId, menuId);
        }
    }

    /**
     * Generate default content structure
     */
    generateDefaultContent(appId, menuId) {
        const appNames = {
            word: 'Microsoft Word',
            excel: 'Microsoft Excel',
            powerpoint: 'Microsoft PowerPoint',
            outlook: 'Microsoft Outlook',
            access: 'Microsoft Access'
        };

        const menuNames = {
            dosya: 'Dosya',
            giris: 'Giriş',
            ekle: 'Ekle',
            tasarim: 'Tasarım',
            duzen: 'Düzen',
            basvurular: 'Başvurular',
            postalar: 'Postalar',
            'gozden-gecir': 'Gözden Geçir',
            formul: 'Formüller',
            veri: 'Veri',
            gorunum: 'Görünüm',
            gelistirici: 'Geliştirici',
            gecisler: 'Geçişler',
            animasyonlar: 'Animasyonlar',
            'slayt-gosterisi': 'Slayt Gösterisi',
            'gonder-al': 'Gönder/Al',
            klasor: 'Klasör',
            takvim: 'Takvim',
            kisi: 'Kişiler',
            gorevler: 'Görevler',
            olustur: 'Oluştur',
            'dis-veri': 'Dış Veri',
            'veritabani-araclari': 'Veritabanı Araçları',
            'tablo-araclari': 'Tablo Araçları',
            'sorgu-araclari': 'Sorgu Araçları'
        };

        return {
            id: `${appId}-${menuId}`,
            title: `${appNames[appId] || appId} - ${menuNames[menuId] || menuId} Menüsü`,
            description: `${appNames[appId] || appId} uygulamasının ${menuNames[menuId] || menuId} menüsü eğitim içeriği`,
            difficulty: "Başlangıç",
            estimated_time: "1 saat",
            version: "Microsoft 365 / 2024",
            sections: [
                {
                    id: "default-section",
                    title: "Giriş",
                    order: 1,
                    content: {
                        type: "detailed",
                        introduction: "Bu bölümün içeriği yakında eklenecektir. Şu anda hazırlanma aşamasındadır.",
                        features: [
                            "Detaylı açıklamalar",
                            "Adım adım rehberler",
                            "Pratik alıştırmalar",
                            "İnteraktif öğeler"
                        ],
                        practice_exercise: {
                            title: "Örnek Alıştırma",
                            steps: [
                                "Bu menüyü keşfedin",
                                "Farklı seçenekleri deneyin",
                                "Klavye kısayollarını öğrenin"
                            ]
                        }
                    }
                }
            ],
            quiz: {
                title: "Bilgi Testi",
                questions: [
                    {
                        question: "Bu menü hangi uygulamaya aittir?",
                        options: [
                            appNames[appId] || appId,
                            "Microsoft Excel",
                            "Microsoft PowerPoint",
                            "Microsoft Outlook"
                        ],
                        correct: 0,
                        explanation: "Bu menü " + (appNames[appId] || appId) + " uygulamasına aittir."
                    }
                ]
            },
            resources: {
                microsoft_docs: "https://support.microsoft.com/tr-tr/office"
            },
            next_menu: {
                id: "next",
                name: "Sonraki Menü",
                description: "Bir sonraki menüye geçin"
            }
        };
    }

    /**
     * Render content in the display area
     */
    renderContent(content) {
        const displayArea = document.getElementById('content-display');
        const navigationArea = document.getElementById('content-navigation');
        
        if (!displayArea || !navigationArea) return;

        // Clear previous content
        displayArea.innerHTML = '';
        navigationArea.innerHTML = '';

        // Render navigation
        this.renderContentNavigation(content, navigationArea);
        
        // Render main content
        this.renderMainContent(content, displayArea);
    }

    /**
     * Render content navigation sidebar
     */
    renderContentNavigation(content, container) {
        if (!content.sections) return;

        const nav = document.createElement('ul');
        nav.className = 'content-nav-list';

        content.sections.forEach((section, index) => {
            const navItem = document.createElement('li');
            navItem.className = 'nav-item';
            
            const navLink = document.createElement('a');
            navLink.href = '#';
            navLink.className = 'nav-link';
            navLink.textContent = section.title;
            navLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToSection(index);
            });

            navItem.appendChild(navLink);
            nav.appendChild(navItem);
        });

        container.appendChild(nav);
    }

    /**
     * Scroll to specific section
     */
    scrollToSection(index) {
        const sectionElement = document.getElementById(`section-${index}`);
        if (sectionElement) {
            sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Render main content area
     */
    renderMainContent(content, container) {
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'content-wrapper';

        // Add title
        const title = document.createElement('h1');
        title.className = 'content-title';
        title.textContent = content.title || 'İçerik';
        contentWrapper.appendChild(title);

        // Add description
        if (content.description) {
            const description = document.createElement('p');
            description.className = 'content-description';
            description.textContent = content.description;
            contentWrapper.appendChild(description);
        }

        // Add metadata
        const metadata = document.createElement('div');
        metadata.className = 'content-metadata';
        metadata.innerHTML = `
            <div class="metadata-item">
                <strong>Zorluk:</strong> ${content.difficulty || 'Belirtilmemiş'}
            </div>
            <div class="metadata-item">
                <strong>Tahmini Süre:</strong> ${content.estimated_time || 'Belirtilmemiş'}
            </div>
            <div class="metadata-item">
                <strong>Versiyon:</strong> ${content.version || 'Belirtilmemiş'}
            </div>
        `;
        contentWrapper.appendChild(metadata);

        // Add sections
        if (content.sections) {
            content.sections.forEach((section, index) => {
                const sectionElement = this.createContentSection(section, index);
                contentWrapper.appendChild(sectionElement);
            });
        }

        // Add quiz if available
        if (content.quiz) {
            const quizSection = this.createQuizSection(content.quiz);
            contentWrapper.appendChild(quizSection);
        }

        // Add resources if available
        if (content.resources) {
            const resourcesSection = this.createResourcesSection(content.resources);
            contentWrapper.appendChild(resourcesSection);
        }

        // Add next menu navigation
        if (content.next_menu) {
            const nextMenuSection = this.createNextMenuSection(content.next_menu);
            contentWrapper.appendChild(nextMenuSection);
        }

        container.appendChild(contentWrapper);
    }

    /**
     * Create content section element
     */
    createContentSection(section, index) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'content-section';
        sectionDiv.id = `section-${index}`;

        // Section title
        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = section.title;
        sectionDiv.appendChild(title);

        // Section content
        if (section.content) {
            this.renderSectionContent(section.content, sectionDiv);
        }

        return sectionDiv;
    }

    /**
     * Render section content based on type
     */
renderSectionContent(content, container) {
    if (!content) return;
    
    // SimpleRenderer kullan
    if (typeof SimpleRenderer !== 'undefined') {
        const renderer = new SimpleRenderer();
        renderer.renderSectionContent(content, container);
    } else {
        console.error('SimpleRenderer yüklenemedi!');
    }
}


renderMediaSection(media, container) {
    const mediaSection = document.createElement('div');
    mediaSection.className = 'media-section';

    // Images Gallery
    if (media.images && media.images.length > 0) {
        const imagesDiv = document.createElement('div');
        imagesDiv.className = 'images-container';
        
        const gallery = document.createElement('div');
        gallery.className = 'image-gallery';
        
        media.images.forEach((image, index) => {
            const figure = document.createElement('figure');
            figure.className = 'content-image';
            
            figure.innerHTML = `
                <div class="image-wrapper">
                    <img src="${image.src}" 
                         alt="${image.alt}" 
                         loading="lazy"
                         onerror="this.src='images/placeholder.svg'">
                    <div class="image-overlay">
                        <button class="zoom-btn" onclick="app.openImageModal(${index}, ${JSON.stringify(media.images).replace(/"/g, '&quot;')})">
                            🔍 Büyüt
                        </button>
                    </div>
                </div>
                ${image.caption ? `<figcaption>${image.caption}</figcaption>` : ''}
            `;
            
            gallery.appendChild(figure);
        });
        
        imagesDiv.appendChild(gallery);
        mediaSection.appendChild(imagesDiv);
    }

    // External Resources
    if (media.external_resources && media.external_resources.length > 0) {
        const resourcesDiv = document.createElement('div');
        resourcesDiv.className = 'external-resources';
        
        const header = document.createElement('h3');
        header.className = 'resources-header';
        header.innerHTML = '<span class="resources-icon">🌐</span> Ek Kaynaklar';
        resourcesDiv.appendChild(header);
        
        media.external_resources.forEach(resource => {
            const resourceCard = document.createElement('div');
            resourceCard.className = `resource-card resource-${resource.type}`;
            
            resourceCard.innerHTML = `
                <div class="resource-icon">${resource.icon || '📄'}</div>
                <div class="resource-content">
                    <h4 class="resource-title">${resource.title}</h4>
                    <p class="resource-description">${resource.description}</p>
                    ${resource.duration ? `<span class="resource-duration">⏱️ ${resource.duration}</span>` : ''}
                </div>
                <a href="${resource.url}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="resource-link">
                    ${resource.type === 'video' ? '▶️ İzle' : '📖 Oku'}
                </a>
            `;
            
            resourcesDiv.appendChild(resourceCard);
        });
        
        mediaSection.appendChild(resourcesDiv);
    }

    container.appendChild(mediaSection);
}

openImageModal(index, images) {
    const modal = document.createElement('div');
    modal.className = 'image-modal active';
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content-image">
            <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
            <button class="modal-prev" onclick="app.changeModalImage(${index - 1}, ${JSON.stringify(images).replace(/"/g, '&quot;')})">‹</button>
            <button class="modal-next" onclick="app.changeModalImage(${index + 1}, ${JSON.stringify(images).replace(/"/g, '&quot;')})">›</button>
            <img src="${images[index].src}" 
                 alt="${images[index].alt}"
                 class="modal-image">
            <p class="modal-caption">${images[index].caption || ''}</p>
            <div class="modal-counter">${index + 1} / ${images.length}</div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Keyboard navigation
    document.addEventListener('keydown', function handleKeydown(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleKeydown);
        } else if (e.key === 'ArrowLeft' && index > 0) {
            app.changeModalImage(index - 1, images);
        } else if (e.key === 'ArrowRight' && index < images.length - 1) {
            app.changeModalImage(index + 1, images);
        }
    });
}

changeModalImage(newIndex, images) {
    if (newIndex < 0 || newIndex >= images.length) return;
    
    const existingModal = document.querySelector('.image-modal');
    if (existingModal) existingModal.remove();
    
    this.openImageModal(newIndex, images);
}
    /** Create quiz section
     */
    createQuizSection(quiz) {
        const quizDiv = document.createElement('div');
        quizDiv.className = 'quiz-section';
        
        const quizTitle = document.createElement('h2');
        quizTitle.textContent = quiz.title || 'Bilgi Testi';
        quizDiv.appendChild(quizTitle);
        
        if (quiz.questions && Array.isArray(quiz.questions)) {
            quiz.questions.forEach((question, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'quiz-question';
                
                const questionText = document.createElement('h3');
                questionText.textContent = `${index + 1}. ${question.question}`;
                questionDiv.appendChild(questionText);
                
                if (question.options && Array.isArray(question.options)) {
                    const optionsList = document.createElement('ul');
                    optionsList.className = 'quiz-options';
                    
                    question.options.forEach((option, optionIndex) => {
                        const li = document.createElement('li');
                        li.textContent = option;
                        optionsList.appendChild(li);
                    });
                    
                    questionDiv.appendChild(optionsList);
                }
                
                if (question.explanation) {
                    const explanation = document.createElement('p');
                    explanation.className = 'quiz-explanation';
                    explanation.textContent = `Doğru cevap: ${question.options[question.correct]}. ${question.explanation}`;
                    questionDiv.appendChild(explanation);
                }
                
                quizDiv.appendChild(questionDiv);
            });
        }
        
        return quizDiv;
    }

    /**
     * Create resources section
     */
    createResourcesSection(resources) {
        const resourcesDiv = document.createElement('div');
        resourcesDiv.className = 'resources-section';
        
        const resourcesTitle = document.createElement('h2');
        resourcesTitle.textContent = 'Kaynaklar';
        resourcesDiv.appendChild(resourcesTitle);
        
        const resourcesList = document.createElement('ul');
        resourcesList.className = 'resources-list';
        
        if (resources.microsoft_docs) {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${resources.microsoft_docs}" target="_blank">Microsoft Resmi Dökümantasyonu</a>`;
            resourcesList.appendChild(li);
        }
        
        if (resources.video_tutorials && Array.isArray(resources.video_tutorials)) {
            resources.video_tutorials.forEach(tutorial => {
                const li = document.createElement('li');
                li.textContent = tutorial;
                resourcesList.appendChild(li);
            });
        }
        
        resourcesDiv.appendChild(resourcesList);
        return resourcesDiv;
    }

    /**
     * Create next menu section
     */
    createNextMenuSection(nextMenu) {
        const nextDiv = document.createElement('div');
        nextDiv.className = 'next-menu-section';
        
        const nextTitle = document.createElement('h2');
        nextTitle.textContent = 'Sonraki Adım';
        nextDiv.appendChild(nextTitle);
        
        const nextDescription = document.createElement('p');
        nextDescription.textContent = nextMenu.description || 'Bir sonraki menüye geçerek eğitime devam edin.';
        nextDiv.appendChild(nextDescription);
        
        const nextButton = document.createElement('button');
        nextButton.className = 'btn btn-primary';
        nextButton.textContent = `Sonraki: ${nextMenu.name}`;
        nextButton.addEventListener('click', () => {
            if (nextMenu.id && nextMenu.id !== 'next') {
                this.selectMenu(this.currentApp.id, nextMenu.id);
            }
        });
        nextDiv.appendChild(nextButton);
        
        return nextDiv;
    }

    /**
     * Show/hide panels
     */
    showPanel(panelId) {
        // Hide all panels
        const panels = ['app-selection', 'menu-selection', 'content-panel'];
        panels.forEach(id => {
            const panel = document.getElementById(id);
            if (panel) {
                panel.style.display = 'none';
            }
        });

        // Show selected panel
        const selectedPanel = document.getElementById(panelId);
        if (selectedPanel) {
            selectedPanel.style.display = 'block';
        }
    }

    /**
     * Navigation methods
     */
    showApplications() {
        this.currentApp = null;
        this.currentMenu = null;
        this.showPanel('app-selection');
    }

    showMenus() {
        if (this.currentApp) {
            this.showPanel('menu-selection');
        } else {
            this.showApplications();
        }
    }

    /**
     * Loading screen methods
     */
    showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    /**
     * Notification system
     */
    showNotification(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notifications');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }

    /**
     * User data management
     */
    loadUserData() {
        // Load from localStorage
        const savedProgress = localStorage.getItem('office-education-progress');
        const savedSettings = localStorage.getItem('office-education-settings');

        if (savedProgress) {
            try {
                this.userProgress = JSON.parse(savedProgress);
            } catch (error) {
                console.error('Failed to load user progress:', error);
            }
        }

        if (savedSettings) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
                this.applySettings();
            } catch (error) {
                console.error('Failed to load user settings:', error);
            }
        }
    }

    saveUserData() {
        try {
            localStorage.setItem('office-education-progress', JSON.stringify(this.userProgress));
            localStorage.setItem('office-education-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save user data:', error);
        }
    }

    /**
     * Progress tracking
     */
    getUserProgress(appId) {
        return this.userProgress[appId] || 0;
    }

    getMenuProgress(appId, menuId) {
        const appProgress = this.userProgress[`${appId}_menus`] || {};
        return appProgress[menuId] || { completed: 0, total: 0 };
    }

    /**
     * Utility methods
     */
    trackEvent(eventName, data = {}) {
        // Analytics tracking would go here
        console.log('Event tracked:', eventName, data);
    }

    updateStatistics() {
        // Update footer statistics
        const totalLessonsEl = document.getElementById('total-lessons');
        const completedLessonsEl = document.getElementById('completed-lessons');
        
        if (totalLessonsEl && this.statistics) {
            totalLessonsEl.textContent = this.statistics.total_lessons;
        }
        
        if (completedLessonsEl) {
            const totalCompleted = Object.values(this.userProgress).reduce((sum, val) => sum + val, 0);
            completedLessonsEl.textContent = totalCompleted;
        }
    }

    /**
     * Event handlers
     */
    handleKeyboardShortcuts(event) {
        // Ctrl+F for search
        if (event.ctrlKey && event.key === 'f') {
            event.preventDefault();
            const searchInput = document.getElementById('global-search');
            if (searchInput) {
                searchInput.focus();
            }
        }

        // Escape to close modals
        if (event.key === 'Escape') {
            this.closeAllModals();
        }

        // F11 for fullscreen
        if (event.key === 'F11') {
            event.preventDefault();
            this.toggleFullscreen();
        }
    }

    handleGlobalSearch(query) {
        if (query.length < 2) return;
        
        // Implement search logic
        console.log('Searching for:', query);
    }

    handleCardHover(card, isEntering) {
        if (isEntering) {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
        } else {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        }
    }

    handleResize() {
        // Handle responsive adjustments
        console.log('Window resized');
    }

    /**
     * Modal management
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    /**
     * Settings management
     */
    applySettings() {
        this.applyTheme(this.settings.theme);
        // Apply other settings
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        this.settings.theme = theme;
    }

    /**
     * Fullscreen toggle
     */
    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    }
}

// Global functions for HTML onclick events
let app;

function initializeApp() {
    app = new OfficeEducationApp();
    
    // Make app globally accessible for HTML events
    window.app = app;
}

// Modal functions
function showProgressModal() {
    document.getElementById('progress-modal').style.display = 'block';
}

function showSettingsModal() {
    document.getElementById('settings-modal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showHelp() {
    document.getElementById('help-modal').style.display = 'block';
}

function showAbout() {
    app.showNotification('Office Eğitim Sistemi v2.0 - 2024', 'info', 5000);
}

function showKeyboardShortcuts() {
    // Implementation for keyboard shortcuts modal
    console.log('Show keyboard shortcuts');
}

// Navigation functions
function showApplications() {
    if (app) {
        app.showApplications();
    }
}

function showMenus() {
    if (app) {
        app.showMenus();
    }
}

// Settings functions
function clearProgress() {
    if (confirm('Tüm ilerleme kaydedilecek. Emin misiniz?')) {
        localStorage.removeItem('office-education-progress');
        app.userProgress = {};
        app.showNotification('İlerleme başarıyla sıfırlandı!', 'success');
        app.renderApplications();
    }
}

function exportProgress() {
    const progressData = JSON.stringify(app.userProgress, null, 2);
    const blob = new Blob([progressData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'office-education-progress.json';
    a.click();
    
    URL.revokeObjectURL(url);
    app.showNotification('İlerleme başarıyla dışa aktarıldı!', 'success');
}

// UI helper functions
function toggleSidebar() {
    const sidebar = document.getElementById('content-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

function toggleFullscreen() {
    if (app) {
        app.toggleFullscreen();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OfficeEducationApp, initializeApp };
}