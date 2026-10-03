with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace("if (!item.style.backgroundColor || item.style.backgroundColor === 'transparent') item.style.backgroundColor = '#fff';", "item.classList.add('elevated');")
js = js.replace("if (item.style.backgroundColor === 'rgb(255, 255, 255)') item.style.backgroundColor = 'transparent';", "item.classList.remove('elevated');")

js = js.replace("item.style.zIndex = '101';", "")
js = js.replace("item.style.position = 'relative';", "")
js = js.replace("item.style.borderRadius = '12px';", "")
js = js.replace("item.style.zIndex = '';", "")

js = js.replace("ri.style.zIndex = '';", "ri.classList.remove('elevated');")
js = js.replace("ri.style.backgroundColor = 'transparent';", "")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

css += """
/* Elevated Result Item */
.result-item.elevated {
    z-index: 101;
    position: relative;
    background-color: #fff !important;
    border-radius: 12px;
    padding: 8px 16px !important;
    margin: 0 -16px !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
"""
with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css)
