import re

with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

new_css = """
/* Tooltip Overlay (Backdrop) */
#tooltip-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 99;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
}

body.tooltip-active #tooltip-overlay {
    opacity: 1;
    pointer-events: auto;
}

/* Beautiful Date Picker */
.date-picker-wrapper {
    position: relative;
    margin-bottom: 16px;
}
.date-picker-wrapper input[type="date"] {
    width: 100%;
    padding: 16px 48px 16px 16px;
    font-size: 16px;
    font-family: inherit;
    font-weight: 500;
    border: 1px solid #e5e5ea;
    border-radius: 12px;
    background-color: #f0f4fa;
    color: #1c1c1e;
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
    transition: all 0.2s ease;
}
.date-picker-wrapper input[type="date"]:focus {
    border-color: var(--primary);
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(0, 121, 194, 0.1);
}
.date-picker-wrapper svg {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--primary);
}
.date-picker-wrapper input[type="date"]::-webkit-calendar-picker-indicator {
    background: transparent;
    bottom: 0;
    color: transparent;
    cursor: pointer;
    height: auto;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: auto;
}
"""
css += new_css

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

# Update HTML
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Inject overlay
html = html.replace('<body>', '<body>\n    <div id="tooltip-overlay"></div>')

# Wrap date picker
old_date = '<input type="date" id="delivery-date" class="input-field" style="font-family: inherit; margin-bottom: 16px;">'
new_date = '''<div class="date-picker-wrapper">
                    <input type="date" id="delivery-date">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                </div>'''
html = html.replace(old_date, new_date)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# Update JS for overlay logic
with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

js_hover_logic = """
    // Desktop hover logic for overlay
    document.querySelectorAll('.result-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            const tt = item.querySelector('.kaspi-tooltip');
            if (tt && tt.innerHTML.trim() !== '') {
                document.body.classList.add('tooltip-active');
                item.style.zIndex = '101';
                item.style.position = 'relative';
                item.style.backgroundColor = '#fff'; // Ensure it's not transparent over overlay
                item.style.borderRadius = '12px';
                // slight padding tweak to make it look like a popout if we want, but Kaspi list items are usually flush.
            }
        });
        item.addEventListener('mouseleave', () => {
            document.body.classList.remove('tooltip-active');
            item.style.zIndex = '';
            item.style.backgroundColor = 'transparent';
        });
    });
"""

# Inject this inside DOMContentLoaded just before calculate();
js = js.replace('    calculate();\n});', js_hover_logic + '\n    calculate();\n});')

# Also update toggleTooltip for mobile
old_toggle = """window.toggleTooltip = function(e, btn) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const tooltip = btn.closest('.result-item').querySelector('.kaspi-tooltip');
    const isShowing = tooltip && tooltip.classList.contains('show');
    
    // Скрываем все остальные
    document.querySelectorAll('.kaspi-tooltip').forEach(tt => tt.classList.remove('show'));
    
    if (tooltip && !isShowing) {
        tooltip.classList.add('show');
    }
};"""

new_toggle = """window.toggleTooltip = function(e, btn) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const item = btn.closest('.result-item');
    const tooltip = item.querySelector('.kaspi-tooltip');
    const isShowing = tooltip && tooltip.classList.contains('show');
    
    // Скрываем все остальные
    document.querySelectorAll('.kaspi-tooltip').forEach(tt => tt.classList.remove('show'));
    document.querySelectorAll('.result-item').forEach(ri => {
        ri.style.zIndex = '';
        ri.style.backgroundColor = 'transparent';
    });
    
    if (tooltip && !isShowing) {
        tooltip.classList.add('show');
        document.body.classList.add('tooltip-active');
        item.style.zIndex = '101';
        item.style.position = 'relative';
        item.style.backgroundColor = '#fff';
        item.style.borderRadius = '12px';
    } else {
        document.body.classList.remove('tooltip-active');
    }
};"""

js = js.replace(old_toggle, new_toggle)

# Also update closeTooltips
old_close = """const closeTooltips = (e) => {
    if (!e.target.closest('.kaspi-tooltip') && !e.target.closest('.info-btn')) {
        document.querySelectorAll('.kaspi-tooltip').forEach(tt => tt.classList.remove('show'));
    }
};"""

new_close = """const closeTooltips = (e) => {
    if (!e.target.closest('.kaspi-tooltip') && !e.target.closest('.info-btn')) {
        document.querySelectorAll('.kaspi-tooltip').forEach(tt => tt.classList.remove('show'));
        document.body.classList.remove('tooltip-active');
        document.querySelectorAll('.result-item').forEach(ri => {
            ri.style.zIndex = '';
            ri.style.backgroundColor = 'transparent';
        });
    }
};"""

js = js.replace(old_close, new_close)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
