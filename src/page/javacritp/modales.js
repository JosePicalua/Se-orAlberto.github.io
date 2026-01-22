
function openModalBancaria(modalType) {
    if (modalType === 'notificacionBancaria') {
        // Verificar si ya existe un modal y eliminarlo
        const existingModal = document.getElementById('modalOverlay');
        if (existingModal) {
            existingModal.remove();
        }

        // Crear overlay del modal
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'modalOverlay';
        modalOverlay.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-container">
                    <button class="modal-close" onclick="this.closest('#modalOverlay').remove()">✕</button>
                    <iframe src="src/page/certificadoEmbargo.html" frameborder="0"></iframe>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);
    }
}


function openModalPersuasivo(modalType__) {
    if (modalType__ === 'notificacionPersuasivo') { 
        const existingModal = document.getElementById('modalOverlay_persuacivo');
        if (existingModal) {
            existingModal.remove();
        }

        const modalOverlay_persuacivo = document.createElement('div');
        modalOverlay_persuacivo.id = 'modalOverlay_persuacivo';
        modalOverlay_persuacivo.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            padding: 20px;
        `;
        
        modalOverlay_persuacivo.innerHTML = `
            <div class="modal-container" style="
                position: relative;
                background: white;
                border-radius: 8px;
                width: 100%;
                max-width: 950px;
                height: 90vh;
                max-height: 800px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                overflow: hidden;
            ">
                <button class="modal-close" onclick="this.closest('#modalOverlay_persuacivo').remove()" style="
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: #f44336;
                    color: white;
                    border: none;
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    font-size: 20px;
                    cursor: pointer;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: Arial, sans-serif;
                    line-height: 1;
                ">✕</button>
                <iframe src="src/page/notifiacionPERSUACIVO.html" frameborder="0" style="
                    width: 100%;
                    height: 100%;
                    border: none;
                "></iframe> 
            </div>
        `;

        document.body.appendChild(modalOverlay_persuacivo);
        
        // Prevenir scroll del body cuando el modal está abierto
        document.body.style.overflow = 'hidden';
        
        // Restaurar scroll al cerrar
        modalOverlay_persuacivo.addEventListener('click', function(e) {
            if (e.target === modalOverlay_persuacivo) {
                document.body.style.overflow = 'auto';
                modalOverlay_persuacivo.remove();
            }
        });
    }
}


function openModalResolucion() {
    // Eliminar modal anterior si existe
    const existing = document.getElementById("modalOverlay");
    if (existing) existing.remove();

    // Crear modal
    const modalOverlay = document.createElement("div");
    modalOverlay.id = "modalOverlay";

    modalOverlay.innerHTML = `
        <style>
            #modalOverlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.45);
                backdrop-filter: blur(4px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            }
            .modal-container {
                background: #fff;
                width: 80%;
                max-width: 900px;
                height: 80%;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 30px rgba(0,0,0,0.25);
                animation: fadeIn .25s ease;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid #ddd;
            }
            .modal-header h2 {
                margin: 0;
                font-size: 20px;
                color: #333;
            }
            .close-btn {
                background: #ff4d4d;
                color: white;
                border: none;
                font-size: 22px;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: .2s;
                box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            }
            .close-btn:hover {
                background: #d93636;
                transform: scale(1.05);
            }
            .modal-body {
                flex: 1;
                padding: 0;
            }
            .modal-iframe {
                width: 100%;
                height: 100%;
                border: none;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to   { opacity: 1; transform: scale(1); }
            }
        </style>

        <div class="modal-container">
            <div class="modal-header">
                <h2>Realizar Resolución</h2>
                <button class="close-btn" onclick="closeModal('resolucion')">&times;</button>
            </div>
            <div class="modal-body">
                <iframe class="modal-iframe" src="src/page/numeroResolucion.html"></iframe>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);
}




function openModalMedidaCautera() {
    // Eliminar modal anterior si existe
    const existing = document.getElementById("modalOverlay");
    if (existing) existing.remove();

    // Crear modal
    const modalOverlay = document.createElement("div");
    modalOverlay.id = "modalOverlay";

    modalOverlay.innerHTML = `
        <style>
            #modalOverlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.45);
                backdrop-filter: blur(4px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            }
            .modal-container {
                background: #fff;
                width: 80%;
                max-width: 900px;
                height: 80%;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 30px rgba(0,0,0,0.25);
                animation: fadeIn .25s ease;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid #ddd;
            }
            .modal-header h2 {
                margin: 0;
                font-size: 20px;
                color: #333;
            }
            .close-btn {
                background: #ff4d4d;
                color: white;
                border: none;
                font-size: 22px;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: .2s;
                box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            }
            .close-btn:hover {
                background: #d93636;
                transform: scale(1.05);
            }
            .modal-body {
                flex: 1;
                padding: 0;
            }
            .modal-iframe {
                width: 100%;
                height: 100%;
                border: none;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to   { opacity: 1; transform: scale(1); }
            }
        </style>

        <div class="modal-container">
            <div class="modal-header">
                <h2>Realizar Medida Cautelar de Embargo</h2>
                <button class="close-btn" onclick="closeModal('medidaCautelar')">&times;</button>
            </div>
            <div class="modal-body">
                <iframe class="modal-iframe" src="src/page/medidaEmbargo.html"></iframe>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);
}

function closeModal() {
    const modal = document.getElementById("modalOverlay");
    if (modal) modal.remove();
}
