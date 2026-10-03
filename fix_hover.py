import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Fix the hardcoded #fff override
js = js.replace("item.style.backgroundColor = '#fff';", "if (!item.style.backgroundColor || item.style.backgroundColor === 'transparent') item.style.backgroundColor = '#fff';")
js = js.replace("item.style.backgroundColor = 'transparent';", "if (item.style.backgroundColor === 'rgb(255, 255, 255)') item.style.backgroundColor = 'transparent';")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

