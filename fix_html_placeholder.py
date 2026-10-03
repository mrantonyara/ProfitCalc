with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Fix placeholder
html = html.replace('placeholder="Например: 5 000"', 'placeholder="5 000"')

# 2. Add Flatpickr CDN
flatpickr_css = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">\n    <link rel="stylesheet" href="styles.css">'
html = html.replace('<link rel="stylesheet" href="styles.css">', flatpickr_css)

flatpickr_js = '<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>\n    <script src="https://npmcdn.com/flatpickr/dist/l10n/ru.js"></script>\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>'
html = html.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>', flatpickr_js)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
