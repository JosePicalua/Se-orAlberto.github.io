let data = [];
let editingIndex = -1;
const CSV_PATH = 'plantillaSeguimiento/detallesUsuario.csv';

// ========== CONFIGURACIÓN GITHUB (SEGURA) ==========
const GITHUB_CONFIG = {
    owner: 'JosePicalua',
    repo: 'tesoreria.github.io',
    branch: 'main',
    filePath: 'plantillaSeguimiento/detallesUsuario.csv',
    // Seguridad: Lee el token del navegador, no del código
    getToken: () => localStorage.getItem('gh_token_tesoreria')
};

// ========== GUARDAR EN GITHUB AUTOMÁTICAMENTE ==========
async function saveToGitHub() {
    try {
        showMessage('⏳ Guardando en GitHub...', 'info');

        // Verificar que hay token disponible
        const token = GITHUB_CONFIG.getToken();
        if (!token) {
            showMessage('⚠️ Token de GitHub no configurado. Guardado solo local.', 'warning');
            return false;
        }

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
                'Authorization': `token ${GITHUB_CONFIG.getToken()}`, // Nota: ahora es una función
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
                'Authorization': `token ${GITHUB_CONFIG.getToken()}`, // Nota: ahora es una función
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

// ========== RENDERIZAR TABLA CON COLORES POR FECHA ==========
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
        
        // Extraer y calcular días desde la fecha del oficio
        const daysSinceResolution = extractAndCalculateDays(row.oficioResolucionPersuacion);
        
        const tr = document.createElement('tr');
        
        // Aplicar color según días transcurridos
        if (daysSinceResolution === 'invalid') {
            // Fecha no reconocida - ROJO
            tr.className = 'row-red';
        } else if (daysSinceResolution !== null && typeof daysSinceResolution === 'number') {
            if (daysSinceResolution < 60) {
                tr.className = 'row-yellow'; // Menos de 60 días - Amarillo
            } else {
                tr.className = 'row-blue'; // 60 días o más - Azul
            }
        } else {
            // Si no hay fecha (campo vacío), usar el estilo por defecto según completitud
            tr.className = isComplete ? 'status-complete' : 'status-incomplete';
        }
        
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

// ========== FUNCIÓN PARA EXTRAER FECHA Y CALCULAR DÍAS ==========
// ========== MODIFICACIÓN 1: En la función extractAndCalculateDays ==========
// UBICACIÓN: Línea 390 aproximadamente
// REEMPLAZA la función completa con esta versión:

function extractAndCalculateDays(oficioText) {
    if (!oficioText || oficioText.trim() === '') {
        return null;
    }
    
    // Patrón para extraer fechas como "05 DE AGOSTO DE 2025"
    // Busca: DD DE MES DE AAAA
    const regexFecha = /(\d{1,2})\s+DE\s+([A-ZÁÉÍÓÚÑ]+)\s+DE\s+(\d{4})/i;
    const match = oficioText.match(regexFecha);
    
    if (!match) {
        return 'invalid'; // CAMBIO: Retorna 'invalid' en lugar de null
    }
    
    const dia = parseInt(match[1]);
    const mesTexto = match[2].toUpperCase();
    const anio = parseInt(match[3]);
    
    // Mapeo de meses en español a números
    const meses = {
        'ENERO': 0,
        'FEBRERO': 1,
        'MARZO': 2,
        'ABRIL': 3,
        'MAYO': 4,
        'JUNIO': 5,
        'JULIO': 6,
        'AGOSTO': 7,
        'SEPTIEMBRE': 8,
        'OCTUBRE': 9,
        'NOVIEMBRE': 10,
        'DICIEMBRE': 11
    };
    
    const mesNumero = meses[mesTexto];
    
    if (mesNumero === undefined) {
        return 'invalid'; // CAMBIO: Retorna 'invalid' en lugar de null
    }
    
    // Crear objeto Date con la fecha extraída
    const fechaResolucion = new Date(anio, mesNumero, dia);
    
    // Obtener fecha actual
    const fechaActual = new Date();
    
    // Calcular diferencia en milisegundos
    const diferenciaMilisegundos = fechaActual - fechaResolucion;
    
    // Convertir a días
    const diasTranscurridos = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
    
    return diasTranscurridos;
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

// ========== BÚSQUEDA POR NÚMERO DE DOCUMENTO CON FORMATO AUTOMÁTICO ==========
let currentSearchTerm = '';

function formatAndFilterDocument(input) {
    // Guardar la posición del cursor
    const cursorPosition = input.selectionStart;
    const previousLength = input.value.length;
    
    // Obtener solo los números (eliminar puntos y otros caracteres)
    let numbers = input.value.replace(/\D/g, '');
    
    // Formatear con puntos cada 3 dígitos
    let formatted = '';
    for (let i = 0; i < numbers.length; i++) {
        if (i > 0 && i % 3 === 0) {
            formatted = '.' + formatted;
        }
        formatted = numbers[numbers.length - 1 - i] + formatted;
    }
    
    // Actualizar el valor del input
    input.value = formatted;
    
    // Ajustar la posición del cursor
    const newLength = formatted.length;
    const diff = newLength - previousLength;
    input.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
    
    // Realizar la búsqueda
    filterByDocument();
}
function filterByDocument() {
    const searchInput = document.getElementById('searchDocument');

    // 🔥 SOLO números para buscar
    const rawSearch = searchInput.value.replace(/\D/g, '');
    currentSearchTerm = rawSearch;

    if (rawSearch === '') {
        renderTable();
        hideSearchInfo();
        return;
    }

    const filteredData = data.filter(row => {
        const doc = String(row.numeroDocumento || '').replace(/\D/g, '');
        return doc.includes(rawSearch);
    });

    renderFilteredTable(filteredData, searchInput.value);
    showSearchInfo(filteredData.length, searchInput.value);
}


function renderFilteredTable(filteredData, searchTerm) {
    const tbody = document.getElementById('tableBody');
    const tableSection = document.querySelector('.table-section');
    const noResults = document.getElementById('noResults');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (filteredData.length === 0) {
        if (noResults) {
            noResults.style.display = 'block';
        }
        return;
    }

    if (noResults) {
        noResults.style.display = 'none';
    }

    if (tableSection) {
        tableSection.style.display = 'block';
    }

    filteredData.forEach((row) => {
        // Encontrar el índice original en el array principal
        const originalIndex = data.indexOf(row);
        
        const isComplete = row.resolucioncOCTributario || row.resolucionOTMIPUMP || 
                          row.resolucionMedidaCautera || row.resolucionEmbargo;
        
        // Extraer y calcular días desde la fecha del oficio
        const daysSinceResolution = extractAndCalculateDays(row.oficioResolucionPersuacion);
        
        const tr = document.createElement('tr');
        
        // Aplicar color según días transcurridos
        if (daysSinceResolution === 'invalid') {
            // Fecha no reconocida - ROJO
            tr.className = 'row-red';
        } else if (daysSinceResolution !== null && typeof daysSinceResolution === 'number') {
            if (daysSinceResolution < 60) {
                tr.className = 'row-yellow'; // Menos de 60 días - Amarillo
            } else {
                tr.className = 'row-blue'; // 60 días o más - Azul
            }
        } else {
            // Si no hay fecha válida, usar el estilo por defecto según completitud
            tr.className = isComplete ? 'status-complete' : 'status-incomplete';
        }
        
        tr.innerHTML = `
            <td>
                ${isComplete ? 
                    '<span class="badge badge-success">✓ Completo</span>' : 
                    '<span class="badge badge-warning">⚠ Básico</span>'}
            </td>
            <td><strong>${row.nombreTitular}</strong></td>
            <td>${highlightedDoc}</td>
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
                <button class="btn-complete" onclick="completeData(${originalIndex})">➕ Completar</button>
                <button class="btn-delete" onclick="deleteRow(${originalIndex})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showSearchInfo(count, searchTerm) {
    const resultsInfo = document.getElementById('resultsInfo');
    const resultsCount = document.getElementById('resultsCount');
    
    if (resultsInfo && resultsCount) {
        resultsInfo.style.display = 'block';
        resultsCount.textContent = `📋 Se encontraron ${count} registro(s) con "${searchTerm}"`;
    }
}

function hideSearchInfo() {
    const resultsInfo = document.getElementById('resultsInfo');
    const noResults = document.getElementById('noResults');
    
    if (resultsInfo) {
        resultsInfo.style.display = 'none';
    }
    if (noResults) {
        noResults.style.display = 'none';
    }
}

function clearSearch() {
    const searchInput = document.getElementById('searchDocument');
    if (searchInput) {
        searchInput.value = '';
    }
    currentSearchTerm = '';
    renderTable();
    hideSearchInfo();
}

// ========== VERIFICACIÓN DE TOKEN AL CARGAR ==========
// Este bloque verifica si existe el token al cargar la página
window.addEventListener('load', () => {
    const token = GITHUB_CONFIG.getToken();
    
    if (!token) {
        // Mostrar un mensaje inicial
        showMessage('⚠️ Configuración requerida para sincronización con GitHub', 'warning');
        
        // Pedir el token después de un breve delay
        setTimeout(() => {
            const userToken = prompt(
                "🔑 Configuración Tesorería\n\n" +
                "Para habilitar el guardado automático en GitHub, pega tu Personal Access Token:\n\n" +
                "(Formato: ghp_...)\n\n" +
                "Si no tienes uno, presiona Cancelar para trabajar solo localmente."
            );
            
            if (userToken && userToken.trim()) {
                localStorage.setItem('gh_token_tesoreria', userToken.trim());
                showMessage('✅ Token guardado. Sincronización con GitHub habilitada.', 'success');
            } else {
                showMessage('ℹ️ Trabajando en modo local. Los datos se guardarán solo en tu navegador.', 'info');
            }
        }, 1000);
    } else {
        showMessage('✅ Sincronización con GitHub activa', 'success');
    }
});