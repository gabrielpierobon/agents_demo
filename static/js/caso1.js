class CasoUsoViewer {
    constructor(casoId) {
        this.casoId = casoId;
        this.currentLayer = 1;
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

        // Cerrar modal al hacer click fuera
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('modal-detalles');
            if (e.target === modal) {
                modal.style.display = 'none';
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

    renderDiagrama(componentes) {
        const container = document.getElementById('diagrama-container');
        container.innerHTML = '';

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

        // Animación de aparición con delay
        setTimeout(() => this.animateComponentsIn(), 100);
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
            li.textContent = punto;
            li.className = 'punto-fuerte';
            li.style.animationDelay = `${index * 0.1}s`;
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
                successMsg.innerHTML = '<p style="color: #28a745; font-weight: 600; font-size: 1.1rem;">🎉 ¡Todos los problemas resueltos!</p>';
                container.appendChild(successMsg);
            }
        } else {
            const ul = document.createElement('ul');
            
            // Problemas resueltos (tachados)
            if (problemasResueltos && problemasResueltos.length > 0) {
                problemasResueltos.forEach(prob => {
                    const li = document.createElement('li');
                    li.className = 'problema-resuelto';
                    li.innerHTML = `${prob} ✅`;
                    ul.appendChild(li);
                });
            }

            // Problemas pendientes
            if (problemas && problemas.length > 0) {
                problemas.forEach(prob => {
                    const li = document.createElement('li');
                    li.className = 'problema-pendiente';
                    li.textContent = prob;
                    ul.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.style.background = '#d4edda';
                li.style.color = '#155724';
                li.style.borderLeft = '4px solid #28a745';
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

    updateNavigationButtons(currentLayerId) {
        const btnSiguiente = document.getElementById('btn-siguiente');
        const btnAnterior = document.getElementById('btn-anterior');
        
        // Botón anterior
        if (currentLayerId > 1) {
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
            btnSiguiente.textContent = `Siguiente Layer (${currentLayerId + 1}/${this.maxLayers}) →`;
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
        if (this.currentLayer > 1) {
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
}

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
    new CasoUsoViewer(CASO_ID);
});

