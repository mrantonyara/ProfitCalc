import re
with open('index.html', 'r', encoding='utf-8') as f: code = f.read()
code = re.sub(r'<div id="installment-bonus-container".*?</div>', '', code, flags=re.DOTALL)
with open('index.html', 'w', encoding='utf-8') as f: f.write(code)
