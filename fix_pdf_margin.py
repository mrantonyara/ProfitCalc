with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Change pdf-btn margin-left: 12px -> margin-left: 0px or 4px
html = html.replace('style="margin-left: 12px; padding: 12px 4px;', 'style="margin-left: 4px; padding: 12px 4px;')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
