with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace("'0 ₸'", "'0\\u00A0₸'")
js = js.replace('"0 ₸"', '"0\\u00A0₸"')

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('0 ₸', '0&nbsp;₸')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
