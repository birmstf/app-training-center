/**
 * Office Eğitim Sistemi - UI Bileşenleri
 * Dinamik UI elementleri ve interaktif bileşenler
 */

class UIComponents {
    constructor() {
        this.activeTooltips = [];
        this.activeModals = [];
        this.activeAccordions = [];
        this.activeTabs = [];
    }

    /**
     * Create interactive demo component
     */
    createInteractiveDemo(data) {
        const demo = document.createElement('div');
        demo.className = 'interactive-demo';
        
        demo.innerHTML = `
            <div class="demo-title">${data.title}</div>
            <div class="demo-description">${data.description}</div>
            <button class="demo-button" onclick="uiComponents.runDemo('${data.id}')">
                ${data.buttonText || 'Demoyu Başlat'}
            </button>
        `;
        
        return demo;
    }

    /**
     * Create step-by-step guide
     */
    createStepGuide(steps) {
        const guide = document.createElement('div');
        guide.className = 'step-guide';
        
        steps.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'step-item';
            
            stepElement.innerHTML = `
                <div class="step-number">${index + 1}</div>
                <div class="step-content">
                    <h4 class="step-title">${step.title}</h4>
                    <p class="step-description">${step.description}</p>
                    ${step.menu ? `<span class="menu-path">${step.menu}</span>` : ''}
                    ${step.tip ? `<div class="tip-box">${step.tip}</div>` : ''}
                </div>
            `;
            
            guide.appendChild(stepElement);
        });
        
        return guide;
    }

    /**
     * Create tabbed content
     */
    createTabs(tabsData) {
        const container = document.createElement('div');
        container.className = 'tab-container';
        const tabId = `tabs-${Date.now()}`;
        
        // Create tab buttons
        const tabList = document.createElement('div');
        tabList.className = 'tab-list';
        
        tabsData.forEach((tab, index) => {
            const button = document.createElement('button');
            button.className = `tab-button ${index === 0 ? 'active' : ''}`;
            button.textContent = tab.title;
            button.onclick = () => this.switchTab(tabId, index);
            tabList.appendChild(button);
        });
        
        container.appendChild(tabList);
        
        // Create tab contents
        tabsData.forEach((tab, index) => {
            const content = document.createElement('div');
            content.className = `tab-content ${index === 0 ? 'active' : ''}`;
            content.innerHTML = tab.content;
            content.setAttribute('data-tab-index', index);
            container.appendChild(content);
        });
        
        container.id = tabId;
        this.activeTabs.push(tabId);
        
        return container;
    }

    /**
     * Switch tab
     */
    switchTab(containerId, index) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Update buttons
        const buttons = container.querySelectorAll('.tab-button');
        buttons.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
        
        // Update contents
        const contents = container.querySelectorAll('.tab-content');
        contents.forEach((content, i) => {
            content.classList.toggle('active', i === index);
        });
    }

    /**
     * Create accordion
     */
    createAccordion(items) {
        const accordion = document.createElement('div');
        accordion.className = 'accordion';
        const accordionId = `accordion-${Date.now()}`;
        accordion.id = accordionId;
        
        items.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'accordion-item';
            
            const header = document.createElement('div');
            header.className = 'accordion-header';
            header.innerHTML = `
                <h4 class="accordion-title">${item.title}</h4>
                <span class="accordion-icon">▼</span>
            `;
            header.onclick = () => this.toggleAccordion(accordionId, index);
            
            const content = document.createElement('div');
            content.className = 'accordion-content';
            content.innerHTML = item.content;
            
            itemElement.appendChild(header);
            itemElement.appendChild(content);
            accordion.appendChild(itemElement);
        });
        
        this.activeAccordions.push(accordionId);
        return accordion;
    }

    /**
     * Toggle accordion item
     */
    toggleAccordion(accordionId, index) {
        const accordion = document.getElementById(accordionId);
        if (!accordion) return;
        
        const items = accordion.querySelectorAll('.accordion-item');
        const header = items[index].querySelector('.accordion-header');
        const content = items[index].querySelector('.accordion-content');
        
        // Toggle current item
        header.classList.toggle('active');
        content.classList.toggle('active');
        
        // Close other items
        items.forEach((item, i) => {
            if (i !== index) {
                item.querySelector('.accordion-header').classList.remove('active');
                item.querySelector('.accordion-content').classList.remove('active');
            }
        });
    }

    /**
     * Create progress chart
     */
    createProgressChart(data) {
        const chart = document.createElement('div');
        chart.className = 'progress-chart';
        
        const totalCompleted = data.reduce((sum, item) => sum + item.completed, 0);
        const totalLessons = data.reduce((sum, item) => sum + item.total, 0);
        const overallPercentage = Math.round((totalCompleted / totalLessons) * 100);
        
        chart.innerHTML = `
            <div class="chart-header">
                <h3>Genel İlerleme: ${overallPercentage}%</h3>
                <div class="progress-bar large">
                    <div class="progress-fill" style="width: ${overallPercentage}%"></div>
                </div>
            </div>
            <div class="chart-items">
                ${data.map(item => `
                    <div class="chart-item">
                        <div class="item-header">
                            <span class="item-icon">${item.icon}</span>
                            <span class="item-name">${item.name}</span>
                            <span class="item-percentage">${Math.round((item.completed / item.total) * 100)}%</span>
                        </div>
                        <div class="progress-bar small">
                            <div class="progress-fill" style="width: ${Math.round((item.completed / item.total) * 100)}%"></div>
                        </div>
                        <div class="item-stats">
                            <span>${item.completed} / ${item.total} ders tamamlandı</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        return chart;
    }

    /**
     * Create tooltip
     */
    createTooltip(element, text, position = 'top') {
        const tooltip = document.createElement('div');
        tooltip.className = `tooltip tooltip-${position}`;
        tooltip.textContent = text;
        
        element.addEventListener('mouseenter', () => {
            document.body.appendChild(tooltip);
            this.positionTooltip(element, tooltip, position);
        });
        
        element.addEventListener('mouseleave', () => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        });
    }

    /**
     * Position tooltip
     */
    positionTooltip(element, tooltip, position) {
        const rect = element.getBoundingClientRect();
        
        switch(position) {
            case 'top':
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.top = `${rect.top - 5}px`;
                break;
            case 'bottom':
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.top = `${rect.bottom + 5}px`;
                break;
            case 'left':
                tooltip.style.left = `${rect.left - 5}px`;
                tooltip.style.top = `${rect.top + rect.height / 2}px`;
                break;
            case 'right':
                tooltip.style.left = `${rect.right + 5}px`;
                tooltip.style.top = `${rect.top + rect.height / 2}px`;
                break;
        }
    }

    /**
     * Create code block with syntax highlighting
     */
    createCodeBlock(code, language = 'javascript') {
        const block = document.createElement('div');
        block.className = 'code-block';
        block.setAttribute('data-language', language);
        
        // Simple syntax highlighting
        let highlightedCode = code
            .replace(/`([^`]+)`/g, '<span class="code-string">$1</span>')
            .replace(/\b(function|const|let|var|return|if|else|for|while)\b/g, '<span class="code-keyword">$1</span>')
            .replace(/\/\/.*$/gm, '<span class="code-comment">$&</span>')
            .replace(/\d+/g, '<span class="code-number">$&</span>');
        
        block.innerHTML = `<pre><code>${highlightedCode}</code></pre>`;
        
        // Add copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-btn';
        copyButton.textContent = 'Kopyala';
        copyButton.onclick = () => this.copyToClipboard(code, copyButton);
        block.appendChild(copyButton);
        
        return block;
    }

    /**
     * Copy to clipboard
     */
    copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Kopyalandı!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }

    /**
     * Create image gallery
     */
    createImageGallery(images) {
        const gallery = document.createElement('div');
        gallery.className = 'image-gallery';
        
        images.forEach((image, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `
                <img src="${image.src}" alt="${image.alt}" onclick="uiComponents.openLightbox('${image.src}', '${image.caption}')">
                <div class="gallery-caption">${image.caption}</div>
            `;
            gallery.appendChild(item);
        });
        
        return gallery;
    }

    /**
     * Open lightbox
     */
    openLightbox(src, caption) {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <span class="lightbox-close" onclick="this.parentElement.parentElement.remove()">×</span>
                <img src="${src}" alt="${caption}">
                <div class="lightbox-caption">${caption}</div>
            </div>
        `;
        
        lightbox.onclick = (e) => {
            if (e.target === lightbox) {
                lightbox.remove();
            }
        };
        
        document.body.appendChild(lightbox);
    }

    /**
     * Create video player
     */
    createVideoPlayer(videoData) {
        const player = document.createElement('div');
        player.className = 'video-player';
        
        if (videoData.type === 'youtube') {
            player.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${videoData.id}" 
                    frameborder="0" 
                    allowfullscreen>
                </iframe>
            `;
        } else {
            player.innerHTML = `
                <video controls>
                    <source src="${videoData.src}" type="video/mp4">
                    Tarayıcınız video etiketini desteklemiyor.
                </video>
            `;
        }
        
        return player;
    }

    /**
     * Create quiz component
     */
    createQuiz(quizData) {
        const quiz = document.createElement('div');
        quiz.className = 'quiz-container';
        const quizId = `quiz-${Date.now()}`;
        
        quiz.innerHTML = `
            <div class="quiz-header">
                <h3>${quizData.title}</h3>
                <span class="quiz-score" id="${quizId}-score">Puan: 0</span>
            </div>
            <div class="quiz-questions">
                ${quizData.questions.map((q, i) => `
                    <div class="quiz-question" data-question="${i}">
                        <h4>${i + 1}. ${q.question}</h4>
                        <div class="quiz-options">
                            ${q.options.map((opt, j) => `
                                <label class="quiz-option">
                                    <input type="radio" name="${quizId}-q${i}" value="${j}">
                                    <span>${opt}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-primary" onclick="uiComponents.checkQuiz('${quizId}', ${JSON.stringify(quizData).replace(/"/g, '&quot;')})">
                Kontrol Et
            </button>
        `;
        
        return quiz;
    }

    /**
     * Check quiz answers
     */
    checkQuiz(quizId, quizData) {
        let score = 0;
        const totalQuestions = quizData.questions.length;
        
        quizData.questions.forEach((q, i) => {
            const selected = document.querySelector(`input[name="${quizId}-q${i}"]:checked`);
            if (selected && parseInt(selected.value) === q.correct) {
                score++;
            }
        });
        
        const scoreElement = document.getElementById(`${quizId}-score`);
        scoreElement.textContent = `Puan: ${score}/${totalQuestions}`;
        
        // Show feedback
        const percentage = (score / totalQuestions) * 100;
        let message = '';
        if (percentage === 100) {
            message = 'Mükemmel! Tüm soruları doğru yanıtladınız!';
        } else if (percentage >= 80) {
            message = 'Çok iyi! Harika bir performans!';
        } else if (percentage >= 60) {
            message = 'İyi! Konuyu tekrar gözden geçirebilirsiniz.';
        } else {
            message = 'Tekrar deneyin. Pratik yaparak gelişebilirsiniz!';
        }
        
        if (app) {
            app.showNotification(message, percentage >= 60 ? 'success' : 'warning', 5000);
        }
    }

    /**
     * Run interactive demo
     */
    runDemo(demoId) {
        console.log('Running demo:', demoId);
        // Demo implementation would go here
        if (app) {
            app.showNotification('Demo başlatılıyor...', 'info');
        }
    }

    /**
     * Create search results display
     */
    createSearchResults(results) {
        const container = document.createElement('div');
        container.className = 'search-results';
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <div class="empty-state-title">Sonuç Bulunamadı</div>
                    <div class="empty-state-description">
                        Aramanızla eşleşen içerik bulunamadı. Farklı kelimeler deneyin.
                    </div>
                </div>
            `;
        } else {
            results.forEach(result => {
                const item = document.createElement('div');
                item.className = 'search-result';
                item.innerHTML = `
                    <h3 class="search-result-title">${result.title}</h3>
                    <p class="search-result-snippet">${this.highlightText(result.snippet, result.query)}</p>
                    <div class="search-result-meta">
                        <span>${result.app}</span>
                        <span>${result.menu}</span>
                    </div>
                `;
                item.onclick = () => {
                    if (app) {
                        app.selectMenu(result.appId, result.menuId);
                    }
                };
                container.appendChild(item);
            });
        }
        
        return container;
    }

    /**
     * Highlight search text
     */
    highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    /**
     * Create breadcrumb trail
     */
    createBreadcrumb(items) {
        const breadcrumb = document.createElement('nav');
        breadcrumb.className = 'breadcrumb';
        
        items.forEach((item, index) => {
            const span = document.createElement('span');
            span.className = 'breadcrumb-item';
            if (index === items.length - 1) {
                span.classList.add('active');
            }
            span.textContent = item.text;
            if (item.onclick) {
                span.onclick = item.onclick;
            }
            
            breadcrumb.appendChild(span);
            
            if (index < items.length - 1) {
                const separator = document.createElement('span');
                separator.className = 'breadcrumb-separator';
                separator.textContent = '>';
                breadcrumb.appendChild(separator);
            }
        });
        
        return breadcrumb;
    }
}

// Initialize UI Components
const uiComponents = new UIComponents();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIComponents;
}