with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<h3>Скачать график</h3>', '<h3>Скачать файл</h3>')
# Let's also check if it has style tags inside the h3
html = html.replace('<h3 style="margin-bottom: 12px; color: #1c1c1e;">Скачать график</h3>', '<h3 style="margin-bottom: 12px; color: #1c1c1e;">Скачать файл</h3>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
