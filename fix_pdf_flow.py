with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_setup = """    const container = document.createElement('div');
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
    window.scrollTo(0, 0);"""

new_setup = """    const container = document.createElement('div');
    container.innerHTML = tableHtml;
    container.style.width = '800px';
    container.style.backgroundColor = '#ffffff';
    container.style.padding = '20px';
    
    const appContainer = document.querySelector('.app-container');
    
    document.body.appendChild(loadingOverlay);
    
    // Hide the app, put container in normal flow to guarantee rendering dimensions
    appContainer.style.display = 'none';
    document.body.appendChild(container);
    
    const originalScroll = window.scrollY;
    window.scrollTo(0, 0);"""

old_cleanup = """        html2pdf().set(opt).from(container).save().then(() => {
            document.body.removeChild(container);
            document.body.removeChild(loadingOverlay);
            window.scrollTo(0, originalScroll);
        }).catch(err => {
            console.error('PDF generation error:', err);
            document.body.removeChild(container);
            document.body.removeChild(loadingOverlay);
            window.scrollTo(0, originalScroll);
        });"""

new_cleanup = """        html2pdf().set(opt).from(container).save().then(() => {
            document.body.removeChild(container);
            appContainer.style.display = '';
            document.body.removeChild(loadingOverlay);
            window.scrollTo(0, originalScroll);
        }).catch(err => {
            console.error('PDF generation error:', err);
            document.body.removeChild(container);
            appContainer.style.display = '';
            document.body.removeChild(loadingOverlay);
            window.scrollTo(0, originalScroll);
        });"""

js = js.replace(old_setup, new_setup)
js = js.replace(old_cleanup, new_cleanup)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
