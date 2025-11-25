let formData = {};

function openModal(type) {
    if (type === 'persuasivo') {
        document.getElementById('modalPersuasivo').classList.add('active');
    } else if (type === 'coactivo') {
        document.getElementById('modalCoactivo').classList.add('active');
    }
}

function closeModal(type) {
    if (type === 'persuasivo') {
        document.getElementById('modalPersuasivo').classList.remove('active');
    } else if (type === 'coactivo') {
        document.getElementById('modalCoactivo').classList.remove('active');
    } else if (type === 'confirm') {
        document.getElementById('modalConfirm').classList.remove('active');
    }
}

// Validación del formulario
document.getElementById('coactivoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Recolectar datos
    formData = {
        numeroMandamiento: document.getElementById('numeroMandamiento').value.trim(),
        numeroFactura: document.getElementById('numeroFactura').value.trim(),
        numeroCedula: document.getElementById('numeroCedula').value.trim(),
        nombreContribuyente: document.getElementById('nombreContribuyente').value.trim(),
        anosParafiscal: document.getElementById('anosParafiscal').value.trim(),
        numeroCatastro: document.getElementById('numeroCatastro').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        numeroInmobiliario: document.getElementById('numeroInmobiliario').value.trim(),
        totalDeuda: document.getElementById('totalDeuda').value.trim(),
        numeroRadicacion: document.getElementById('numeroRadicacion').value.trim()
    };

    // Validar todos los campos
    let isValid = true;
    const fields = [
        'numeroMandamiento', 'numeroFactura', 'numeroCedula', 
        'nombreContribuyente', 'anosParafiscal', 'numeroCatastro',
        'direccion', 'numeroInmobiliario', 'totalDeuda', 'numeroRadicacion'
    ];

    fields.forEach(field => {
        const input = document.getElementById(field);
        const errorMsg = document.getElementById('error' + field.charAt(0).toUpperCase() + field.slice(1));
        
        if (!formData[field]) {
            input.classList.add('error');
            if (errorMsg) errorMsg.classList.add('show');
            isValid = false;
        } else {
            input.classList.remove('error');
            if (errorMsg) errorMsg.classList.remove('show');
        }
    });

    if (isValid) {
        showConfirmation();
    }
});

function showConfirmation() {
    const confirmDataDiv = document.getElementById('confirmData');
    confirmDataDiv.innerHTML = `
        <div class="confirm-data-item"><strong>Número de Mandamiento:</strong> OTMIPUMP2025${formData.numeroMandamiento}</div>
        <div class="confirm-data-item"><strong>Número de Factura:</strong> ${formData.numeroFactura}</div>
        <div class="confirm-data-item"><strong>Número de Cédula:</strong> ${formData.numeroCedula}</div>
        <div class="confirm-data-item"><strong>Nombre del Contribuyente:</strong> ${formData.nombreContribuyente}</div>
        <div class="confirm-data-item"><strong>Años Parafiscal:</strong> ${formData.anosParafiscal}</div>
        <div class="confirm-data-item"><strong>Número Catastral:</strong> ${formData.numeroCatastro}</div>
        <div class="confirm-data-item"><strong>Dirección del Predio:</strong> ${formData.direccion}</div>
        <div class="confirm-data-item"><strong>Matrícula Inmobiliaria:</strong> ${formData.numeroInmobiliario}</div>
        <div class="confirm-data-item"><strong>Total de Deuda:</strong> ${formData.totalDeuda}</div>
        <div class="confirm-data-item"><strong>Número de Radicación:</strong> ${formData.numeroRadicacion}</div>
    `;
    
    closeModal('coactivo');
    document.getElementById('modalConfirm').classList.add('active');
}

function modifyData() {
    closeModal('confirm');
    openModal('coactivo');
}

async function confirmGenerate() {
    // Cerrar el modal de confirmación inmediatamente
    closeModal('confirm');
    
    // Mostrar loading ANTES de generar el PDF
    showLoading();
    
    try {
        // Esperar un momento para que el loading se muestre
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('Iniciando generación de PDF desde confirmGenerate...');
        
        // Generar el PDF - SIN await para que no espere
        generarPDF();
        
        // Esperar 3 segundos para que el usuario pueda interactuar con el diálogo de guardar
        setTimeout(() => {
            hideLoading();
            cleanForm();
            showSuccessMessage();
        }, 3000);
        
    } catch (error) {
        console.error('Error en confirmGenerate:', error);
        hideLoading();
        showErrorMessage();
    }
}

// FUNCIONES SIMPLES AUXILIARES
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

function showSuccessMessage() {
    // Mensaje simple de éxito
    setTimeout(() => {
        alert('PDF generado exitosamente. El formulario ha sido limpiado.');
    }, 500);
}

function showErrorMessage() {
    alert('Error al generar el PDF. Intente nuevamente.');
}

function cleanForm() {
    console.log('=== LIMPIANDO FORMULARIO ===');
    
    // Limpiar el formulario COMPLETAMENTE
    document.getElementById('coactivoForm').reset();
    
    // Limpiar el objeto formData
    formData = {};
    
    // Remover clases de error
    const errorInputs = document.querySelectorAll('.error');
    errorInputs.forEach(input => input.classList.remove('error'));
    
    const errorMessages = document.querySelectorAll('.error-message.show');
    errorMessages.forEach(msg => msg.classList.remove('show'));
    
    // Forzar limpieza de valores
    setTimeout(() => {
        const inputs = document.querySelectorAll('#coactivoForm input, #coactivoForm textarea');
        inputs.forEach(input => {
            input.value = '';
        });
    }, 100);
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}