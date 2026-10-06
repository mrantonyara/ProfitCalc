import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace("const monthChips = document.querySelectorAll('.month-chips .chip');", "const monthChips = document.querySelectorAll('#installment-months .chip');")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

css = css.replace('padding: 22px 12px;', 'padding: 16px 12px;')

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

