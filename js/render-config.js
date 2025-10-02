const RENDER_CONFIG = {
    fieldRenderers: {
        'introduction': 'introduction',
        'media': 'media',
        'practice_exercise': 'practice',
        'advanced_tips': 'tips',
        'formula_tips': 'tips',
        'best_practices': 'tips',
        'visual_guide': 'visual',
		'buttons': 'button_grid',
        
        // Pattern tabanlı
        '*_functions': 'function_list',
        '*_list': 'card_list',
        '*_presets': 'card_list',
        '*_types': 'card_list',
        '*_examples': 'example_list',
        '*_cases': 'key_value_section',
        '*_settings': 'key_value_section',
        '*_margins': 'card_list',
        '*_operators': 'card_list',
        '*_references': 'card_list',
		'*_buttons': 'button_grid'
    },
    
    componentStyles: {
        'function_list': {
            icon: '🔢',
            className: 'functions-section',
            gradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        },
        'card_list': {
            icon: '📋',
            className: 'card-list-section',
            gradient: 'linear-gradient(135deg, #f9f9f9 0%, #f7f7f7 100%)'
			
        },
        'example_list': {
            icon: '💼',
            className: 'example-section',
            gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
        },
        'tips': {
            icon: '💡',
            className: 'tips-section',
            gradient: 'linear-gradient(135deg, rgb(68 140 147) 0%, rgb(143 202 205) 100%)'
        },
        'key_value_section': {
            icon: '📚',
            className: 'key-value-section',
            gradient: 'linear-gradient(135deg, #2196f3 0%, #19547b 100%)'
        }
    },
    
    fieldConfig: {
        'formula_basics': { icon: '⚡', title: 'Formül Yapısı' },
        'cell_references': { icon: '🔗', title: 'Hücre Referansları' },
        'preset_margins': { icon: '📏', title: 'Hazır Kenar Boşlukları' },
        'basic_functions': { icon: '🔢', title: 'Temel Fonksiyonlar' },
        'advanced_math': { icon: '🎓', title: 'İleri Matematik' },
        'statistical_functions': { icon: '📊', title: 'İstatistiksel Fonksiyonlar' },
        'practical_examples': { icon: '💼', title: 'Pratik Örnekler' }
    }
};

// BU SATIR EKSİKTİ!
window.RENDER_CONFIG = RENDER_CONFIG;