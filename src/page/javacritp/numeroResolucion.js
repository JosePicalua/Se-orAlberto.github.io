// Variables globales para almacenar las vigencias
let vigenciaActualGuardada = null;
let vigenciasAntiguasGuardadas = [];

// Función para mostrar/ocultar formularios
function mostrarFormulario(tipo) {
    const wrapperActual = document.getElementById('wrapperActual');
    const wrapperAntiguo = document.getElementById('wrapperAntiguo');
    const buttons = document.querySelectorAll('.toggle-btn');
    
    if (tipo === 'actual') {
        wrapperActual.classList.add('active');
        wrapperAntiguo.classList.remove('active');
        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
    } else {
        wrapperActual.classList.remove('active');
        wrapperAntiguo.classList.add('active');
        buttons[0].classList.remove('active');
        buttons[1].classList.add('active');
    }
}

// Función para calcular total de Vigencia Actual
function calcularTotalActual() {
    const tabla = document.getElementById('conceptoVigenciaActual');
    const inputs = tabla.querySelectorAll('input[type="number"]:not([readonly])');
    const totalInput = tabla.querySelector('input[name="total"]');
    
    let suma = 0;
    inputs.forEach(input => {
        const valor = parseFloat(input.value) || 0;
        suma += valor;
    });
    
    totalInput.value = suma;
    actualizarSumaTotal();
}

// Función para calcular totales de Vigencia Antigua
function calcularTotalAntiguo() {
    const tabla = document.getElementById('conceptoVigenciaAntiguo');
    const fila = tabla.querySelector('tr:last-child');
    
    // Calcular Sub-Total (Predial + Sobretasa Ambiente + Sobretasa Bomberil)
    const predial = parseFloat(fila.querySelector('input[name="predial_antiguo"]').value) || 0;
    const sobretasaAmbiente = parseFloat(fila.querySelector('input[name="sobretasa_ambiente_antiguo"]').value) || 0;
    const sobretasaBomberil = parseFloat(fila.querySelector('input[name="sobretasa_bomberil_antiguo"]').value) || 0;
    const subTotal = predial + sobretasaAmbiente + sobretasaBomberil;
    fila.querySelector('input[name="sub_total_antiguo"]').value = subTotal;
    
    // Calcular Total (Sub-Total + Mora Predial + Mora Sobretasa Ambiente)
    const moraPredial = parseFloat(fila.querySelector('input[name="mora_predial"]').value) || 0;
    const moraSobretasa = parseFloat(fila.querySelector('input[name="mora_sobretasa_ambiente"]').value) || 0;
    const total = subTotal + moraPredial + moraSobretasa;
    fila.querySelector('input[name="total_antiguo"]').value = total;
    
    actualizarSumaTotal();
}

// Función para actualizar la suma total global
function actualizarSumaTotal() {
    let sumaTotal = 0;
    
    // Sumar vigencia actual si existe
    if (vigenciaActualGuardada) {
        sumaTotal += vigenciaActualGuardada.total;
    }
    
    // Sumar todas las vigencias antiguas
    vigenciasAntiguasGuardadas.forEach(vigencia => {
        sumaTotal += vigencia.total;
    });
    
    document.getElementById('totalprecioUnificadoAntiguo').value = sumaTotal;
}

// Agregar listeners a los inputs de Vigencia Actual
function inicializarVigenciaActual() {
    const tabla = document.getElementById('conceptoVigenciaActual');
    const inputs = tabla.querySelectorAll('input[type="number"]:not([readonly])');
    
    inputs.forEach(input => {
        input.addEventListener('input', calcularTotalActual);
    });
}

// Agregar listeners a los inputs de Vigencia Antigua
function inicializarVigenciaAntigua() {
    const tabla = document.getElementById('conceptoVigenciaAntiguo');
    const inputs = tabla.querySelectorAll('input[type="number"]:not([readonly])');
    
    inputs.forEach(input => {
        input.addEventListener('input', calcularTotalAntiguo);
    });
}

// Manejar el envío del formulario de Vigencia Actual
document.getElementById('formVigenciaActual').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const tabla = document.getElementById('conceptoVigenciaActual');
    const inputs = tabla.querySelectorAll('input[type="number"]');
    const añoInput = document.getElementById('añoPredialFactura');
    
    const datos = {
        año: añoInput.value, // Siempre será "ACTUAL"
        predialUnificado: parseFloat(inputs[0].value) || 0,
        sobretasaAmbiente: parseFloat(inputs[1].value) || 0,
        sistematizacion: parseFloat(inputs[2].value) || 0,
        sobretasaBomberil: parseFloat(inputs[3].value) || 0,
        total: parseFloat(inputs[4].value) || 0
    };
    
    if (vigenciaActualGuardada) {
        // Modo edición
        if (confirm('¿Desea actualizar la Vigencia Actual?')) {
            vigenciaActualGuardada = datos;
            alert('Vigencia Actual actualizada correctamente');
            actualizarVistaPrevia();
        }
    } else {
        // Primer guardado
        vigenciaActualGuardada = datos;
        alert('Vigencia Actual guardada correctamente');
        // Cambiar el texto del botón
        document.querySelector('#formVigenciaActual button[type="submit"]').textContent = 'Actualizar Vigencia Actual';
        actualizarVistaPrevia();
    }
    
    actualizarSumaTotal();
});

// Función para actualizar la vista previa de vigencias antiguas
function actualizarVistaPrevia() {
    const contenedor = document.getElementById('listaVigenciasAntiguas');
    let html = '';
    
    // Primero muestra la Vigencia Actual (si existe)
    if (vigenciaActualGuardada) {
        html += `
            <div class="vigencia-card">
                <div class="vigencia-header">
                    <h4>Año: ACTUAL</h4>
                    <span class="badge-actual">Vigencia Actual</span>
                </div>
                <div class="vigencia-detalles">
                    <div class="detalle-item">
                        <span class="label">Predial Unificado:</span>
                        <span class="valor">$${vigenciaActualGuardada.predialUnificado.toLocaleString('es-CO')}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="label">Sobretasa Ambiente:</span>
                        <span class="valor">$${vigenciaActualGuardada.sobretasaAmbiente.toLocaleString('es-CO')}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="label">Sistematización:</span>
                        <span class="valor">$${vigenciaActualGuardada.sistematizacion.toLocaleString('es-CO')}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="label">Sobretasa Bomberil:</span>
                        <span class="valor">$${vigenciaActualGuardada.sobretasaBomberil.toLocaleString('es-CO')}</span>
                    </div>
                    <div class="detalle-item total">
                        <span class="label">TOTAL:</span>
                        <span class="valor">$${vigenciaActualGuardada.total.toLocaleString('es-CO')}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Luego muestra las Vigencias Antiguas (si existen)
    if (vigenciasAntiguasGuardadas.length > 0) {
        vigenciasAntiguasGuardadas.forEach((vigencia, index) => {
            html += `
                <div class="vigencia-card">
                    <div class="vigencia-header">
                        <h4>Año: ${vigencia.año}</h4>
                        <button class="btn-eliminar" onclick="eliminarVigencia(${index})">🗑️ Eliminar</button>
                    </div>
                    <div class="vigencia-detalles">
                        <div class="detalle-item">
                            <span class="label">Predial:</span>
                            <span class="valor">$${vigencia.predial.toLocaleString('es-CO')}</span>
                        </div>
                        <div class="detalle-item">
                            <span class="label">Sobretasa Ambiente:</span>
                            <span class="valor">$${vigencia.sobretasaAmbiente.toLocaleString('es-CO')}</span>
                        </div>
                        <div class="detalle-item">
                            <span class="label">Sobretasa Bomberil:</span>
                            <span class="valor">$${vigencia.sobretasaBomberil.toLocaleString('es-CO')}</span>
                        </div>
                        <div class="detalle-item subtotal">
                            <span class="label">Sub-Total:</span>
                            <span class="valor">$${vigencia.subTotal.toLocaleString('es-CO')}</span>
                        </div>
                        <div class="detalle-item">
                            <span class="label">Mora Predial:</span>
                            <span class="valor">$${vigencia.moraPredial.toLocaleString('es-CO')}</span>
                        </div>
                        <div class="detalle-item">
                            <span class="label">Mora Sobretasa Ambiente:</span>
                            <span class="valor">$${vigencia.moraSobretasa.toLocaleString('es-CO')}</span>
                        </div>
                        <div class="detalle-item total">
                            <span class="label">TOTAL:</span>
                            <span class="valor">$${vigencia.total.toLocaleString('es-CO')}</span>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    // Si no hay ninguna vigencia guardada
    if (!vigenciaActualGuardada && vigenciasAntiguasGuardadas.length === 0) {
        html = '<p class="no-vigencias">No hay vigencias guardadas</p>';
    }
    
    contenedor.innerHTML = html;
}

// Función para eliminar una vigencia antigua
function eliminarVigencia(index) {
    if (confirm('¿Está seguro de eliminar esta vigencia?')) {
        vigenciasAntiguasGuardadas.splice(index, 1);
        actualizarVistaPrevia();
        actualizarSumaTotal();
    }
}

// Manejar el envío del formulario de Vigencia Actual
document.getElementById('formVigenciaActual').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const tabla = document.getElementById('conceptoVigenciaActual');
    const inputs = tabla.querySelectorAll('input[type="number"]');
    
    const datos = {
        año: 'ACTUAL',
        predialUnificado: parseFloat(inputs[0].value) || 0,
        sobretasaAmbiente: parseFloat(inputs[1].value) || 0,
        sistematizacion: parseFloat(inputs[2].value) || 0,
        sobretasaBomberil: parseFloat(inputs[3].value) || 0,
        total: parseFloat(inputs[4].value) || 0
    };
    
    if (vigenciaActualGuardada) {
        if (confirm('¿Desea actualizar la Vigencia Actual?')) {
            vigenciaActualGuardada = datos;
            alert('Vigencia Actual actualizada correctamente');
            actualizarVistaPrevia();
        }
    } else {
        vigenciaActualGuardada = datos;
        alert('Vigencia Actual guardada correctamente');
        document.querySelector('#formVigenciaActual button[type="submit"]').textContent = 'Actualizar Vigencia Actual';
        actualizarVistaPrevia();
    }
    
    actualizarSumaTotal();
});

// Manejar el envío del formulario de Vigencias Antiguas
document.getElementById('formVigenciaAntiguo').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const tabla = document.getElementById('conceptoVigenciaAntiguo');
    const fila = tabla.querySelector('tr:last-child');
    const inputs = fila.querySelectorAll('input[type="number"]');
    const año = document.getElementById('añoPredialFacturaAntiguo').value;
    
    if (!año) {
        alert('Por favor ingrese el año de la vigencia');
        return;
    }
    
    const datos = {
        año: año,
        predial: parseFloat(inputs[0].value) || 0,
        sobretasaAmbiente: parseFloat(inputs[1].value) || 0,
        sobretasaBomberil: parseFloat(inputs[2].value) || 0,
        subTotal: parseFloat(inputs[3].value) || 0,
        moraPredial: parseFloat(inputs[4].value) || 0,
        moraSobretasa: parseFloat(inputs[5].value) || 0,
        total: parseFloat(inputs[6].value) || 0
    };
    
    vigenciasAntiguasGuardadas.push(datos);
    alert(`Vigencia Antigua ${año} guardada correctamente`);
    
    this.reset();
    calcularTotalAntiguo();
    actualizarSumaTotal();
    actualizarVistaPrevia();
});


// Función para calcular total de Vigencia Actual
// Función para calcular total de Vigencia Actual
function calcularTotalActual() {
    const tabla = document.getElementById('conceptoVigenciaActual');
    const fila = tabla.querySelector('tr:last-child');
    
    // Obtener cada input por su nombre específico
    const predialUnificado = parseFloat(fila.querySelector('input[name="predial_unificado"]').value) || 0;
    const sobretasaAmbiente = parseFloat(fila.querySelector('input[name="sobretasa_ambiente"]').value) || 0;
    const sistematizacion = parseFloat(fila.querySelector('input[name="sistematizacion"]').value) || 0;
    const sobretasaBomberil = parseFloat(fila.querySelector('input[name="sobretasa_bomberil"]').value) || 0;
    
    // Calcular el total
    const total = predialUnificado + sobretasaAmbiente + sistematizacion + sobretasaBomberil;
    
    // Asignar al campo total
    fila.querySelector('input[name="total"]').value = total;
    
    actualizarSumaTotal();
}



// Inicializar todo cuando cargue el DOM
document.addEventListener('DOMContentLoaded', function() {
    inicializarVigenciaActual();
    inicializarVigenciaAntigua();
    actualizarSumaTotal();
    actualizarVistaPrevia();
    
    // Hacer que el campo "añoPredialFactura" sea readonly
    document.getElementById('añoPredialFactura').setAttribute('readonly', true);
});

function closeModala(type) {
    try {
        const modal = document.getElementById('resolucion');
        
        if (modal) {
            // 1. ELIMINA ESTA LÍNEA (es la que causa el bloqueo):
            // modal.style.display = 'none'; 

            // 2. USA SOLO ESTA (asegúrate de que en tu CSS .active tenga display: block o flex)
            modal.classList.remove('active');
        }
    } catch (e) {
        console.error("Error al cerrar:", e);
    }
}

