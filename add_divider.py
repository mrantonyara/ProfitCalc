with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

divider = '<div style="width: 1px; height: 24px; background-color: #e5e5ea; margin-left: 16px; margin-right: 8px;"></div>\n                        <div class="pdf-btn"'
html = html.replace('<div class="pdf-btn"', divider)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
