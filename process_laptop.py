import sys
from PIL import Image

def remove_screen_bg(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        data = img.getdata()
        
        width, height = img.size
        center_color = img.getpixel((int(width/2), int(height/2)))
        
        new_data = []
        tolerance = 25
        for item in data:
            if abs(item[0] - center_color[0]) < tolerance and \
               abs(item[1] - center_color[1]) < tolerance and \
               abs(item[2] - center_color[2]) < tolerance:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
                
        img.putdata(new_data)
        img.save(output_path, "PNG")
        print("Success")
    except Exception as e:
        print(f"Error: {e}")

remove_screen_bg('/Users/shubhgupta/.gemini/antigravity/brain/d052468c-00d0-438a-84c2-aadda378f1c1/media__1776246333501.png', 'laptop-frame-transparent.png')
