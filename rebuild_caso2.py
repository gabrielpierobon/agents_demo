#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
import sys

# Set stdout encoding to UTF-8
sys.stdout.reconfigure(encoding='utf-8')

# Read the clean version
with open('data/caso2_layers_clean.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Make replacements recursively
def replace_text(obj):
    if isinstance(obj, dict):
        return {k: replace_text(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [replace_text(item) for item in obj]
    elif isinstance(obj, str):
        # Replace INECO
        result = obj.replace('INECO supervisa obras', 'Las empresas de ingeniería supervisan obras')
        # Replace TWINECO with "Gemelo Digital"
        result = result.replace('TWINECO', 'Gemelo Digital')
        return result
    else:
        return obj

# Apply replacements
data_updated = replace_text(data)

# Write with proper UTF-8 encoding
with open('data/caso2_layers.json', 'w', encoding='utf-8', newline='\n') as f:
    json.dump(data_updated, f, ensure_ascii=False, indent=2)

print("Archivo reconstruido correctamente")

