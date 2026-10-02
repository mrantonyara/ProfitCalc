from PIL import Image
import sys

def remove_green(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Green background usually has high Green, low Red and Blue
        # The green in the image is roughly R:80-120, G:170-210, B:20-50
        # If Green is significantly higher than Red and Blue, make it transparent
        if item[1] > item[0] + 40 and item[1] > item[2] + 40:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")

remove_green("/Users/mrantonyara/.gemini/antigravity/brain/84a1c2a7-9ecd-4911-a247-23d42acf383e/.user_uploaded/media_1790956666902.png", "fire.png")
