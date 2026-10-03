with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Use non-breaking space
js = js.replace('val.replace(/\\B(?=(\\d{3})+(?!\\d))/g, " ");', 'val.replace(/\\B(?=(\\d{3})+(?!\\d))/g, "\\u00A0");')
js = js.replace('Math.round(amount).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, " ") + \' ₸\'', 'Math.round(amount).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, "\\u00A0") + "\\u00A0₸"')

# 2. Fix 20к
js = js.replace('Лимит 20к', 'Лимит 20\u00A0000\u00A0₸')

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
