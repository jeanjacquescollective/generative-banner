import csv
import os
from PIL import Image, ImageDraw, ImageFont

# Function to add a wobbly effect to text
def apply_wobbly_effect(draw, text, x, y, amplitude, frequency, phase):
    characters = list(text)
    for index, char in enumerate(characters):
        y_offset = int(amplitude * sin(frequency * index + phase))
        draw.text((x + index * 20, y + y_offset), char, fill="white", font=font)

# Function to create a collage from PNG images in a folder
def create_image_collage(folder_path, canvas_width, canvas_height):
    collage = Image.new('RGB', (canvas_width, canvas_height), color='#3b5998')
    x_offset = 0

    for filename in os.listdir(folder_path):
        if filename.endswith('.png'):
            image_path = os.path.join(folder_path, filename)
            image = Image.open(image_path)
            collage.paste(image, (x_offset, 0))
            x_offset += image.width

            if x_offset >= canvas_width:
                break

    return collage

# Function to generate a Facebook event banner with wobbly text
def generate_event_banner(events, collage, output_image_path):
    draw = ImageDraw.Draw(collage)
    draw.font = font
    y_offset = 50

    for event in events:
        apply_wobbly_effect(draw, event["name"], 50, y_offset, 10, 0.1, 0)
        apply_wobbly_effect(draw, event["date"], 50, y_offset + 70, 5, 0.2, 0.25)
        apply_wobbly_effect(draw,
