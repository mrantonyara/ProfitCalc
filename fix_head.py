with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add </head> and the script
html = html.replace('<body>', '    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>\n</head>\n<body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
