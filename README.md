# 🚄 Innovation Day INECO - Webapp Simulación IA

Webapp interactiva y didáctica que simula la construcción progresiva (layer-by-layer) de dos casos de uso de IA, mostrando cómo se añaden capas de seguridad e inteligencia de forma incremental.

## 📋 Descripción

Esta aplicación web permite explorar dos casos de uso de IA Generativa:

1. **Caso 1: Generación de Documentación Técnica**
   - Sistema RAG para generar memorias técnicas de proyectos ferroviarios
   - 5 layers: Sistema Base → RAG → Seguridad → Guardrails → Compliance

2. **Caso 2: Sistema Multiagente - Supervisión de Obra**
   - Sistema de agentes especializados para supervisión automática
   - 5 layers: Base → Orquestación → Security → Monitorización → Validación

## 🛠️ Stack Tecnológico

- **Backend:** Flask (Python)
- **Frontend:** JavaScript vanilla + CSS3
- **Datos:** JSON

## 📁 Estructura del Proyecto

```
innovation-day-webapp/
├── app.py                          # Flask backend
├── requirements.txt                # Dependencias Python
├── README.md                       # Este archivo
├── .gitignore                      # Archivos ignorados por Git
├── static/
│   ├── css/
│   │   └── styles.css              # Estilos globales
│   ├── js/
│   │   ├── caso1.js                # Lógica Caso 1
│   │   └── caso2.js                # Lógica Caso 2
│   └── img/                        # Imágenes y assets
├── templates/
│   ├── index.html                  # Home con selector
│   ├── caso1.html                  # Caso 1
│   └── caso2.html                  # Caso 2
└── data/
    ├── caso1_layers.json           # Datos layers Caso 1
    └── caso2_layers.json           # Datos layers Caso 2
```

## 🚀 Instalación y Ejecución

### Requisitos Previos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)

### Paso 1: Clonar o descargar el proyecto

```bash
git clone https://github.com/gabrielpierobon/agents_demo.git
cd ineco
```

### Paso 2: Crear y activar entorno virtual

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
python -m venv venv
.\venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
python -m venv venv
source venv/bin/activate
```

### Paso 3: Instalar dependencias

```bash
pip install -r requirements.txt
```

### Paso 4: Ejecutar la aplicación

```bash
python app.py
```

La aplicación estará disponible en: **http://localhost:5555**

## 🎮 Uso de la Aplicación

### Navegación Principal

1. **Home Page:** Selecciona uno de los dos casos de uso
2. **Página de Caso:** Explora cada layer progresivamente

### Controles

- **Botón "Revelar Problemas":** Muestra los problemas de la capa actual
- **Botón "Siguiente Layer":** Avanza a la siguiente capa
- **Botón "Layer Anterior":** Retrocede a la capa anterior
- **Click en componente:** Muestra detalles en modal

### Atajos de Teclado

- `→` (Flecha derecha): Siguiente layer
- `←` (Flecha izquierda): Layer anterior
- `Esc`: Cerrar modal

## 📊 Características

### ✨ Visualización Interactiva

- Diagramas arquitectónicos animados
- Transiciones suaves entre layers
- Componentes con colores diferenciados por tipo

### 🎯 Contenido Didáctico

- **Puntos Fuertes:** Capacidades de cada layer
- **Problemas:** Limitaciones que se revelan progresivamente
- **Problemas Resueltos:** Tachados al avanzar layers

### 📱 Diseño Responsive

- Optimizado para desktop, tablet y móvil
- Layout adaptativo según tamaño de pantalla

### 🎨 Animaciones

- Fade in de componentes
- Slide in de problemas revelados
- Transiciones suaves entre layers

## 🔧 Personalización

### Modificar Contenido de Layers

Edita los archivos JSON en la carpeta `data/`:

- `caso1_layers.json`: Datos del Caso 1
- `caso2_layers.json`: Datos del Caso 2

### Estructura de un Layer

```json
{
  "id": 1,
  "nombre": "Nombre del Layer",
  "componentes": [
    {
      "tipo": "input|llm|output|agent|...",
      "label": "ETIQUETA",
      "descripcion": "Descripción breve",
      "ejemplo": "Ejemplo opcional"
    }
  ],
  "puntos_fuertes": [
    "Punto fuerte 1",
    "Punto fuerte 2"
  ],
  "problemas": [
    "Problema pendiente 1"
  ],
  "problemas_resueltos": [
    "Problema resuelto en layers anteriores"
  ]
}
```

### Modificar Estilos

Edita `static/css/styles.css` para cambiar:

- Colores (variables CSS en `:root`)
- Tamaños de fuente
- Espaciados
- Animaciones

## 🎓 Casos de Uso

### Caso 1: Generación de Documentación Técnica

**Objetivo:** Construir un sistema RAG seguro para INECO

**Layers:**
1. Sistema Base (LLM básico)
2. RAG (Vector DB + Retrieval)
3. Seguridad Arquitectónica (ACL + RBAC)
4. Guardrails (Prompt Security + PII filtering)
5. Gobierno del Dato (Purview DLP + Auditoría)

### Caso 2: Sistema Multiagente - Supervisión de Obra

**Objetivo:** Diseñar sistema de agentes para supervisión automática

**Layers:**
1. Sistema Base (Agente único)
2. Orquestación (Múltiples agentes especializados)
3. Tool Use Security (Permisos + Human-in-the-Loop)
4. Monitorización (Dashboard + Error handling)
5. Validadores y Grounding (Confidence scoring + Citations)

## 🐛 Solución de Problemas

### Error: "No module named 'flask'"

```bash
pip install flask
```

### Error: Puerto 5555 en uso

Modifica el puerto en `app.py`:

```python
app.run(debug=True, host='localhost', port=5000)  # Cambia 5555 por otro puerto
```

### Los estilos no se cargan

1. Verifica que la carpeta `static/` existe
2. Limpia caché del navegador (Ctrl + F5)
3. Revisa la consola del navegador (F12) para errores

### Los datos no se cargan

1. Verifica que los archivos JSON están en `data/`
2. Comprueba que el formato JSON es válido
3. Revisa la consola del servidor Flask para errores

## 📝 Notas de Desarrollo

### Agregar Nuevo Caso de Uso

1. Crear `data/caso3_layers.json` con la estructura de datos
2. Crear `templates/caso3.html` (copiar de caso1.html)
3. Crear `static/js/caso3.js` (copiar de caso1.js)
4. Añadir ruta en `app.py`:
   ```python
   @app.route('/caso3')
   def caso3():
       return render_template('caso3.html')
   ```
5. Añadir card en `templates/index.html`

### Extensiones Futuras

- [ ] Modo presentación fullscreen
- [ ] Exportar a PDF
- [ ] Modo playground (drag & drop componentes)
- [ ] Comparador side-by-side de layers
- [ ] Animaciones especiales (flujo de mensajes A2A)
- [ ] Búsqueda de contenido
- [ ] Modo oscuro

## 📄 Licencia

Este proyecto es para uso interno de INECO - Innovation Day 2025.

## 👥 Autor

Desarrollado para el Innovation Day INECO - Octubre 2025

## 🆘 Soporte

Para preguntas o problemas, contacta al equipo de desarrollo.

---

**¡Disfruta explorando los casos de uso de IA! 🚀**

