import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace blue color with green (#12a04b) in the PDF generation logic
js = js.replace("color: '#0079C2'", "color: '#12a04b'")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
