let data = [];
        let editingIndex = -1;

        window.addEventListener('DOMContentLoaded', () => {
            loadData();
            renderTable();
        });

        function loadData() {
            const saved = localStorage.getItem('resolucionesData');
            if (saved) {
                data = JSON.parse(saved);
            }
        }

        function saveData() {
            localStorage.setItem('resolucionesData', JSON.stringify(data));
        }

        function showMessage(text, type) {
            const msg = document.getElementById('message');
            msg.textContent = text;
            msg.className = 'message ' + type;
            msg.style.display = 'block';
            setTimeout(() => {
                msg.style.display = 'none';
            }, 3000);
        }

        document.getElementById('basicForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                nombreTitular: document.getElementById('nombreTitular').value,
                numeroDocumento: document.getElementById('numeroDocumento').value,
                numeroInmobiliaria: document.getElementById('numeroInmobiliaria').value,
                direccionPropiedad: document.getElementById('direccionPropiedad').value,
                totalEndeudamiento: document.getElementById('totalEndeudamiento').value,
                oficioResolucionPersuacion: document.getElementById('oficioResolucionPersuacion').value,
                fechaOficioResolucionPersuacion: document.getElementById('fechaOficioResolucionPersuacion').value,
                resolucioncOCTributario: '',
                fechaCOCTributario: '',
                resolucionOTMIPUMP: '',
                fechaOTMIPUMP: '',
                resolucionMedidaCautera: '',
                fecharesolucionMedidaCautera: '',
                resolucionEmbargo: '',
                fecharesolucionEmbargo: ''
            };

            data.push(formData);
            saveData();
            clearBasicForm();
            renderTable();
            showMessage('✅ Registro básico agregado. Puedes completarlo después desde la tabla.', 'success');
        });

        function clearBasicForm() {
            document.getElementById('basicForm').reset();
        }

        function renderTable() {
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = '';

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
                    <td>${row.totalEndeudamiento ? '$' + parseFloat(row.totalEndeudamiento).toLocaleString() : '-'}</td>
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
        }

        function completeData(index) {
            editingIndex = index;
            const row = data[index];

            // Cargar valores y bloquear campos que ya tienen datos
            const fields = [
                { input: 'modal_resolucioncOCTributario', value: row.resolucioncOCTributario },
                { input: 'modal_fechaCOCTributario', value: row.fechaCOCTributario },
                { input: 'modal_resolucionOTMIPUMP', value: row.resolucionOTMIPUMP },
                { input: 'modal_fechaOTMIPUMP', value: row.fechaOTMIPUMP },
                { input: 'modal_resolucionMedidaCautera', value: row.resolucionMedidaCautera },
                { input: 'modal_fecharesolucionMedidaCautera', value: row.fecharesolucionMedidaCautera },
                { input: 'modal_resolucionEmbargo', value: row.resolucionEmbargo },
                { input: 'modal_fecharesolucionEmbargo', value: row.fecharesolucionEmbargo }
            ];

            fields.forEach(field => {
                const input = document.getElementById(field.input);
                input.value = field.value || '';
                
                // Bloquear si ya tiene datos
                if (field.value && field.value.trim() !== '') {
                    input.readOnly = true;
                    input.style.background = '#e9ecef';
                    input.style.cursor = 'not-allowed';
                } else {
                    input.readOnly = false;
                    input.style.background = 'white';
                    input.style.cursor = 'text';
                }
            });

            document.getElementById('completeModal').style.display = 'block';
        }

        document.getElementById('completeForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (editingIndex >= 0) {
                data[editingIndex].resolucioncOCTributario = document.getElementById('modal_resolucioncOCTributario').value;
                data[editingIndex].fechaCOCTributario = document.getElementById('modal_fechaCOCTributario').value;
                data[editingIndex].resolucionOTMIPUMP = document.getElementById('modal_resolucionOTMIPUMP').value;
                data[editingIndex].fechaOTMIPUMP = document.getElementById('modal_fechaOTMIPUMP').value;
                data[editingIndex].resolucionMedidaCautera = document.getElementById('modal_resolucionMedidaCautera').value;
                data[editingIndex].fecharesolucionMedidaCautera = document.getElementById('modal_fecharesolucionMedidaCautera').value;
                data[editingIndex].resolucionEmbargo = document.getElementById('modal_resolucionEmbargo').value;
                data[editingIndex].fecharesolucionEmbargo = document.getElementById('modal_fecharesolucionEmbargo').value;

                saveData();
                renderTable();
                closeModal();
                showMessage('✅ Información adicional guardada correctamente', 'success');
            }
        });

        function closeModal() {
            document.getElementById('completeModal').style.display = 'none';
            editingIndex = -1;
        }

        function deleteRow(index) {
            if (confirm('¿Estás seguro de eliminar este registro?')) {
                data.splice(index, 1);
                saveData();
                renderTable();
                showMessage('🗑️ Registro eliminado', 'success');
            }
        }

        function downloadExcel() {
            if (data.length === 0) {
                showMessage('⚠️ No hay datos para exportar', 'error');
                return;
            }

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Resoluciones');
            XLSX.writeFile(wb, 'detalladaResoluciones.xlsx');
            showMessage('📥 Excel descargado correctamente', 'success');
        }

        window.onclick = function(event) {
            const modal = document.getElementById('completeModal');
            if (event.target == modal) {
                closeModal();
            }
        }



function toggleApp() {
    const mainContent = document.getElementById('mainContent');
    const toggleBtn = document.getElementById('toggleMainBtn');

    if (mainContent.style.display === "none") {
        // Mostrar contenido
        mainContent.style.display = "block";
        toggleBtn.innerHTML = "👁️ Ocultar Tabla y Formulario";
        toggleBtn.classList.replace('btn-primary', 'btn-secondary'); // Cambia color si deseas
    } else {
        // Ocultar contenido
        mainContent.style.display = "none";
        toggleBtn.innerHTML = "➕ Agregar Titular";
        toggleBtn.classList.replace('btn-secondary', 'btn-primary');
    }
}