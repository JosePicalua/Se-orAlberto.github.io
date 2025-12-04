const { jsPDF } = window.jspdf;

// Función para convertir número a letras
function numeroALetras(num) {
    const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    if (num === 0) return 'cero';
    if (num < 10) return unidades[num];
    if (num >= 10 && num < 20) return especiales[num - 10];
    if (num >= 20 && num < 100) {
        const dec = Math.floor(num / 10);
        const uni = num % 10;
        if (uni === 0) return decenas[dec];
        return decenas[dec] + ' y ' + unidades[uni];
    }
    if (num >= 100 && num < 1000) {
        const cent = Math.floor(num / 100);
        const resto = num % 100;
        if (num === 100) return 'cien';
        if (resto === 0) return centenas[cent];
        return centenas[cent] + ' ' + numeroALetras(resto);
    }
    if (num >= 1000 && num < 10000) {
        const mil = Math.floor(num / 1000);
        const resto = num % 1000;
        const milTexto = mil === 1 ? 'mil' : numeroALetras(mil) + ' mil';
        if (resto === 0) return milTexto;
        return milTexto + ' ' + numeroALetras(resto);
    }

    return num.toString();
}

function convertirPeriodoALetras(periodo) {
    const [anio1, anio2] = periodo.split('-').map(a => parseInt(a));
    return `dos mil ${numeroALetras(anio1 - 2000)} al año dos mil ${numeroALetras(anio2 - 2000)}`;
}

function obtenerFechaTexto() {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();
    
    return `${numeroALetras(dia)} (${dia}) día del mes de ${mes} año ${anio}`;
}

// Función mejorada para texto justificado
function textoJustificado(doc, texto, x, y, anchoMaximo, interlineado = 0.5) {
    const palabras = texto.split(' ');
    let linea = '';
    let lineas = [];
    
    // Dividir en líneas
    palabras.forEach(palabra => {
        const pruebaLinea = linea + (linea ? ' ' : '') + palabra;
        const anchoLinea = doc.getTextWidth(pruebaLinea);
        
        if (anchoLinea > anchoMaximo && linea) {
            lineas.push(linea);
            linea = palabra;
        } else {
            linea = pruebaLinea;
        }
    });
    
    if (linea) lineas.push(linea);
    
    // Renderizar líneas justificadas
    let yActual = y;
    lineas.forEach((lineaTexto, index) => {
        const esUltimaLinea = index === lineas.length - 1;
        
        if (esUltimaLinea) {
            // Última línea: alineada a la izquierda
            doc.text(lineaTexto, x, yActual);
        } else {
            // Justificar distribuyendo espacios
            const palabrasLinea = lineaTexto.split(' ');
            
            if (palabrasLinea.length === 1) {
                doc.text(lineaTexto, x, yActual);
            } else {
                const anchoTextoSinEspacios = palabrasLinea.reduce((sum, p) => sum + doc.getTextWidth(p), 0);
                const espacioTotal = anchoMaximo - anchoTextoSinEspacios;
                const espacioPorGap = espacioTotal / (palabrasLinea.length - 1);
                
                let xActual = x;
                palabrasLinea.forEach((palabra, i) => {
                    doc.text(palabra, xActual, yActual);
                    xActual += doc.getTextWidth(palabra) + espacioPorGap;
                });
            }
        }
        
        yActual += interlineado;
    });
    
    return yActual;
}

// Función CORREGIDA para texto justificado con partes en negrita
function textoJustificadoConNegrita(doc, partes, x, y, anchoMaximo, interlineado = 0.5) {
    // Construir texto completo
    let textoCompleto = partes.map(p => p.texto).join('');
    
    // Dividir en palabras manteniendo su índice en el texto original
    const palabras = [];
    let pos = 0;
    textoCompleto.split(' ').forEach(palabra => {
        palabras.push({
            texto: palabra,
            inicio: pos,
            fin: pos + palabra.length
        });
        pos += palabra.length + 1; // +1 por el espacio
    });
    
    // Determinar qué palabras son negritas
    palabras.forEach(palabra => {
        palabra.negrita = false;
        partes.forEach(parte => {
            if (!parte.negrita) return;
            
            const inicioParte = textoCompleto.indexOf(parte.texto);
            const finParte = inicioParte + parte.texto.length;
            
            // Si la palabra está dentro de una parte en negrita
            if (palabra.inicio >= inicioParte && palabra.fin <= finParte) {
                palabra.negrita = true;
            }
        });
    });
    
    // Agrupar palabras en líneas
    let linea = [];
    let lineas = [];
    
    palabras.forEach(palabra => {
        const textoLinea = [...linea, palabra].map(p => p.texto).join(' ');
        
        // Calcular ancho considerando el formato
        doc.setFont('helvetica', 'normal');
        let anchoLinea = 0;
        [...linea, palabra].forEach(p => {
            doc.setFont('helvetica', p.negrita ? 'bold' : 'normal');
            anchoLinea += doc.getTextWidth(p.texto);
        });
        anchoLinea += (linea.length) * doc.getTextWidth(' '); // espacios
        
        if (anchoLinea > anchoMaximo && linea.length > 0) {
            lineas.push([...linea]);
            linea = [palabra];
        } else {
            linea.push(palabra);
        }
    });
    
    if (linea.length > 0) lineas.push(linea);
    
    // Renderizar líneas justificadas
    let yActual = y;
    lineas.forEach((lineaPalabras, index) => {
        const esUltimaLinea = index === lineas.length - 1;
        
        if (esUltimaLinea || lineaPalabras.length === 1) {
            // Última línea o línea con una sola palabra: sin justificar
            let xActual = x;
            lineaPalabras.forEach((palabra, i) => {
                doc.setFont('helvetica', palabra.negrita ? 'bold' : 'normal');
                doc.text(palabra.texto, xActual, yActual);
                xActual += doc.getTextWidth(palabra.texto);
                if (i < lineaPalabras.length - 1) {
                    xActual += doc.getTextWidth(' ');
                }
            });
        } else {
            // Justificar
            let anchoTextoSinEspacios = 0;
            lineaPalabras.forEach(palabra => {
                doc.setFont('helvetica', palabra.negrita ? 'bold' : 'normal');
                anchoTextoSinEspacios += doc.getTextWidth(palabra.texto);
            });
            
            const espacioTotal = anchoMaximo - anchoTextoSinEspacios;
            const espacioPorGap = espacioTotal / (lineaPalabras.length - 1);
            
            let xActual = x;
            lineaPalabras.forEach((palabra, i) => {
                doc.setFont('helvetica', palabra.negrita ? 'bold' : 'normal');
                doc.text(palabra.texto, xActual, yActual);
                xActual += doc.getTextWidth(palabra.texto) + espacioPorGap;
            });
        }
        
        yActual += interlineado;
    });
    
    doc.setFont('helvetica', 'normal');
    return yActual;
}

function validarFormulario() {
    let valido = true;
    const campos = ['periodo', 'numeroOficio', 'contribuyente', 'cedula', 'referencia', 'direccion', 'valor'];
    
    campos.forEach(campo => {
        const input = document.getElementById(campo);
        const errorMsg = document.getElementById(campo + 'Error');
        
        if (!input.value.trim()) {
            input.classList.add('error');
            if (errorMsg) errorMsg.style.display = 'block';
            valido = false;
        } else {
            input.classList.remove('error');
            if (errorMsg) errorMsg.style.display = 'none';
        }
    });

    const periodo = document.getElementById('periodo').value;
    if (periodo && !/^\d{4}-\d{4}$/.test(periodo)) {
        document.getElementById('periodo').classList.add('error');
        const periodoError = document.getElementById('periodoError');
        if (periodoError) {
            periodoError.textContent = 'Formato inválido (AAAA-AAAA)';
            periodoError.style.display = 'block';
        }
        valido = false;
    }

    const numeroOficio = document.getElementById('numeroOficio').value;
    if (numeroOficio && !/^\d{4}$/.test(numeroOficio)) {
        document.getElementById('numeroOficio').classList.add('error');
        const numeroOficioError = document.getElementById('numeroOficioError');
        if (numeroOficioError) {
            numeroOficioError.textContent = 'Debe ser 4 dígitos';
            numeroOficioError.style.display = 'block';
        }
        valido = false;
    }

    const referencia = document.getElementById('referencia').value;
    if (referencia && !/^\d+$/.test(referencia)) {
        document.getElementById('referencia').classList.add('error');
        const referenciaError = document.getElementById('referenciaError');
        if (referenciaError) {
            referenciaError.textContent = 'Solo números permitidos';
            referenciaError.style.display = 'block';
        }
        valido = false;
    }

    return valido;
}

// Generar PDF directamente sin validación previa
document.getElementById('generarPDF').addEventListener('click', async function() {
    // Validar antes de generar
    if (!validarFormulario()) {
        alert('Por favor complete todos los campos correctamente');
        return;
    }

    // Obtener datos del formulario
    const datosValidados = {
        periodo: document.getElementById('periodo').value,
        numeroOficio: document.getElementById('numeroOficio').value.padStart(4, '0'),
        contribuyente: document.getElementById('contribuyente').value.toUpperCase(),
        cedula: document.getElementById('cedula').value,
        referencia: document.getElementById('referencia').value,
        direccion: document.getElementById('direccion').value,
        valor: document.getElementById('valor').value,
        periodoLetras: convertirPeriodoALetras(document.getElementById('periodo').value),
        fecha: obtenerFechaTexto()
    };

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'cm',
        format: [21.59, 35.56]
    });

    try {
        const response = await fetch('../component/img/marcadeaguaTESORERIAMUNICIPAL.png');
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onloadend = function() {
            const imgData = reader.result;
            doc.addImage(imgData, 'PNG', 0, 0, 21.59, 35.56, undefined, 'NONE');
            generarContenidoPDF(doc, datosValidados);
        };
        
        reader.readAsDataURL(blob);
    } catch (error) {
        console.error('Error cargando marca de agua:', error);
        generarContenidoPDF(doc, datosValidados);
    }
});

function generarContenidoPDF(doc, datosValidados) {
    const margenIzq = 4.5;
    const margenDer = 2.5;
    const margenSup = 5.0;
    const anchoUtil = 21.59 - margenIzq - margenDer;
    let y = margenSup;

    // Título del oficio
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const tituloOficio = `OFICIO PERSUASIVO OTMIPUP${datosValidados.numeroOficio}`;
    doc.text(tituloOficio, 21.59 / 2, y, { align: 'center' });
    y += 1.2;

    // Tabla
    doc.setFontSize(11);
    const filas = [
        ['IMPUESTO', 'PREDIO UNIFICADO'],
        ['PERIODO GRAVABLE', datosValidados.periodo],
        ['CONTRIBUYENTE', datosValidados.contribuyente],
        ['CEDULA- NIT', `C.C. ${datosValidados.cedula}`],
        ['REFERENCIA CATASTRAL', datosValidados.referencia],
        ['DIRECCIÓN', datosValidados.direccion]
    ];

    const alturaFila = 0.7;
    const col1Width = 6;
    const col2Width = anchoUtil - col1Width;

    doc.setLineWidth(0.01);

    filas.forEach(fila => {
        doc.setFont('helvetica', 'bold');
        doc.rect(margenIzq, y, col1Width, alturaFila);
        doc.text(fila[0], margenIzq + 0.3, y + 0.45);
        
        doc.setFont('helvetica', 'normal');
        doc.rect(margenIzq + col1Width, y, col2Width, alturaFila);
        doc.text(fila[1], margenIzq + col1Width + 0.3, y + 0.45);
        
        y += alturaFila;
    });

    y += 1;

    // PÁRRAFO 1 - con negrita
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    const parrafo1 = [
        { texto: 'El suscrito Tesorero Municipal de El Banco, Magdalena, en uso de las facultades que le confieren los artículos 533, del Acuerdo Municipal Nº. 018 del 30 de diciembre de 2016, Decreto Municipal Nº 048 de 2024, y el Estatuto Tributario Nacional, se permite comunicar(s) que esta dependencia se encuentra adelantando proceso de ', negrita: false },
        { texto: 'de Cobro Administrativo Coactivo', negrita: true },
        { texto: ' a todos los contribuyentes que se encuentran en mora en el pago de Impuestos Predial Unificado.', negrita: false }
    ];
    
    y = textoJustificadoConNegrita(doc, parrafo1, margenIzq, y, anchoUtil, 0.5);
    y += 0.3;

    // PÁRRAFO 2
    const parrafo2 = `Por lo anterior se le notifica de la obligación tributaria que ostenta con la Alcaldía de El Banco, Magdalena, por concepto del NO pago del impuesto Predial Unificado de la(s) vigencia(s) del año, ${datosValidados.periodoLetras} (${datosValidados.periodo}), mediante la (s) cual (es) se determina su obligación por valor de`;
    y = textoJustificado(doc, parrafo2, margenIzq, y, anchoUtil, 0.5);
    
    doc.setFont('helvetica', 'bold');
    y = textoJustificado(doc, datosValidados.valor, margenIzq, y, anchoUtil, 0.5);
    y += 0.3;

    // PÁRRAFO 3 - con negrita
    doc.setFont('helvetica', 'normal');
    const parrafo3 = [
        { texto: 'En consecuencia, se le solicita que ', negrita: false },
        { texto: 'dentro de los cinco (5) días', negrita: true },
        { texto: ' siguientes al recibido de esta comunicación, cumpla con su obligación y cancele los valores adeudados por concepto de pago del Impuesto Predial Unificado aquí señalados.', negrita: false }
    ];
    y = textoJustificadoConNegrita(doc, parrafo3, margenIzq, y, anchoUtil, 0.5);
    y += 0.3;

    // PÁRRAFO 4 - con dos partes en negrita
    const parrafo4 = [
        { texto: 'En todo caso, si el contribuyente argumenta que se encuentra al día con sus obligaciones, la respuesta al presente ', negrita: false },
        { texto: 'oficio debe estar acompañada de las pruebas (pagos o acuerdos de pagos)', negrita: true },
        { texto: ', y deberá dirigirse a esta dependencia, en la siguiente ', negrita: false },
        { texto: 'dirección calle 7 # 4 -44, APTO 208', negrita: true },
        { texto: ', Palacio Municipal, reiteramos que las pruebas deberán adjuntarse (copia simple).', negrita: false }
    ];
    y = textoJustificadoConNegrita(doc, parrafo4, margenIzq, y, anchoUtil, 0.5);
    y += 0.3;

    // PÁRRAFO 5
    const parrafo5 = 'Notifíquese al contribuyente con sujeción en lo dispuesto por los artículos 565 del Estatuto Tributario Nacional.';
    y = textoJustificado(doc, parrafo5, margenIzq, y, anchoUtil, 0.5);
    y += 1;

    // NOTIFÍQUESE Y CÚMPLASE
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('NOTIFÍQUESE Y CÚMPLASE', 21.59 / 2, y, { align: 'center' });
    y += 2;

    // Fecha
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const textoFecha = `Dado en el Municipio de El Banco Magdalena a los ${datosValidados.fecha}.`;
    y = textoJustificado(doc, textoFecha, margenIzq, y, anchoUtil, 0.5);
    y += 2.5;

    // Firma
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('_______________________________________', 21.59 / 2, y, { align: 'center' });
    y += 0.7;
    doc.setFont('helvetica', 'bold');
    doc.text('CIRO RAFAEL VARELA PEDROZO', 21.59 / 2, y, { align: 'center' });
    y += 0.5;
    doc.setFont('helvetica', 'normal');
    doc.text('Tesorero Municipal', 21.59 / 2, y, { align: 'center' });

    // Guardar PDF
    doc.save(`OFICIO_PERSUASIVO_OTMIPUP${datosValidados.numeroOficio}.pdf`);
}

// Auto-formato de cédula con puntos
document.getElementById('cedula').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    let formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    e.target.value = formatted;
});