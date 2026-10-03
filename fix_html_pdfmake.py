import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_scripts = '<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>'
new_scripts = '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"></script>\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"></script>'

html = html.replace(old_scripts, new_scripts)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
