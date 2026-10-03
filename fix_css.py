with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Fix list-item layout so elevation doesn't shift
css = css.replace('padding: 16px 0;\n    border-bottom: 1px solid var(--border-color);\n    cursor: pointer;\n    position: relative;', 
                  'padding: 16px 12px;\n    margin: 0 -12px;\n    border-bottom: 1px solid var(--border-color);\n    border-radius: 12px;\n    cursor: pointer;\n    position: relative;\n    transition: background-color 0.2s, box-shadow 0.2s;')

# Fix elevated to not shift
css = css.replace('padding: 8px 16px !important;\n    margin: 0 -16px !important;\n    box-shadow: 0 4px 20px rgba(0,0,0,0.08);', 
                  'box-shadow: 0 8px 24px rgba(0,0,0,0.12);\n    border-bottom-color: transparent;')

# Dim overlay
css = css.replace('background: rgba(0, 0, 0, 0.3);\n    backdrop-filter: blur(4px);\n    -webkit-backdrop-filter: blur(4px);',
                  'background: rgba(0, 0, 0, 0.1);\n    backdrop-filter: blur(2px);\n    -webkit-backdrop-filter: blur(2px);')

# Add progress bar styles
css += """
/* Visual Breakdown Bar */
.visual-bar-container {
    display: flex;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    margin: 12px 0 8px 0;
    background: #e5e5ea;
}
.visual-bar-part {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 10px;
    font-weight: bold;
}
.visual-legend {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: #8e8e93;
    margin-bottom: 8px;
    flex-wrap: wrap;
}
.visual-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 4px;
}
"""

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css)
