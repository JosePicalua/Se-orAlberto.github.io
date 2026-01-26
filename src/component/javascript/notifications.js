// ============================================
// SISTEMA DE NOTIFICACIONES Y CONTROL DE FLUJO
// Archivo: notifications.js
// ============================================

let formData = {};

// ============================================
// MODALES BÁSICOS
// ============================================

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

// ============================================
// MODAL PERSONALIZADO PARA CITACIÓN
// ============================================

function mostrarModalCitacion() {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.id = 'modalCitacionCustom';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 35px;
                border-radius: 12px;
                max-width: 500px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                animation: slideUp 0.3s ease;
            ">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <div style="
                        width: 50px;
                        height: 50px;
                        background: #27ae60;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 28px;
                        margin-right: 15px;
                    ">✓</div>
                    <h3 style="margin: 0; color: #2c3e50; font-size: 20px;">Mandamiento Generado</h3>
                </div>
                
                <p style="color: #555; line-height: 1.6; margin: 15px 0;">
                    El PDF del <strong>Mandamiento de Pago</strong> se ha generado exitosamente.
                </p>
                
                <div style="
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #3498db;
                ">
                    <p style="color: #555; line-height: 1.6; margin: 0;">
                        ¿Desea generar ahora el <strong>PDF de Citación</strong>?
                    </p>
                </div>
                
                <div style="display: flex; gap: 12px; margin-top: 25px; justify-content: flex-end;">
                    <button id="btnCitacionNo" style="
                        padding: 12px 24px;
                        background: #95a5a6;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 15px;
                        font-weight: 500;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#7f8c8d'" onmouseout="this.style.background='#95a5a6'">
                        No, solo Mandamiento
                    </button>
                    <button id="btnCitacionSi" style="
                        padding: 12px 24px;
                        background: #27ae60;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 15px;
                        font-weight: 500;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#229954'" onmouseout="this.style.background='#27ae60'">
                        ✓ Sí, generar Citación
                    </button>
                </div>
            </div>
        `;
        
        // Agregar animaciones
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(modal);
        
        document.getElementById('btnCitacionSi').onclick = () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
            resolve(true);
        };
        
        document.getElementById('btnCitacionNo').onclick = () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
            resolve(false);
        };
    });
}

// ============================================
// LOADING OVERLAY
// ============================================

function showLoading(mensaje = 'Generando PDF...') {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.75);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            animation: fadeIn 0.2s ease;
        `;
        overlay.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            ">
                <div style="
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <p id="loadingMessage" style="
                    color: #2c3e50;
                    font-weight: 600;
                    font-size: 16px;
                    margin: 0;
                ">${mensaje}</p>
            </div>
        `;
        document.body.appendChild(overlay);
        
        const style = document.createElement('style');
        style.id = 'loadingStyles';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    overlay.style.display = 'flex';
    
    const messageEl = document.getElementById('loadingMessage');
    if (messageEl) {
        messageEl.textContent = mensaje;
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ============================================
// MENSAJES DE ÉXITO Y ERROR
// ============================================

function showSuccessMessage(incluyeCitacion) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
        animation: fadeIn 0.2s ease;
    `;
    
    const contenido = incluyeCitacion 
        ? `
            <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
            <h3 style="margin: 0 0 15px 0; color: #27ae60; font-size: 22px;">PDFs Generados Exitosamente</h3>
            <div style="text-align: left; margin: 20px 0;">
                <div style="margin: 8px 0; font-size: 16px;">📄 Mandamiento de Pago</div>
                <div style="margin: 8px 0; font-size: 16px;">📄 Citación</div>
            </div>
            <p style="color: #7f8c8d; margin: 20px 0 0 0;">El formulario ha sido limpiado.</p>
        `
        : `
            <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
            <h3 style="margin: 0 0 15px 0; color: #27ae60; font-size: 22px;">PDF Generado Exitosamente</h3>
            <div style="text-align: left; margin: 20px 0;">
                <div style="margin: 8px 0; font-size: 16px;">📄 Mandamiento de Pago</div>
            </div>
            <p style="color: #7f8c8d; margin: 20px 0 0 0;">El formulario ha sido limpiado.</p>
        `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 40px;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            animation: slideUp 0.3s ease;
        ">
            ${contenido}
            <button id="btnCerrarExito" style="
                margin-top: 25px;
                padding: 12px 32px;
                background: #27ae60;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 15px;
                font-weight: 500;
                transition: all 0.2s;
            " onmouseover="this.style.background='#229954'" onmouseout="this.style.background='#27ae60'">
                Aceptar
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('btnCerrarExito').onclick = () => {
        document.body.removeChild(modal);
    };
    
    setTimeout(() => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    }, 5000);
}

function showErrorMessage(errorDetalle = '') {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
        animation: fadeIn 0.2s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 40px;
            border-radius: 12px;
            text-align: center;
            max-width: 450px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            animation: slideUp 0.3s ease;
        ">
            <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
            <h3 style="margin: 0 0 15px 0; color: #e74c3c; font-size: 22px;">Error al Generar PDFs</h3>
            ${errorDetalle ? `<p style="color: #555; margin: 15px 0; font-size: 14px; background: #f8f9fa; padding: 12px; border-radius: 6px;">${errorDetalle}</p>` : ''}
            <p style="color: #7f8c8d; margin: 20px 0 0 0;">Por favor, intente nuevamente.</p>
            <button id="btnCerrarError" style="
                margin-top: 25px;
                padding: 12px 32px;
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 15px;
                font-weight: 500;
                transition: all 0.2s;
            " onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'">
                Cerrar
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('btnCerrarError').onclick = () => {
        document.body.removeChild(modal);
    };
}

// ============================================
// VALIDACIÓN Y CONFIRMACIÓN
// ============================================

document.getElementById('coactivoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
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
        <div class="confirm-data-item"><strong>Número de Mandamiento:</strong> OTMIPUMP2026${formData.numeroMandamiento}</div>
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

// ============================================
// FUNCIÓN PRINCIPAL - GENERACIÓN DE PDFs
// ============================================

async function confirmGenerate() {
    closeModal('confirm');
    
    try {
        console.log('=== INICIANDO PROCESO DE GENERACIÓN ===');
        
        // 1. Generar Mandamiento de Pago
        showLoading('Generando Mandamiento de Pago...');
        await generarPDF();
        hideLoading();
        
        console.log('✅ Mandamiento de Pago generado');
        
        // 2. Preguntar con modal personalizado (NO BLOQUEANTE)
        const generarCitacion = await mostrarModalCitacion();
        
        if (generarCitacion) {
            console.log('Usuario eligió generar Citación');
            showLoading('Generando Citación...');
            await generarPDFCitacion();
            hideLoading();
            console.log('✅ Citación generada');
        } else {
            console.log('Usuario eligió NO generar Citación');
        }
        
        // 3. Limpiar y mostrar éxito
        cleanForm();
        showSuccessMessage(generarCitacion);
        
    } catch (error) {
        console.error('❌ Error en confirmGenerate:', error);
        hideLoading();
        showErrorMessage(error.message || 'Error desconocido');
    }
}

// ============================================
// LIMPIEZA DE FORMULARIO
// ============================================

function cleanForm() {
    console.log('=== LIMPIANDO FORMULARIO ===');
    
    document.getElementById('coactivoForm').reset();
    formData = {};
    
    const errorInputs = document.querySelectorAll('.error');
    errorInputs.forEach(input => input.classList.remove('error'));
    
    const errorMessages = document.querySelectorAll('.error-message.show');
    errorMessages.forEach(msg => msg.classList.remove('show'));
    
    setTimeout(() => {
        const inputs = document.querySelectorAll('#coactivoForm input, #coactivoForm textarea');
        inputs.forEach(input => {
            input.value = '';
        });
    }, 100);
}

// ============================================
// CERRAR MODALES AL HACER CLIC FUERA
// ============================================

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}