import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('style="margin-left: auto; padding: 12px 4px;', 'style="margin-left: 12px; padding: 12px 4px;')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
