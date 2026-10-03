import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

state_match = re.search(r'(\s*let state = \{[\s\S]*?\};)', js)
if state_match:
    state_code = state_match.group(1)
    js = js.replace(state_code, '')
    
    # Inject it right after DOMContentLoaded
    js = js.replace("document.addEventListener('DOMContentLoaded', () => {", "document.addEventListener('DOMContentLoaded', () => {\n" + state_code + "\n")
    
    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("State moved to top.")
