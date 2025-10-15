class CasoUsoViewer {
    constructor(casoId) {
        this.casoId = casoId;
        this.currentLayer = 0; // Empezar en Layer 0 (introducción)
        this.problemasRelevados = false;
        this.maxLayers = 5;
        this.init();
    }

    async init() {
        await this.loadLayer(this.currentLayer);
        this.setupEventListeners();
    }

    setupEventListeners() {
        const btnSiguiente = document.getElementById('btn-siguiente');
        const btnAnterior = document.getElementById('btn-anterior');
        
        if (btnSiguiente) {
            btnSiguiente.addEventListener('click', () => this.nextLayer());
        }
        
        if (btnAnterior) {
            btnAnterior.addEventListener('click', () => this.previousLayer());
        }

        // Cerrar modales al hacer click fuera
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('modal-detalles');
            const modalExplicacion = document.getElementById('modal-explicacion');
            
            if (e.target === modal) {
                modal.style.display = 'none';
            }
            if (e.target === modalExplicacion) {
                modalExplicacion.style.display = 'none';
            }
        });

        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                this.nextLayer();
            } else if (e.key === 'ArrowLeft') {
                this.previousLayer();
            } else if (e.key === 'Escape') {
                document.getElementById('modal-detalles').style.display = 'none';
                document.getElementById('modal-explicacion').style.display = 'none';
            }
        });
    }

    async loadLayer(layerId) {
        try {
            const response = await fetch(`/api/caso/${this.casoId}/layer/${layerId}`);
            if (!response.ok) {
                throw new Error('Error al cargar layer');
            }
            const data = await response.json();
            
            this.renderLayer(data);
            this.problemasRelevados = false;
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar los datos. Por favor, recarga la página.');
        }
    }

    renderLayer(layer) {
        // Si es Layer 0 (introducción), renderizar pantalla especial
        if (layer.es_introduccion) {
            this.renderIntroduccion(layer);
            return;
        }

        // Actualizar breadcrumb
        document.getElementById('breadcrumb').textContent = 
            `Layer ${layer.id} de ${this.maxLayers}: ${layer.nombre}`;

        // Renderizar diagrama
        this.renderDiagrama(layer.componentes);

        // Renderizar puntos fuertes
        this.renderPuntosFuertes(layer.puntos_fuertes);

        // Renderizar problemas
        this.renderProblemas(layer.problemas, layer.problemas_resueltos);

        // Actualizar botones de navegación
        this.updateNavigationButtons(layer.id);
    }

    renderIntroduccion(layer) {
        // Ocultar breadcrumb
        document.getElementById('breadcrumb').style.display = 'none';

        // Renderizar pantalla de introducción
        const diagramaContainer = document.getElementById('diagrama-container');
        diagramaContainer.innerHTML = `
            <div class="introduccion-container">
                <div class="problema-section">
                    <h2>🎯 ${layer.problema.titulo}</h2>
                    <p>${layer.problema.descripcion}</p>
                    <ul>
                        ${layer.problema.puntos.map(p => `<li>${p}</li>`).join('')}
                    </ul>
                    <div class="impacto-box">
                        <strong>💥 Impacto:</strong> ${layer.problema.impacto}
                    </div>
                </div>

                <div class="solucion-section">
                    <h2>💡 ${layer.solucion.titulo}</h2>
                    <p>${layer.solucion.descripcion}</p>
                    <ul>
                        ${layer.solucion.beneficios.map(b => `<li>${b}</li>`).join('')}
                    </ul>
                    <div class="enfoque-box">
                        <strong>🚀 Enfoque:</strong> ${layer.solucion.enfoque}
                    </div>
                </div>
            </div>
        `;

        // Ocultar secciones de puntos fuertes y problemas
        document.getElementById('puntos-fuertes').style.display = 'none';
        document.getElementById('problemas').style.display = 'none';

        // Actualizar botones
        const btnAnterior = document.getElementById('btn-anterior');
        const btnSiguiente = document.getElementById('btn-siguiente');
        
        btnAnterior.style.display = 'none';
        btnSiguiente.textContent = '🚀 Comenzar con Layer 1 →';
        btnSiguiente.classList.remove('btn-completo');
        btnSiguiente.disabled = false;
    }

    renderDiagrama(componentes) {
        // Mostrar breadcrumb
        document.getElementById('breadcrumb').style.display = 'inline-block';
        
        // Mostrar secciones
        document.getElementById('puntos-fuertes').style.display = 'block';
        document.getElementById('problemas').style.display = 'block';

        const container = document.getElementById('diagrama-container');
        container.innerHTML = '';

        componentes.forEach((comp, index) => {
            // Si es INPUT interactivo, renderizar input box
            if (comp.tipo === 'input' && comp.es_interactivo) {
                const inputContainer = this.createInputBox(comp);
                container.appendChild(inputContainer);
            } 
            // Si es OUTPUT con simulación completa, renderizar output box
            else if (comp.tipo === 'output' && comp.output_completo) {
                const outputContainer = this.createOutputBox(comp);
                container.appendChild(outputContainer);
            }
            // Componentes normales
            else {
                const elemento = this.createComponentElement(comp);
                container.appendChild(elemento);
            }

            // Añadir flecha si no es el último
            if (index < componentes.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'arrow';
                arrow.innerHTML = '→';
                container.appendChild(arrow);
            }
        });

        // Animación de aparición con delay
        setTimeout(() => this.animateComponentsIn(), 100);
    }

    createInputBox(comp) {
        const div = document.createElement('div');
        div.className = 'input-box-container collapsed';
        div.innerHTML = `
            <label class="input-box-label">📝 ${comp.label} - ${comp.descripcion}</label>
            <textarea class="input-box" readonly>${comp.input_value || ''}</textarea>
        `;
        
        // Toggle collapse/expand al hacer click
        div.addEventListener('click', (e) => {
            // No toggle si se hace click en el textarea
            if (e.target.tagName !== 'TEXTAREA') {
                div.classList.toggle('collapsed');
            }
        });
        
        return div;
    }

    createOutputBox(comp) {
        const containerId = `output-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const btnId = `btn-run-${containerId}`;
        
        const wrapper = document.createElement('div');
        
        const output = comp.output_completo;
        const metadata = output.metadata || {};
        
        // Botón Run Agent
        const btnRun = document.createElement('button');
        btnRun.id = btnId;
        btnRun.className = 'btn-run-agent';
        btnRun.innerHTML = '▶️ Run Agent';
        wrapper.appendChild(btnRun);
        
        // Output container (inicialmente oculto)
        const div = document.createElement('div');
        div.id = containerId;
        div.className = 'output-container hidden';
        
        div.innerHTML = `
            <div class="output-header">
                <span class="output-label">📄 ${comp.label} - ${comp.descripcion}</span>
                <button class="btn-export" onclick="window.casoViewer.exportOutput(${JSON.stringify(output).replace(/"/g, '&quot;')})">
                    💾 Exportar JSON
                </button>
            </div>
            <div class="output-content">${output.titulo ? output.titulo + '\n\n' : ''}${output.contenido || output}</div>
            ${metadata && Object.keys(metadata).length > 0 ? `
                <div class="output-metadata">
                    ${Object.entries(metadata).map(([key, value]) => `
                        <div class="metadata-item">
                            <span class="metadata-label">${this.formatMetadataLabel(key)}:</span>
                            <span class="metadata-value">${value}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
        
        wrapper.appendChild(div);
        
        // Event listener para el botón
        btnRun.addEventListener('click', () => {
            btnRun.disabled = true;
            btnRun.innerHTML = '<span class="loading-spinner"></span> Ejecutando...';
            
            // Simular procesamiento
            setTimeout(() => {
                div.classList.remove('hidden');
                btnRun.style.display = 'none';
                
                // Scroll suave al output
                setTimeout(() => {
                    div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }, 1500); // 1.5 segundos de "procesamiento"
        });
        
        return wrapper;
    }

    formatMetadataLabel(key) {
        const labels = {
            'fecha_generacion': 'Fecha',
            'version': 'Versión',
            'tokens_utilizados': 'Tokens',
            'tiempo_generacion': 'Tiempo'
        };
        return labels[key] || key;
    }

    exportOutput(output) {
        const dataStr = JSON.stringify(output, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `output_layer_${this.currentLayer}_${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    createComponentElement(comp) {
        const div = document.createElement('div');
        div.className = `componente componente-${comp.tipo}`;
        div.innerHTML = `
            <div class="componente-icon">${this.getIcon(comp.tipo)}</div>
            <div class="componente-label">${comp.label}</div>
            <div class="componente-desc">${comp.descripcion}</div>
        `;

        // Añadir click handler para mostrar detalles
        div.addEventListener('click', () => this.showComponentDetails(comp));

        return div;
    }

    renderPuntosFuertes(puntos) {
        const container = document.getElementById('puntos-fuertes');
        container.innerHTML = '<h3>✅ Puntos Fuertes</h3>';
        
        if (!puntos || puntos.length === 0) {
            container.innerHTML += '<p style="color: #666;">No hay puntos fuertes definidos aún.</p>';
            return;
        }

        const ul = document.createElement('ul');
        puntos.forEach((punto, index) => {
            const li = document.createElement('li');
            
            // Manejar tanto formato string como objeto
            const texto = typeof punto === 'string' ? punto : punto.texto;
            const explicacion = typeof punto === 'object' ? punto.explicacion : null;
            
            li.textContent = texto;
            li.className = 'punto-fuerte';
            li.style.animationDelay = `${index * 0.1}s`;
            
            // Si tiene explicación, hacerlo clickeable
            if (explicacion) {
                li.addEventListener('click', () => {
                    this.showExplicacion('✅', texto, explicacion);
                });
            }
            
            ul.appendChild(li);
        });
        
        container.appendChild(ul);
    }

    renderProblemas(problemas, problemasResueltos = []) {
        const container = document.getElementById('problemas');
        container.innerHTML = '<h3>⚠️ Problemas</h3>';

        if (!this.problemasRelevados) {
            if (problemas && problemas.length > 0) {
                const btn = document.createElement('button');
                btn.textContent = '🔍 Revelar Problemas';
                btn.className = 'btn-revelar';
                btn.addEventListener('click', () => this.revelarProblemas());
                container.appendChild(btn);
            } else {
                const successMsg = document.createElement('div');
                successMsg.innerHTML = '<p style="color: #107c10; font-weight: 600; font-size: 1.1rem;">🎉 ¡Todos los problemas resueltos!</p>';
                container.appendChild(successMsg);
            }
        } else {
            const ul = document.createElement('ul');
            
            // Problemas resueltos (tachados)
            if (problemasResueltos && problemasResueltos.length > 0) {
                problemasResueltos.forEach(prob => {
                    const li = document.createElement('li');
                    li.className = 'problema-resuelto';
                    
                    const texto = typeof prob === 'string' ? prob : prob.texto;
                    const explicacion = typeof prob === 'object' ? prob.explicacion : null;
                    
                    li.innerHTML = `${texto} ✅`;
                    
                    if (explicacion) {
                        li.style.cursor = 'pointer';
                        li.addEventListener('click', () => {
                            this.showExplicacion('✅', texto, explicacion);
                        });
                    }
                    
                    ul.appendChild(li);
                });
            }

            // Problemas pendientes
            if (problemas && problemas.length > 0) {
                problemas.forEach((prob, index) => {
                    const li = document.createElement('li');
                    li.className = 'problema-pendiente revealed';
                    li.style.animationDelay = `${index * 0.1}s`;
                    
                    const texto = typeof prob === 'string' ? prob : prob.texto;
                    const explicacion = typeof prob === 'object' ? prob.explicacion : null;
                    
                    li.textContent = texto;
                    
                    if (explicacion) {
                        li.addEventListener('click', () => {
                            this.showExplicacion('⚠️', texto, explicacion);
                        });
                    }
                    
                    ul.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.style.background = '#dff6dd';
                li.style.color = '#0b5a08';
                li.style.borderLeft = '4px solid #107c10';
                li.innerHTML = '🎉 <strong>¡Sistema completo! Todos los problemas resueltos.</strong>';
                li.style.opacity = '1';
                ul.appendChild(li);
            }

            container.appendChild(ul);
        }
    }

    revelarProblemas() {
        this.problemasRelevados = true;
        this.loadLayer(this.currentLayer);
        
        // Animación de revelación
        setTimeout(() => {
            const problemas = document.querySelectorAll('.problema-pendiente');
            problemas.forEach((prob, index) => {
                setTimeout(() => {
                    prob.classList.add('revealed');
                }, index * 100);
            });
        }, 100);
    }

    showExplicacion(icon, titulo, explicacion) {
        const modal = document.getElementById('modal-explicacion');
        const content = modal.querySelector('.modal-explicacion-content');
        
        content.innerHTML = `
            <span class="modal-explicacion-close" onclick="document.getElementById('modal-explicacion').style.display='none'">&times;</span>
            <div class="modal-explicacion-header">
                <div class="modal-explicacion-icon">${icon}</div>
                <div class="modal-explicacion-title">${titulo}</div>
            </div>
            <div class="modal-explicacion-body">
                ${explicacion}
            </div>
        `;
        
        modal.style.display = 'block';
    }

    updateNavigationButtons(currentLayerId) {
        const btnSiguiente = document.getElementById('btn-siguiente');
        const btnAnterior = document.getElementById('btn-anterior');
        
        // Botón anterior
        if (currentLayerId > 0) {
            btnAnterior.style.display = 'inline-block';
        } else {
            btnAnterior.style.display = 'none';
        }

        // Botón siguiente
        if (currentLayerId >= this.maxLayers) {
            btnSiguiente.textContent = '🎉 Sistema Completo';
            btnSiguiente.classList.add('btn-completo');
            btnSiguiente.disabled = true;
        } else {
            if (currentLayerId === 0) {
                btnSiguiente.textContent = `🚀 Comenzar con Layer 1 →`;
            } else {
                btnSiguiente.textContent = `Siguiente Layer (${currentLayerId + 1}/${this.maxLayers}) →`;
            }
            btnSiguiente.classList.remove('btn-completo');
            btnSiguiente.disabled = false;
        }
    }

    nextLayer() {
        if (this.currentLayer < this.maxLayers) {
            this.currentLayer++;
            this.loadLayer(this.currentLayer);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    previousLayer() {
        if (this.currentLayer > 0) {
            this.currentLayer--;
            this.loadLayer(this.currentLayer);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    animateComponentsIn() {
        const componentes = document.querySelectorAll('.componente');
        componentes.forEach((comp, index) => {
            setTimeout(() => {
                comp.classList.add('fade-in');
            }, index * 150);
        });
    }

    getIcon(tipo) {
        const icons = {
            'input': '📝',
            'llm': '🤖',
            'output': '📄',
            'embedding': '🔤',
            'vector_search': '🔍',
            'vector_db': '📚',
            'retrieved_docs': '📑',
            'acl': '🔒',
            'rbac': '👥',
            'guardrail': '🛡️',
            'purview': '📊',
            'audit': '📝',
            'security': '🔐',
            'agent': '🤖',
            'monitoring': '📊',
            'validation': '✅'
        };
        return icons[tipo] || '⚙️';
    }

    showComponentDetails(comp) {
        const modal = document.getElementById('modal-detalles');
        const content = document.getElementById('modal-body');
        
        let html = `
            <h2>${this.getIcon(comp.tipo)} ${comp.label}</h2>
            <p><strong>Descripción:</strong> ${comp.descripcion}</p>
        `;

        if (comp.ejemplo) {
            html += `
                <p><strong>Ejemplo:</strong></p>
                <pre>${comp.ejemplo}</pre>
            `;
        }

        if (comp.system_prompt) {
            html += `
                <p><strong>System Prompt:</strong></p>
                <pre>${comp.system_prompt}</pre>
            `;
        }

        // Si es LLM, mostrar configuración
        if (comp.tipo === 'llm' && comp.configuracion) {
            html += `
                <div class="llm-config-section">
                    <h3>⚙️ Configuración del Modelo</h3>
                    <div class="config-grid">
                        ${Object.entries(comp.configuracion).map(([key, value]) => `
                            <div class="config-item">
                                <span class="config-label">${this.formatConfigLabel(key)}</span>
                                <span class="config-value">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (comp.ejemplo_docs) {
            html += `<p><strong>Documentos recuperados:</strong></p><ul>`;
            comp.ejemplo_docs.forEach(doc => {
                html += `<li><strong>${doc.titulo}</strong> - Score: ${doc.score}</li>`;
            });
            html += `</ul>`;
        }

        content.innerHTML = html;
        modal.style.display = 'block';
    }

    formatConfigLabel(key) {
        const labels = {
            'modelo': 'Modelo',
            'temperatura': 'Temperatura',
            'max_tokens': 'Max Tokens',
            'top_p': 'Top P',
            'frequency_penalty': 'Frequency Penalty',
            'presence_penalty': 'Presence Penalty'
        };
        return labels[key] || key;
    }
}

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
    window.casoViewer = new CasoUsoViewer(CASO_ID);
});
