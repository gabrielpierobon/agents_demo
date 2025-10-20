from flask import Flask, render_template, jsonify
import json
import os

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

# Cargar datos de layers
def load_layer_data(caso):
    try:
        with open(f'data/caso{caso}_layers.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "Archivo no encontrado"}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/caso1')
def caso1():
    return render_template('caso1.html')

@app.route('/caso2')
def caso2():
    return render_template('caso2.html')

@app.route('/caso3')
def caso3():
    return render_template('caso3.html')

@app.route('/caso4')
def caso4():
    return render_template('caso4.html')

@app.route('/api/caso/<int:caso_id>/layer/<int:layer_id>')
def get_layer(caso_id, layer_id):
    data = load_layer_data(caso_id)
    if "error" in data:
        return jsonify({"error": "Datos no disponibles"}), 404
    
    layer = next((l for l in data['layers'] if l['id'] == layer_id), None)
    if layer:
        return jsonify(layer)
    return jsonify({"error": "Layer no encontrado"}), 404

@app.route('/api/caso/<int:caso_id>/info')
def get_caso_info(caso_id):
    data = load_layer_data(caso_id)
    if "error" in data:
        return jsonify({"error": "Datos no disponibles"}), 404
    return jsonify(data.get('caso', {}))

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5555)

