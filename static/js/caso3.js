class CasoUsoViewer {
    constructor(casoId) {
        this.casoId = casoId;
        this.currentLayer = 0; // Empezar en Layer 0 (introducción)
        this.problemasRelevados = false;
        this.puntosFuertesRelevados = false;
        this.maxLayers = 5;
        this.init();
        this.setupNotes();
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

        // Verificar si hay inputs/outputs especiales
        const hasSpecialComponents = componentes.some(c => 
            (c.tipo === 'input' && c.es_interactivo) || 
            (c.tipo === 'output' && c.output_completo)
        );

        if (hasSpecialComponents) {
            // Renderizar con componentes especiales
            this.renderWithSpecialComponents(componentes, container);
        } else if (componentes.length > 4 && componentes.filter(c => c.tipo === 'agent').length > 2) {
            // Para el caso 2, si hay muchos agentes, usar un layout diferente
            this.renderMultiAgentDiagram(componentes, container);
        } else {
            this.renderLinearDiagram(componentes, container);
        }

        // Animación de aparición con delay
        setTimeout(() => this.animateComponentsIn(), 100);
    }

    renderWithSpecialComponents(componentes, container) {
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
            'tiempo_generacion': 'Tiempo',
            'desviaciones_detectadas': 'Desviaciones',
            'imagenes_procesadas': 'Imágenes',
            'accuracy': 'Accuracy'
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

    renderLinearDiagram(componentes, container) {
        componentes.forEach((comp, index) => {
            const elemento = this.createComponentElement(comp);
            container.appendChild(elemento);

            // Añadir flecha si no es el último
            if (index < componentes.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'arrow';
                arrow.innerHTML = '→';
                container.appendChild(arrow);
            }
        });
    }

    renderMultiAgentDiagram(componentes, container) {
        // Layout especial para múltiples agentes
        const coordinador = componentes.find(c => c.label.includes('COORDINADOR'));
        const agentes = componentes.filter(c => c.tipo === 'agent' && !c.label.includes('COORDINADOR'));
        const otros = componentes.filter(c => c.tipo !== 'agent' || c.label.includes('COORDINADOR'));

        // Renderizar input
        const inputs = otros.filter(c => c.tipo === 'input');
        inputs.forEach(comp => {
            container.appendChild(this.createComponentElement(comp));
        });

        if (inputs.length > 0) {
            const arrow = document.createElement('div');
            arrow.className = 'arrow';
            arrow.innerHTML = '↓';
            container.appendChild(arrow);
        }

        // Renderizar coordinador si existe
        if (coordinador) {
            container.appendChild(this.createComponentElement(coordinador));
            
            const arrow = document.createElement('div');
            arrow.className = 'arrow';
            arrow.innerHTML = '↓';
            container.appendChild(arrow);
        }

        // Renderizar agentes en grid
        if (agentes.length > 0) {
            const agentGrid = document.createElement('div');
            agentGrid.style.display = 'grid';
            agentGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(160px, 1fr))';
            agentGrid.style.gap = '15px';
            agentGrid.style.width = '100%';
            agentGrid.style.maxWidth = '900px';
            
            agentes.forEach(agente => {
                agentGrid.appendChild(this.createComponentElement(agente));
            });
            
            container.appendChild(agentGrid);
        }

        // Renderizar componentes de seguridad/monitoreo
        const security = otros.filter(c => ['security', 'monitoring', 'validation'].includes(c.tipo));
        if (security.length > 0) {
            const arrow = document.createElement('div');
            arrow.className = 'arrow';
            arrow.innerHTML = '↓';
            container.appendChild(arrow);

            security.forEach((comp, index) => {
                container.appendChild(this.createComponentElement(comp));
                if (index < security.length - 1) {
                    const arrow = document.createElement('div');
                    arrow.className = 'arrow';
                    arrow.innerHTML = '→';
                    container.appendChild(arrow);
                }
            });
        }

        // Renderizar output
        const outputs = otros.filter(c => c.tipo === 'output');
        if (outputs.length > 0) {
            const arrow = document.createElement('div');
            arrow.className = 'arrow';
            arrow.innerHTML = '↓';
            container.appendChild(arrow);

            outputs.forEach(comp => {
                container.appendChild(this.createComponentElement(comp));
            });
        }
    }

    createComponentElement(comp) {
        const div = document.createElement('div');
        div.className = `componente componente-${comp.tipo}`;
        
        const icon = document.createElement('div');
        icon.className = 'componente-icon';
        icon.textContent = this.getIcon(comp.tipo);
        
        const label = document.createElement('div');
        label.className = 'componente-label';
        label.textContent = comp.label;
        
        const desc = document.createElement('div');
        desc.className = 'componente-desc';
        desc.textContent = comp.descripcion;
        
        // Hacer label y descripción editables
        const storageKeyLabel = `caso${this.casoId}_layer${this.currentLayer}_comp${comp.tipo}_${comp.label}_label`;
        const storageKeyDesc = `caso${this.casoId}_layer${this.currentLayer}_comp${comp.tipo}_${comp.label}_desc`;
        
        this.makeTextEditable(label, storageKeyLabel);
        this.makeTextEditable(desc, storageKeyDesc);
        
        div.appendChild(icon);
        div.appendChild(label);
        div.appendChild(desc);

        // Añadir click handler para mostrar detalles (solo en el icono para no interferir con edición)
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showComponentDetails(comp);
        });
        
        // También permitir click en el componente si no se está editando
        div.addEventListener('click', (e) => {
            if (e.target === div) {
                this.showComponentDetails(comp);
            }
        });

        return div;
    }

    renderPuntosFuertes(puntos) {
        const container = document.getElementById('puntos-fuertes');
        container.innerHTML = '<h3>✅ Puntos Fuertes</h3>';
        
        if (!puntos || puntos.length === 0) {
            container.innerHTML += '<p style="color: #666;">No hay puntos fuertes definidos aún.</p>';
            return;
        }

        if (!this.puntosFuertesRelevados) {
            const btn = document.createElement('button');
            btn.textContent = '👁️ Revelar Puntos Fuertes';
            btn.className = 'btn-revelar-puntos';
            btn.addEventListener('click', () => this.revelarPuntosFuertes());
            container.appendChild(btn);
        } else {
            const ul = document.createElement('ul');
            puntos.forEach((punto, index) => {
                const li = document.createElement('li');
                
                // Manejar tanto formato string como objeto
                const texto = typeof punto === 'string' ? punto : punto.texto;
                const explicacion = typeof punto === 'object' ? punto.explicacion : null;
                
                li.textContent = texto;
                li.className = 'punto-fuerte revealed';
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
    }

    revelarPuntosFuertes() {
        this.puntosFuertesRelevados = true;
        this.loadLayer(this.currentLayer);
        
        // Mensaje de éxito
        const container = document.getElementById('puntos-fuertes');
        const successMsg = document.createElement('div');
        successMsg.style.cssText = 'color: #107c10; font-weight: 600; padding: 12px; background: #dff6dd; border-radius: 4px; margin: 12px 0;';
        successMsg.textContent = '✓ Puntos fuertes revelados';
        container.insertBefore(successMsg, container.children[1]);
        
        setTimeout(() => successMsg.remove(), 2000);
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
                li.innerHTML = '🎉 <strong>¡Sistema completo! Arquitectura multiagente robusta y segura.</strong>';
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
        
        // Convertir explicación a bullet points
        const explicacionHTML = this.convertTextToBulletPoints(explicacion);
        
        content.innerHTML = `
            <span class="modal-explicacion-close" onclick="document.getElementById('modal-explicacion').style.display='none'">&times;</span>
            <div class="modal-explicacion-header">
                <div class="modal-explicacion-icon">${icon}</div>
                <div class="modal-explicacion-title">${titulo}</div>
            </div>
            <div class="modal-explicacion-body">
                ${explicacionHTML}
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
            'input': '📷',
            'llm': '🤖',
            'output': '⚠️',
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
        
        // Limpiar contenido previo
        content.innerHTML = '';
        
        // Título
        const title = document.createElement('h2');
        title.textContent = `${this.getIcon(comp.tipo)} ${comp.label}`;
        content.appendChild(title);
        
        // Descripción editable
        const descLabel = document.createElement('p');
        descLabel.innerHTML = '<strong>Descripción:</strong>';
        content.appendChild(descLabel);
        
        const descText = document.createElement('p');
        descText.textContent = comp.descripcion;
        const storageKeyDesc = `caso${this.casoId}_modal_${comp.tipo}_${comp.label}_desc`;
        this.makeTextEditable(descText, storageKeyDesc);
        content.appendChild(descText);

        // Ejemplo editable
        if (comp.ejemplo) {
            const ejemploLabel = document.createElement('p');
            ejemploLabel.innerHTML = '<strong>Ejemplo:</strong>';
            content.appendChild(ejemploLabel);
            
            const ejemploPre = document.createElement('pre');
            ejemploPre.textContent = comp.ejemplo;
            const storageKeyEjemplo = `caso${this.casoId}_modal_${comp.tipo}_${comp.label}_ejemplo`;
            this.makeTextEditable(ejemploPre, storageKeyEjemplo);
            content.appendChild(ejemploPre);
        }

        // System Prompt editable
        if (comp.system_prompt) {
            const promptLabel = document.createElement('p');
            promptLabel.innerHTML = '<strong>System Prompt:</strong>';
            content.appendChild(promptLabel);
            
            const promptPre = document.createElement('pre');
            promptPre.textContent = comp.system_prompt;
            const storageKeyPrompt = `caso${this.casoId}_modal_${comp.tipo}_${comp.label}_prompt`;
            this.makeTextEditable(promptPre, storageKeyPrompt);
            content.appendChild(promptPre);
        }

        // Configuración editable
        if ((comp.tipo === 'llm' || comp.tipo === 'agent') && comp.configuracion) {
            const configSection = document.createElement('div');
            configSection.className = 'llm-config-section';
            
            const configTitle = document.createElement('h3');
            configTitle.textContent = `⚙️ Configuración del ${comp.tipo === 'agent' ? 'Agente' : 'Modelo'}`;
            configSection.appendChild(configTitle);
            
            const configGrid = document.createElement('div');
            configGrid.className = 'config-grid';
            
            Object.entries(comp.configuracion).forEach(([key, value]) => {
                const configItem = document.createElement('div');
                configItem.className = 'config-item';
                
                const configLabel = document.createElement('span');
                configLabel.className = 'config-label';
                configLabel.textContent = this.formatConfigLabel(key);
                
                const configValue = document.createElement('span');
                configValue.className = 'config-value';
                configValue.textContent = value;
                const storageKeyConfig = `caso${this.casoId}_modal_${comp.tipo}_${comp.label}_config_${key}`;
                this.makeTextEditable(configValue, storageKeyConfig);
                
                configItem.appendChild(configLabel);
                configItem.appendChild(configValue);
                configGrid.appendChild(configItem);
            });
            
            configSection.appendChild(configGrid);
            content.appendChild(configSection);
        }

        // Documentos recuperados
        if (comp.ejemplo_docs) {
            const docsLabel = document.createElement('p');
            docsLabel.innerHTML = '<strong>Documentos recuperados:</strong>';
            content.appendChild(docsLabel);
            
            const docsList = document.createElement('ul');
            comp.ejemplo_docs.forEach(doc => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${doc.titulo}</strong> - Score: ${doc.score}`;
                docsList.appendChild(li);
            });
            content.appendChild(docsList);
        }

        modal.style.display = 'block';
    }

    formatConfigLabel(key) {
        const labels = {
            'modelo': 'Modelo',
            'temperatura': 'Temperatura',
            'max_tokens': 'Max Tokens',
            'top_p': 'Top P',
            'frequency_penalty': 'Frequency Penalty',
            'presence_penalty': 'Presence Penalty',
            'permisos': 'Permisos',
            'timeout': 'Timeout',
            'retry_attempts': 'Reintentos'
        };
        return labels[key] || key;
    }

    setupNotes() {
        const textarea = document.getElementById('notes-textarea');
        if (!textarea) return;

        // Cargar notas guardadas
        const savedNotes = localStorage.getItem(`caso${this.casoId}_notes`);
        if (savedNotes) {
            textarea.value = savedNotes;
        }

        // Guardar automáticamente al escribir
        textarea.addEventListener('input', () => {
            localStorage.setItem(`caso${this.casoId}_notes`, textarea.value);
        });
    }

    makeTextEditable(element, storageKey) {
        element.classList.add('editable-text');
        element.contentEditable = 'true';
        element.setAttribute('data-placeholder', 'Click para editar...');

        // Cargar texto guardado
        const savedText = localStorage.getItem(storageKey);
        if (savedText) {
            element.textContent = savedText;
        }

        // Guardar al perder foco
        element.addEventListener('blur', () => {
            localStorage.setItem(storageKey, element.textContent);
        });

        // Prevenir saltos de línea con Enter
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                element.blur();
            }
        });
    }

    convertTextToBulletPoints(text) {
        // Divide el texto en oraciones y crea bullet points
        if (!text) return '';
        
        // Si ya tiene formato HTML de lista, retornarlo
        if (text.includes('<ul>') || text.includes('<li>')) {
            return text;
        }

        // Dividir por puntos seguidos de espacio o por saltos de línea
        const sentences = text.split(/\.\s+|\n/).filter(s => s.trim().length > 0);
        
        if (sentences.length <= 1) {
            return `<p>${text}</p>`;
        }

        const listItems = sentences.map(s => {
            const trimmed = s.trim();
            // Asegurarse de que termine con punto si no lo tiene
            return trimmed.endsWith('.') ? trimmed : trimmed + '.';
        }).map(s => `<li>${s}</li>`).join('\n');

        return `<ul>\n${listItems}\n</ul>`;
    }
}

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
    window.casoViewer = new CasoUsoViewer(CASO_ID);
});
