let data = [];
let editingIndex = -1;
const CSV_PATH = 'plantillaSeguimiento/detallesUsuario.csv';

// ========== CONFIGURACIÓN GITHUB ==========
const GITHUB_CONFIG = {
    owner: 'JosePicalua',  // Tu usuario de GitHub
    repo: 'tesoreria.github.io',  // Nombre de tu repositorio
    branch: 'main',  // Rama principal
    token: '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',
    filePath: 'plantillaSeguimiento/detallesUsuario.csv'
};

// ========== GUARDAR EN GITHUB AUTOMÁTICAMENTE ==========
async function saveToGitHub() {
    try {
        showMessage('⏳ Guardando en GitHub...', 'info');

        // 1. Generar CSV
        const headers = [
            'nombreTitular',
            'numeroDocumento',
            'numeroInmobiliaria',
            'direccionPropiedad',
            'totalEndeudamiento',
            'oficioResolucionPersuacion',
            'resolucioncOCTributario',
            'resolucionOTMIPUMP',
            'resolucionMedidaCautera',
            'resolucionEmbargo',
            'fechaResolucionCOCTributario',
            'fechaResolucionOTMIPUMP',
            'fechaResolucionMedidaCautera',
            'fechaResolucionEmbargo',
            'observaciones'
        ];
        
        let csvContent = headers.join(',') + '\n';
        
        data.forEach(row => {
            const values = headers.map(header => {
                let value = String(row[header] || '');
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    value = '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            });
            csvContent += values.join(',') + '\n';
        });

        // 2. Obtener SHA del archivo actual
        const getFileUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}?ref=${GITHUB_CONFIG.branch}`;
        
        const getResponse = await fetch(getFileUrl, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        let sha = null;
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
        }

        // 3. Actualizar archivo en GitHub
        const updateUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`;
        
        const updateData = {
            message: `Actualización automática - ${new Date().toLocaleString('es-CO')}`,
            content: btoa(unescape(encodeURIComponent(csvContent))),
            branch: GITHUB_CONFIG.branch
        };

        if (sha) {
            updateData.sha = sha;
        }

        const updateResponse = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (updateResponse.ok) {
            showMessage('✅ Guardado automáticamente en GitHub', 'success');
            return true;
        } else {
            const errorData = await updateResponse.json();
            console.error('Error de GitHub:', errorData);
            showMessage('❌ Error al guardar en GitHub: ' + errorData.message, 'error');
            return false;
        }
        
    } catch (error) {
        console.error('Error al guardar en GitHub:', error);
        showMessage('❌ Error de conexión con GitHub', 'error');
        return false;
    }
}

// ========== GUARDAR DATOS (LOCALSTORAGE + GITHUB) ==========
async function saveDataInternally() {
    try {
        // 1. Guardar en localStorage inmediatamente
        localStorage.setItem('csvData', JSON.stringify(data));
        actualizarTotalCartera();
        
        // 2. Guardar en GitHub en segundo plano
        await saveToGitHub();
        
    } catch (error) {
        console.error('Error al guardar:', error);
        showMessage('⚠️ Guardado solo en navegador (sin sincronizar con GitHub)', 'warning');
    }
}

// ========== CARGAR CSV DESDE GITHUB ==========
async function loadCSVData() {
    try {
        // Intentar cargar desde GitHub
        const response = await fetch(`https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${CSV_PATH}?t=${Date.now()}`);
        
        if (!response.ok) {
            throw new Error('No se pudo cargar el CSV desde GitHub');
        }
        
        const text = await response.text();
        const rows = text.split('\n').filter(row => row.trim());
        
        if (rows.length <= 1) {
            // CSV vacío, intentar cargar desde localStorage
            const savedData = localStorage.getItem('csvData');
            if (savedData) {
                data = JSON.parse(savedData);
                showMessage('✅ Datos cargados desde navegador: ' + data.length + ' registros', 'success');
            } else {
                data = [];
                showMessage('📄 CSV vacío - Listo para agregar registros', 'success');
            }
            renderTable();
            actualizarTotalCartera();
            return;
        }

        // Parsear CSV
        const loadedData = [];
        for (let i = 1; i < rows.length; i++) {
            const values = parseCSVLine(rows[i]);
            
            const rowData = {
                nombreTitular: values[0] || '',
                numeroDocumento: values[1] || '',
                numeroInmobiliaria: values[2] || '',
                direccionPropiedad: values[3] || '',
                totalEndeudamiento: values[4] || '',
                oficioResolucionPersuacion: values[5] || '',
                resolucioncOCTributario: values[6] || '',
                resolucionOTMIPUMP: values[7] || '',
                resolucionMedidaCautera: values[8] || '',
                resolucionEmbargo: values[9] || '',
                fechaResolucionCOCTributario: values[10] || '',
                fechaResolucionOTMIPUMP: values[11] || '',
                fechaResolucionMedidaCautera: values[12] || '',
                fechaResolucionEmbargo: values[13] || '',
                observaciones: values[14] || ''
            };
            loadedData.push(rowData);
        }

        data = loadedData;
        localStorage.setItem('csvData', JSON.stringify(data));
        showMessage('✅ CSV cargado desde GitHub: ' + data.length + ' registros', 'success');

        renderTable();
        actualizarTotalCartera();
        
    } catch (error) {
        console.error('Error al cargar CSV:', error);
        
        // Si falla, intentar cargar desde localStorage
        const savedData = localStorage.getItem('csvData');
        if (savedData) {
            data = JSON.parse(savedData);
            showMessage('✅ Datos cargados desde navegador: ' + data.length + ' registros', 'success');
        } else {
            data = [];
            showMessage('⚠️ No se pudo cargar el CSV - Empezando vacío', 'warning');
        }
        
        renderTable();
        actualizarTotalCartera();
    }
}

// ========== PARSER CSV ==========
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    
    return result;
}

// ========== EXPORTAR CSV MANUAL (BACKUP) ==========
function exportToCSV() {
    try {
        const headers = [
            'nombreTitular',
            'numeroDocumento',
            'numeroInmobiliaria',
            'direccionPropiedad',
            'totalEndeudamiento',
            'oficioResolucionPersuacion',
            'resolucioncOCTributario',
            'resolucionOTMIPUMP',
            'resolucionMedidaCautera',
            'resolucionEmbargo',
            'fechaResolucionCOCTributario',
            'fechaResolucionOTMIPUMP',
            'fechaResolucionMedidaCautera',
            'fechaResolucionEmbargo',
            'observaciones'
        ];
        
        let csv = headers.join(',') + '\n';
        
        data.forEach(row => {
            const values = headers.map(header => {
                let value = String(row[header] || '');
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    value = '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            });
            csv += values.join(',') + '\n';
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'detallesUsuario_backup.csv';
        link.click();
        
        showMessage('📥 CSV exportado como respaldo', 'success');
        
    } catch (error) {
        console.error('Error al exportar:', error);
        showMessage('❌ Error al exportar', 'error');
    }
}

// ========== FORMULARIO BÁSICO ==========
const basicForm = document.getElementById('basicForm');
if (basicForm) {
    basicForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            nombreTitular: document.getElementById('nombreTitular').value,
            numeroDocumento: document.getElementById('numeroDocumento').value,
            numeroInmobiliaria: document.getElementById('numeroInmobiliaria').value,
            direccionPropiedad: document.getElementById('direccionPropiedad').value,
            totalEndeudamiento: document.getElementById('totalEndeudamiento').value,
            oficioResolucionPersuacion: document.getElementById('oficioResolucionPersuacion').value,
            resolucioncOCTributario: '',
            resolucionOTMIPUMP: '',
            resolucionMedidaCautera: '',
            resolucionEmbargo: '',
            fechaResolucionCOCTributario: '',
            fechaResolucionOTMIPUMP: '',
            fechaResolucionMedidaCautera: '',
            fechaResolucionEmbargo: '',
            observaciones: ''
        };

        data.push(formData);
        await saveDataInternally();
        clearBasicForm();
        renderTable();
        showMessage('✅ Registro agregado y sincronizado con GitHub', 'success');
    });
}

function clearBasicForm() {
    const form = document.getElementById('basicForm');
    if (form) {
        form.reset();
    }
}

// ========== RENDERIZAR TABLA ==========
function renderTable() {
    const tbody = document.getElementById('tableBody');
    const tableSection = document.querySelector('.table-section');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (data.length === 0) {
        if (tableSection) {
            tableSection.style.display = 'none';
        }
        actualizarTotalCartera();
        return;
    }

    if (tableSection) {
        tableSection.style.display = 'block';
    }

    data.forEach((row, index) => {
        const isComplete = row.resolucioncOCTributario || row.resolucionOTMIPUMP || 
                          row.resolucionMedidaCautera || row.resolucionEmbargo;
        
        const tr = document.createElement('tr');
        tr.className = isComplete ? 'status-complete' : 'status-incomplete';
        tr.innerHTML = `
            <td>
                ${isComplete ? 
                    '<span class="badge badge-success">✓ Completo</span>' : 
                    '<span class="badge badge-warning">⚠ Básico</span>'}
            </td>
            <td><strong>${row.nombreTitular}</strong></td>
            <td>${row.numeroDocumento}</td>
            <td>${row.numeroInmobiliaria || '-'}</td>
            <td>${row.direccionPropiedad || '-'}</td>
            <td>${row.totalEndeudamiento ? '$' + parseFloat(row.totalEndeudamiento).toLocaleString('es-CO') : '-'}</td>
            <td>${row.oficioResolucionPersuacion || '-'}</td>
            <td>${row.fechaOficioResolucionPersuacion || '-'}</td>
            <td>${row.resolucioncOCTributario ? '✓' : '-'}</td>
            <td>${row.resolucionOTMIPUMP ? '✓' : '-'}</td>
            <td>${row.resolucionMedidaCautera ? '✓' : '-'}</td>
            <td>${row.resolucionEmbargo ? '✓' : '-'}</td>
            <td>
                <button class="btn-complete" onclick="completeData(${index})">➕ Completar</button>
                <button class="btn-delete" onclick="deleteRow(${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    actualizarTotalCartera();
}

// ========== COMPLETAR DATOS ==========
function completeData(index) {
    editingIndex = index;
    const row = data[index];

    const modal = document.getElementById('completeModal');
    if (!modal) {
        showMessage('⚠️ Error: Modal no encontrado', 'error');
        return;
    }

    const fields = [
        { input: 'modal_resolucioncOCTributario', value: row.resolucioncOCTributario },
        { input: 'modal_fechaResolucionCOCTributario', value: row.fechaResolucionCOCTributario },
        { input: 'modal_resolucionOTMIPUMP', value: row.resolucionOTMIPUMP },
        { input: 'modal_fechaResolucionOTMIPUMP', value: row.fechaResolucionOTMIPUMP },
        { input: 'modal_resolucionMedidaCautera', value: row.resolucionMedidaCautera },
        { input: 'modal_fechaResolucionMedidaCautera', value: row.fechaResolucionMedidaCautera },
        { input: 'modal_resolucionEmbargo', value: row.resolucionEmbargo },
        { input: 'modal_fechaResolucionEmbargo', value: row.fechaResolucionEmbargo },
        { input: 'modal_observaciones', value: row.observaciones }
    ];

    fields.forEach(field => {
        const input = document.getElementById(field.input);
        if (input) {
            input.value = field.value || '';
            
            if (field.value && field.value.trim() !== '') {
                input.readOnly = true;
                input.style.background = '#e9ecef';
                input.style.cursor = 'not-allowed';
            } else {
                input.readOnly = false;
                input.style.background = 'white';
                input.style.cursor = 'text';
            }
        }
    });

    modal.style.display = 'block';
}

const completeForm = document.getElementById('completeForm');
if (completeForm) {
    completeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (editingIndex >= 0) {
            data[editingIndex].resolucioncOCTributario = document.getElementById('modal_resolucioncOCTributario').value;
            data[editingIndex].fechaResolucionCOCTributario = document.getElementById('modal_fechaResolucionCOCTributario').value;
            data[editingIndex].resolucionOTMIPUMP = document.getElementById('modal_resolucionOTMIPUMP').value;
            data[editingIndex].fechaResolucionOTMIPUMP = document.getElementById('modal_fechaResolucionOTMIPUMP').value;
            data[editingIndex].resolucionMedidaCautera = document.getElementById('modal_resolucionMedidaCautera').value;
            data[editingIndex].fechaResolucionMedidaCautera = document.getElementById('modal_fechaResolucionMedidaCautera').value;
            data[editingIndex].resolucionEmbargo = document.getElementById('modal_resolucionEmbargo').value;
            data[editingIndex].fechaResolucionEmbargo = document.getElementById('modal_fechaResolucionEmbargo').value;
            data[editingIndex].observaciones = document.getElementById('modal_observaciones').value;

            await saveDataInternally();
            renderTable();
            closeModal();
            showMessage('✅ Información actualizada y sincronizada con GitHub', 'success');
        }
    });
}

function closeModal() {
    const modal = document.getElementById('completeModal');
    if (modal) {
        modal.style.display = 'none';
    }
    editingIndex = -1;
}

async function deleteRow(index) {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
        data.splice(index, 1);
        await saveDataInternally();
        renderTable();
        showMessage('🗑️ Registro eliminado y sincronizado con GitHub', 'success');
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('completeModal');
    if (event.target == modal) {
        closeModal();
    }
}

async function toggleApp() {
    const mainContent = document.getElementById('mainContent');
    const toggleBtn = document.getElementById('toggleMainBtn');

    if (mainContent && toggleBtn) {
        if (mainContent.style.display === "none") {
            await loadCSVData();
            
            mainContent.style.display = "block";
            toggleBtn.innerHTML = "👁️ Ocultar Tabla y Formulario";
            toggleBtn.classList.replace('btn-primary', 'btn-secondary');
        } else {
            mainContent.style.display = "none";
            toggleBtn.innerHTML = "➕ Agregar Titular";
            toggleBtn.classList.replace('btn-secondary', 'btn-primary');
        }
    }
}

// ========== ACTUALIZAR TOTAL CARTERA ==========
function actualizarTotalCartera() {
    let total = 0;
    
    data.forEach(row => {
        const valor = parseFloat(row.totalEndeudamiento) || 0;
        total += valor;
    });
    
    const totalCarteraDiv = document.getElementById('totalCartera');
    if (totalCarteraDiv) {
        totalCarteraDiv.textContent = '$' + total.toLocaleString('es-CO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
}

function showMessage(text, type) {
    const msg = document.getElementById('message');
    if (msg) {
        msg.textContent = text;
        msg.className = 'message ' + type;
        msg.style.display = 'block';
        setTimeout(() => {
            msg.style.display = 'none';
        }, 5000);
    }
}