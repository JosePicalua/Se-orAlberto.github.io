const { jsPDF } = window.jspdf;
let datosValidados = null;

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

function validarFormulario() {
    let valido = true;
    const campos = ['periodo', 'numeroOficio', 'contribuyente', 'cedula', 'referencia', 'direccion', 'valor'];
    
    campos.forEach(campo => {
        const input = document.getElementById(campo);
        const errorMsg = document.getElementById(campo + 'Error');
        
        if (!input.value.trim()) {
            input.classList.add('error');
            errorMsg.style.display = 'block';
            valido = false;
        } else {
            input.classList.remove('error');
            errorMsg.style.display = 'none';
        }
    });

    // Validaciones específicas
    const periodo = document.getElementById('periodo').value;
    if (periodo && !/^\d{4}-\d{4}$/.test(periodo)) {
        document.getElementById('periodo').classList.add('error');
        document.getElementById('periodoError').textContent = 'Formato inválido (AAAA-AAAA)';
        document.getElementById('periodoError').style.display = 'block';
        valido = false;
    }

    const numeroOficio = document.getElementById('numeroOficio').value;
    if (numeroOficio && !/^\d{4}$/.test(numeroOficio)) {
        document.getElementById('numeroOficio').classList.add('error');
        document.getElementById('numeroOficioError').textContent = 'Debe ser 4 dígitos';
        document.getElementById('numeroOficioError').style.display = 'block';
        valido = false;
    }

    const referencia = document.getElementById('referencia').value;
    if (referencia && !/^\d+$/.test(referencia)) {
        document.getElementById('referencia').classList.add('error');
        document.getElementById('referenciaError').textContent = 'Solo números permitidos';
        document.getElementById('referenciaError').style.display = 'block';
        valido = false;
    }

    return valido;
}

document.getElementById('oficioForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (validarFormulario()) {
        datosValidados = {
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

        alert('Formulario validado correctamente. Puede generar el PDF.');
        document.getElementById('generarPDF').disabled = false;
    }
});

document.getElementById('generarPDF').addEventListener('click', async function() {
    if (!datosValidados) return;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'cm',
        format: [21.59, 35.56]
    });

    // Configurar marca de agua - tamaño completo de la hoja
    try {
        const response = await fetch('../component/img/marcadeaguaTESORERIAMUNICIPAL.png');
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onloadend = function() {
            const imgData = reader.result;
            
            // Marca de agua del tamaño completo de la hoja
            doc.addImage(imgData, 'PNG', 0, 0, 21.59, 35.56, undefined, 'NONE');
            
            generarContenidoPDF(doc);
        };
        
        reader.readAsDataURL(blob);
    } catch (error) {
        console.error('Error cargando marca de agua:', error);
        generarContenidoPDF(doc);
    }
});

function generarContenidoPDF(doc) {
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

    // Tabla con líneas delgadas y más presentable
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

    // Configurar líneas delgadas
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

    // Cuerpo del texto - Tamaño 11
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    const textos = [
        `El suscrito Tesorero Municipal de El Banco, Magdalena, en uso de las facultades que le confieren los artículos 533, del Acuerdo Municipal Nº. 018 del 30 de diciembre de 2016, Decreto Municipal Nº 048 de 2024, y el Estatuto Tributario Nacional, se permite comunicar(s) que esta dependencia se encuentra adelantando proceso de `,
        { text: 'Cobro Administrativo Coactivo', bold: true },
        ` a todos los contribuyentes que se encuentran en mora en el pago de Impuestos Predial Unificado.`
    ];

    let texto1 = textos[0] + textos[1].text + textos[2];
    let lineas1 = doc.splitTextToSize(texto1, anchoUtil);
    lineas1.forEach(linea => {
        if (linea.includes('Cobro Administrativo Coactivo')) {
            const partes = linea.split('Cobro Administrativo Coactivo');
            let xPos = margenIzq;
            doc.setFont('helvetica', 'normal');
            doc.text(partes[0], xPos, y);
            xPos += doc.getTextWidth(partes[0]);
            doc.setFont('helvetica', 'bold');
            doc.text('Cobro Administrativo Coactivo', xPos, y);
            xPos += doc.getTextWidth('Cobro Administrativo Coactivo');
            doc.setFont('helvetica', 'normal');
            doc.text(partes[1] || '', xPos, y);
        } else {
            doc.setFont('helvetica', 'normal');
            doc.text(linea, margenIzq, y, { align: 'justify', maxWidth: anchoUtil });
        }
        y += 0.5;
    });

    y += 0.3;

    const texto2 = `Por lo anterior se le notifica de la obligación tributaria que ostenta con la Alcaldía de El Banco, Magdalena, por concepto del NO pago del impuesto Predial Unificado de la(s) vigencia(s) del año, ${datosValidados.periodoLetras} (${datosValidados.periodo}), mediante la (s) cual (es) se determina su obligación por valor de `;
    let lineas2 = doc.splitTextToSize(texto2, anchoUtil);
    lineas2.forEach(linea => {
        doc.text(linea, margenIzq, y, { align: 'justify', maxWidth: anchoUtil });
        y += 0.5;
    });

    doc.setFont('helvetica', 'bold');
    let lineasValor = doc.splitTextToSize(datosValidados.valor, anchoUtil);
    lineasValor.forEach(linea => {
        doc.text(linea, margenIzq, y);
        y += 0.5;
    });

    y += 0.3;

    doc.setFont('helvetica', 'normal');
    const texto3 = `En consecuencia, se le solicita que `;
    const texto3Bold = `dentro de los cinco (5) días`;
    const texto3Cont = ` siguientes al recibido de esta comunicación, cumpla con su obligación y cancele los valores adeudados por concepto de pago del Impuesto Predial Unificado aquí señalados.`;
    
    let lineaActual = texto3 + texto3Bold + texto3Cont;
    let lineas3 = doc.splitTextToSize(lineaActual, anchoUtil);
    lineas3.forEach(linea => {
        if (linea.includes('dentro de los cinco (5) días')) {
            const partes = linea.split('dentro de los cinco (5) días');
            let xPos = margenIzq;
            doc.setFont('helvetica', 'normal');
            doc.text(partes[0], xPos, y);
            xPos += doc.getTextWidth(partes[0]);
            doc.setFont('helvetica', 'bold');
            doc.text('dentro de los cinco (5) días', xPos, y);
            xPos += doc.getTextWidth('dentro de los cinco (5) días');
            doc.setFont('helvetica', 'normal');
            doc.text(partes[1] || '', xPos, y);
        } else {
            doc.setFont('helvetica', 'normal');
            doc.text(linea, margenIzq, y, { align: 'justify', maxWidth: anchoUtil });
        }
        y += 0.5;
    });

    y += 0.3;

    const texto4 = `En todo caso, si el contribuyente argumenta que se encuentra al día con sus obligaciones, la respuesta al presente oficio `;
    const texto4Bold = `debe estar acompañada de las pruebas (pagos o acuerdos de pagos)`;
    const texto4Cont = `, y deberá dirigirse a esta dependencia, en la siguiente dirección `;
    const texto4Bold2 = `${datosValidados.direccion}`;
    const texto4Final = `, Palacio Municipal, reiteramos que las pruebas deberán adjuntarse (copia simple).`;

    let lineaTexto4 = texto4 + texto4Bold + texto4Cont + texto4Bold2 + texto4Final;
    let lineas4 = doc.splitTextToSize(lineaTexto4, anchoUtil);
    lineas4.forEach(linea => {
        let xPos = margenIzq;
        doc.setFont('helvetica', 'normal');
        
        if (linea.includes('debe estar acompañada de las pruebas (pagos o acuerdos de pagos)')) {
            const partes = linea.split('debe estar acompañada de las pruebas (pagos o acuerdos de pagos)');
            doc.text(partes[0], xPos, y);
            xPos += doc.getTextWidth(partes[0]);
            doc.setFont('helvetica', 'bold');
            doc.text('debe estar acompañada de las pruebas (pagos o acuerdos de pagos)', xPos, y);
            xPos += doc.getTextWidth('debe estar acompañada de las pruebas (pagos o acuerdos de pagos)');
            doc.setFont('helvetica', 'normal');
            doc.text(partes[1] || '', xPos, y);
        } else if (linea.includes(datosValidados.direccion)) {
            const partes = linea.split(datosValidados.direccion);
            doc.text(partes[0], xPos, y);
            xPos += doc.getTextWidth(partes[0]);
            doc.setFont('helvetica', 'bold');
            doc.text(datosValidados.direccion, xPos, y);
            xPos += doc.getTextWidth(datosValidados.direccion);
            doc.setFont('helvetica', 'normal');
            doc.text(partes[1] || '', xPos, y);
        } else {
            doc.text(linea, margenIzq, y);
        }
        y += 0.5;
    });

    y += 0.3;

    const texto5 = `Notifíquese al contribuyente con sujeción en lo dispuesto por los artículos 565 del Estatuto Tributario Nacional.`;
    let lineas5 = doc.splitTextToSize(texto5, anchoUtil);
    lineas5.forEach(linea => {
        doc.text(linea, margenIzq, y, { align: 'justify', maxWidth: anchoUtil });
        y += 0.5;
    });

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
    let lineasFecha = doc.splitTextToSize(textoFecha, anchoUtil);
    lineasFecha.forEach(linea => {
        doc.text(linea, margenIzq, y, { align: 'justify', maxWidth: anchoUtil });
        y += 0.5;
    });

    y += 2.5;

    // Firma
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('_______________________________________', 21.59 / 2, y, { align: 'center' });
    y += 0.7;
    doc.setFont('helvetica', 'bold');
    doc.text('CIRO/ RAFAEL VARELA PEDROZO', 21.59 / 2, y, { align: 'center' });
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