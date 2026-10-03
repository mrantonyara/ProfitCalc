import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the DOM manipulation with string input
old_logic = """    const container = document.createElement('div');
    container.innerHTML = tableHtml;
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '800px';
    container.style.zIndex = '-100';
    // Remove absolute top: -9999px because html2canvas ignores off-screen or empty bounds sometimes

    document.body.appendChild(container);
    
    const opt = {
      margin:       10,
      filename:     `schedule_${type}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(container).save().then(() => {
        document.body.removeChild(container);
    });"""

new_logic = """    const opt = {
      margin:       10,
      filename:     `schedule_${type}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, backgroundColor: '#ffffff' },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // We pass tableHtml string directly. html2pdf safely creates an iframe to render it.
    html2pdf().set(opt).from(tableHtml).save();"""

js = js.replace(old_logic, new_logic)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
