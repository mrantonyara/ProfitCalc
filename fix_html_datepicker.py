with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix date picker type to text so native iOS wheel doesn't hijack it
html = html.replace('<input type="date" id="delivery-date"', '<input type="text" id="delivery-date" readonly="readonly"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
