/**
 * Simple Renderer - Konfigürasyon Tabanlı İçerik Render Sistemi
 * js/simple-renderer.js
 */

class SimpleRenderer {
    constructor(config = window.RENDER_CONFIG) {
        this.config = config;
    }

    /**
     * Ana render metodu
     */
    renderSectionContent(content, container) {
        if (!content) return;

        Object.keys(content).forEach(key => {
            // Meta alanları atla
            if (['type', 'id', 'order'].includes(key)) return;
            
            const value = content[key];
            const componentType = this.getComponentType(key);
            
            if (componentType && this[`render_${componentType}`]) {
                this[`render_${componentType}`](key, value, container);
            } else {
                // Fallback: otomatik render
                this.autoRender(key, value, container);
            }
        });
    }

    /**
     * Field'a göre component türünü belirle
     */
    getComponentType(fieldName) {
        const renderers = this.config.fieldRenderers;
        
        // Direkt eşleşme
        if (renderers[fieldName]) {
            return renderers[fieldName];
        }
        
        // Pattern eşleşmesi (wildcard)
        for (const [pattern, componentType] of Object.entries(renderers)) {
            if (pattern.startsWith('*_')) {
                const suffix = pattern.substring(1);
                if (fieldName.endsWith(suffix)) {
                    return componentType;
                }
            }
        }
        
        return null;
    }

    /**
     * Introduction renderer
     */
    render_introduction(key, value, container) {
        const intro = document.createElement('p');
        intro.className = 'content-intro';
        intro.textContent = value;
        container.appendChild(intro);
    }

    /**
     * Function list renderer
     */
    render_function_list(key, functions, container) {
        if (!Array.isArray(functions)) return;
        
        const fieldConfig = this.config.fieldConfig[key] || {};
        const styleConfig = this.config.componentStyles['function_list'];
        
        const section = document.createElement('div');
        section.className = `data-section ${styleConfig.className}`;
        section.style.background = styleConfig.gradient;
        
        const title = fieldConfig.title || this.formatTitle(key);
        const icon = fieldConfig.icon || styleConfig.icon;
        section.innerHTML = `<h3>${icon} ${title}</h3>`;
        
        functions.forEach(func => {
            const card = this.createFunctionCard(func);
            section.appendChild(card);
        });
        
        container.appendChild(section);
    }

    /**
     * Card list renderer (margins, types, presets, vb.)
     */
    render_card_list(key, items, container) {
        if (!Array.isArray(items)) return;
        
        const fieldConfig = this.config.fieldConfig[key] || {};
        const styleConfig = this.config.componentStyles['card_list'];
        
        const section = document.createElement('div');
        section.className = `data-section ${styleConfig.className}`;
        section.style.background = styleConfig.gradient;
        
        const title = fieldConfig.title || this.formatTitle(key);
        const icon = fieldConfig.icon || styleConfig.icon;
        section.innerHTML = `<h3>${icon} ${title}</h3>`;
        
        const grid = document.createElement('div');
        grid.className = 'card-grid';
        
        items.forEach(item => {
            const card = this.createGenericCard(item);
            grid.appendChild(card);
        });
        
        section.appendChild(grid);
        container.appendChild(section);
    }

    /**
     * Example list renderer
     */
    render_example_list(key, examples, container) {
        if (!Array.isArray(examples)) return;
        
        const styleConfig = this.config.componentStyles['example_list'];
        
        const section = document.createElement('div');
        section.className = `data-section ${styleConfig.className}`;
        section.style.background = styleConfig.gradient;
        section.innerHTML = `<h3>${styleConfig.icon} ${this.formatTitle(key)}</h3>`;
        
        examples.forEach(ex => {
            const card = document.createElement('div');
            card.className = 'example-card';
            card.innerHTML = `
                <h4>📌 ${ex.scenario || ex.title || ex.name}</h4>
                ${ex.formula ? `<div class="formula-display"><code>${ex.formula}</code></div>` : ''}
                ${ex.description ? `<p class="example-description">${ex.description}</p>` : ''}
                ${ex.steps ? `<ol>${ex.steps.map(s => `<li>${s}</li>`).join('')}</ol>` : ''}
            `;
            section.appendChild(card);
        });
        
        container.appendChild(section);
    }

    /**
     * Tips renderer
     */
    render_tips(key, tips, container) {
        if (!Array.isArray(tips)) return;
        
        const styleConfig = this.config.componentStyles['tips'];
        
        const section = document.createElement('div');
        section.className = `data-section ${styleConfig.className}`;
        section.style.background = styleConfig.gradient;
        section.innerHTML = `
            <h3 style="color: white;">${styleConfig.icon} ${this.formatTitle(key)}</h3>
            <ul class="tips-list">
                ${tips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
        `;
        
        container.appendChild(section);
    }

    /**
     * Key-value section renderer - İç içe objeler için geliştirilmiş
     */
    render_key_value_section(key, obj, container) {
        if (typeof obj !== 'object') return;
        
        const styleConfig = this.config.componentStyles['key_value_section'];
        
        const section = document.createElement('div');
        section.className = `data-section ${styleConfig.className}`;
        section.style.background = styleConfig.gradient;
        section.innerHTML = `<h3 style="color: white;">${styleConfig.icon} ${this.formatTitle(key)}</h3>`;
        
        const content = document.createElement('div');
        content.className = 'key-value-content';
        
        Object.keys(obj).forEach(k => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category-card';
            
            // Başlık
            const categoryTitle = document.createElement('h4');
            categoryTitle.textContent = this.formatTitle(k);
            categoryDiv.appendChild(categoryTitle);
            
            const value = obj[k];
            
            // İç içe obje - nested rendering
            if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                const nestedContainer = document.createElement('div');
                nestedContainer.className = 'nested-object';
                
                Object.keys(value).forEach(nestedKey => {
                    const nestedValue = value[nestedKey];
                    const nestedItem = document.createElement('div');
                    nestedItem.className = 'nested-item';
                    
                    const nestedLabel = document.createElement('strong');
                    nestedLabel.className = 'nested-label';
                    nestedLabel.textContent = this.formatTitle(nestedKey) + ':';
                    nestedItem.appendChild(nestedLabel);
                    
                    const nestedContent = document.createElement('span');
                    nestedContent.className = 'nested-value';
                    
                    // İç içe değer de obje ise
                    if (typeof nestedValue === 'object' && !Array.isArray(nestedValue) && nestedValue !== null) {
                        const deepList = document.createElement('div');
                        deepList.className = 'deep-nested';
                        Object.keys(nestedValue).forEach(deepKey => {
                            const deepItem = document.createElement('div');
                            deepItem.innerHTML = `<code>${this.formatTitle(deepKey)}:</code> ${nestedValue[deepKey]}`;
                            deepList.appendChild(deepItem);
                        });
                        nestedContent.appendChild(deepList);
                    } else if (Array.isArray(nestedValue)) {
                        nestedContent.innerHTML = nestedValue.join(', ');
                    } else {
                        nestedContent.textContent = nestedValue;
                    }
                    
                    nestedItem.appendChild(nestedContent);
                    nestedContainer.appendChild(nestedItem);
                });
                
                categoryDiv.appendChild(nestedContainer);
            } 
            // Array
            else if (Array.isArray(value)) {
                const ul = document.createElement('ul');
                ul.className = 'value-list';
                value.forEach(item => {
                    const li = document.createElement('li');
                    if (typeof item === 'object') {
                        // Array içinde obje varsa
                        li.innerHTML = Object.keys(item)
                            .map(k => `<strong>${this.formatTitle(k)}:</strong> ${item[k]}`)
                            .join(', ');
                    } else {
                        li.textContent = item;
                    }
                    ul.appendChild(li);
                });
                categoryDiv.appendChild(ul);
            } 
            // Basit string/number
            else {
                const p = document.createElement('p');
                p.className = 'simple-value';
                p.textContent = value;
                categoryDiv.appendChild(p);
            }
            
            content.appendChild(categoryDiv);
        });
        
        section.appendChild(content);
        container.appendChild(section);
    }

    /**
     * Media renderer
     */
    render_media(key, media, container) {
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

    /**
     * Practice renderer
     */
    render_practice(key, practice, container) {
        const section = document.createElement('div');
        section.className = 'practice-exercise';
        section.innerHTML = `
            <div class="practice-header">
                <span class="practice-icon">✏️</span>
                <h3>${practice.title || 'Pratik Alıştırma'}</h3>
            </div>
            ${practice.steps ? `
                <ol class="practice-steps">
                    ${practice.steps.map(step => `<li>${step}</li>`).join('')}
                </ol>
            ` : ''}
        `;
        container.appendChild(section);
    }

    /**
     * Button grid renderer - Klavye kısayolları ve düğmeler için
     */
    render_button_grid(key, buttons, container) {
        if (!Array.isArray(buttons)) return;
        
        const styleConfig = this.config.componentStyles['button_grid'];
        
        const section = document.createElement('div');
        section.className = `data-section ${styleConfig.className}`;
        section.style.background = styleConfig.gradient;
        section.innerHTML = `<h3>${styleConfig.icon} ${this.formatTitle(key)}</h3>`;
        
        const grid = document.createElement('div');
        grid.className = 'button-showcase-grid';
        
        buttons.forEach(btn => {
            const buttonCard = document.createElement('div');
            buttonCard.className = 'button-showcase-card';
            
            buttonCard.innerHTML = `
                <div class="button-icon">${btn.icon || '⬜'}</div>
                <div class="button-info">
                    <h4 class="button-name">${btn.name || btn.title}</h4>
                    ${btn.shortcut ? `<kbd class="button-shortcut">${btn.shortcut}</kbd>` : ''}
                    ${btn.description ? `<p class="button-desc">${btn.description}</p>` : ''}
                    ${btn.menu ? `<span class="button-menu">📍 ${btn.menu}</span>` : ''}
                </div>
            `;
            
            grid.appendChild(buttonCard);
        });
        
        section.appendChild(grid);
        container.appendChild(section);
    }

    /**
     * Visual guide renderer
     */
    render_visual(key, visual, container) {
        const section = document.createElement('div');
        section.className = 'visual-section';
        section.innerHTML = `
            <h3>🎨 Görsel Rehber</h3>
            <div class="visual-container">
                <img src="${visual.image_url}" alt="${visual.type}" class="visual-diagram">
            </div>
        `;
        container.appendChild(section);
    }

    /**
     * Otomatik render (bilinmeyen field'lar için)
     */
    autoRender(key, value, container) {
        if (Array.isArray(value) && value.length > 0) {
            if (typeof value[0] === 'string') {
                // String listesi
                this.render_tips(key, value, container);
            } else if (typeof value[0] === 'object') {
                // Object listesi - buttons gibi özel array'ler için kontrol
                if (key.toLowerCase().includes('button')) {
                    this.render_button_grid(key, value, container);
                } else {
                    this.render_card_list(key, value, container);
                }
            }
        } else if (typeof value === 'object' && value !== null) {
            // Object içinde buttons array'i var mı kontrol et
            if (value.buttons && Array.isArray(value.buttons)) {
                // Önce başlık
                if (value.name || value.title) {
                    const heading = document.createElement('h4');
                    heading.className = 'subsection-title';
                    heading.textContent = value.name || value.title;
                    container.appendChild(heading);
                }
                // Sonra buttons'ı render et
                this.render_button_grid('buttons', value.buttons, container);
            } else {
                // Normal key-value object
                this.render_key_value_section(key, value, container);
            }
        } else if (typeof value === 'string') {
            // Basit string
            const p = document.createElement('p');
            p.innerHTML = `<strong>${this.formatTitle(key)}:</strong> ${value}`;
            container.appendChild(p);
        }
    }

    /**
     * Yardımcı: Function card oluştur
     */
    createFunctionCard(func) {
        const card = document.createElement('div');
        card.className = 'function-card';
        
        let html = `
            <div class="function-header">
                <h4>${func.function || func.name}</h4>
                ${func.shortcut ? `<kbd>${func.shortcut}</kbd>` : ''}
            </div>
        `;
        
        if (func.syntax) html += `<p class="function-syntax"><code>${func.syntax}</code></p>`;
        if (func.description) html += `<p class="function-desc">${func.description}</p>`;
        
        // Dinamik array property'ler
        ['examples', 'variants', 'related', 'operators'].forEach(prop => {
            if (func[prop] && Array.isArray(func[prop])) {
                html += `<div class="function-section">
                    <strong>${this.formatTitle(prop)}:</strong>
                    <ul>${func[prop].map(item => `<li><code>${item}</code></li>`).join('')}</ul>
                </div>`;
            }
        });
        
        // Alternative veya example (string)
        if (func.alternative) {
            html += `<p class="alternative"><strong>Alternatif:</strong> <code>${func.alternative}</code></p>`;
        }
        
        if (func.example && typeof func.example === 'string') {
            html += `<div class="example-item"><code>${func.example}</code></div>`;
        }
        
        card.innerHTML = html;
        return card;
    }

    /**
     * Yardımcı: Generic card oluştur - BUTTONS DESTEĞİ İLE
     */
    createGenericCard(item) {
        const card = document.createElement('div');
        card.className = 'data-card';
        
        // ÖNEMLİ: Eğer item içinde buttons array varsa, özel render
        if (item.buttons && Array.isArray(item.buttons)) {
            card.className = 'data-card buttons-card';
            
            let html = `<h4>${item.name || item.title || 'Başlıksız'}</h4>`;
            
            // Buttons'ı mini grid olarak render et
            html += '<div class="mini-button-grid">';
            item.buttons.forEach(btn => {
                html += `
                    <div class="mini-button-item">
                        <div class="mini-button-icon">${btn.icon || '⬜'}</div>
                        <div class="mini-button-info">
                            <strong>${btn.name}</strong>
                            ${btn.shortcut ? `<kbd>${btn.shortcut}</kbd>` : ''}
                            ${btn.description ? `<p>${btn.description}</p>` : ''}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            card.innerHTML = html;
            return card;
        }
        
        // Normal card rendering (buttons yoksa)
        let html = `<h4>${item.name || item.title || 'Başlıksız'}</h4>`;
        
        Object.keys(item).forEach(key => {
            if (['name', 'title'].includes(key)) return;
            
            const value = item[key];
            if (typeof value === 'string') {
                html += `<p><strong>${this.formatTitle(key)}:</strong> ${value}</p>`;
            } else if (Array.isArray(value)) {
                html += `<div class="property-list">
                    <strong>${this.formatTitle(key)}:</strong>
                    <ul>${value.map(v => `<li>${v}</li>`).join('')}</ul>
                </div>`;
            } else if (typeof value === 'object' && value !== null) {
                html += `<div class="property-object"><strong>${this.formatTitle(key)}:</strong><dl>`;
                Object.keys(value).forEach(k => {
                    html += `<dt>${this.formatTitle(k)}:</dt><dd>${value[k]}</dd>`;
                });
                html += `</dl></div>`;
            }
        });
        
        card.innerHTML = html;
        return card;
    }

    /**
     * Yardımcı: Başlık formatla
     */
    formatTitle(key) {
        return key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }
}

// Global olarak erişilebilir yap
window.SimpleRenderer = SimpleRenderer;