import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_logic = """    const opt = {
      margin:       10,
      filename:     `schedule_${type}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, backgroundColor: '#ffffff' },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // We pass tableHtml string directly. html2pdf safely creates an iframe to render it.
    html2pdf().set(opt).from(tableHtml).save();"""

new_logic = """    const loadingOverlay = document.createElement('div');
    loadingOverlay.style.position = 'fixed';
    loadingOverlay.style.top = '0';
    loadingOverlay.style.left = '0';
    loadingOverlay.style.width = '100vw';
    loadingOverlay.style.height = '100vh';
    loadingOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    loadingOverlay.style.zIndex = '9999';
    loadingOverlay.style.display = 'flex';
    loadingOverlay.style.alignItems = 'center';
    loadingOverlay.style.justifyContent = 'center';
    loadingOverlay.style.fontFamily = 'sans-serif';
    loadingOverlay.style.fontSize = '18px';
    loadingOverlay.style.fontWeight = 'bold';
    loadingOverlay.style.color = '#0079C2';
    loadingOverlay.innerHTML = 'Формируем PDF...';
    
    const container = document.createElement('div');
    container.innerHTML = tableHtml;
    // Position it at the very top so html2canvas captures it perfectly
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '800px';
    container.style.backgroundColor = '#ffffff';
    container.style.zIndex = '9998'; // Below the loading overlay, but above everything else
    
    document.body.appendChild(container);
    document.body.appendChild(loadingOverlay);
    
    // Scroll to top temporarily to ensure html2canvas captures the absolute positioned element
    const originalScroll = window.scrollY;
    window.scrollTo(0, 0);

    const opt = {
      margin:       10,
      filename:     `schedule_${type}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, scrollY: 0, windowWidth: 800 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(container).save().then(() => {
        document.body.removeChild(container);
        document.body.removeChild(loadingOverlay);
        window.scrollTo(0, originalScroll);
    }).catch(err => {
        console.error('PDF generation error:', err);
        document.body.removeChild(container);
        document.body.removeChild(loadingOverlay);
        window.scrollTo(0, originalScroll);
    });"""

js = js.replace(old_logic, new_logic)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
