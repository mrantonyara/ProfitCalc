with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Change button color to Kaspi Red
css = css.replace('.modal-btn-primary {\n    background: #0079C2;\n    color: #fff;\n}', '.modal-btn-primary {\n    background: #f14635;\n    color: #fff;\n}')
css = css.replace('.modal-btn-primary:active { background: #00609b; }', '.modal-btn-primary:active { background: #d03a2b; }')

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css)
