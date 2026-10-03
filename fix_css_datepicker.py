with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

css = css.replace('.date-picker-wrapper input[type="date"]', '.date-picker-wrapper input')

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css)
