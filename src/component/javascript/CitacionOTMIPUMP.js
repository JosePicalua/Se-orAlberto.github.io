function showSection(section) {
    console.log('Cambiando a sección:', section);
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    
    document.getElementById(section).classList.add('active');
    event.target.classList.add('active');
}

// ✅ AHORA (solo previene el submit, deja que el HTML maneje la confirmación)
document.getElementById('coactivoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('Formulario enviado, esperando confirmación del usuario...');
    // No hacer nada más aquí - el HTML mostrará el modal de confirmación
});

async function generarPDFCitacion() {
    console.log('=== INICIANDO GENERACIÓN DE PDF CITACIÓN ===');
    const { jsPDF } = window.jspdf;
    // Configurar tamaño CARTA (Letter): 216 x 279 mm
    const doc = new jsPDF({
        unit: 'mm',
        format: 'letter'
    });
    
    // Cargar marca de agua
    let marcaDeAgua = null;
    try {
        const response = await fetch('src/component/img/marcadeaguaTESORERIAMUNICIPAL.png');
        const blob = await response.blob();
        marcaDeAgua = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error cargando marca de agua:', error);
    }
    
    const datos = {
        numeroMandamiento: 'OTMIPUMP2025' + document.getElementById('numeroMandamiento').value.padStart(4, '0'),
        fecha: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase(),
        nombreContribuyente: document.getElementById('nombreContribuyente').value.toUpperCase(),
        numeroCedula: document.getElementById('numeroCedula').value,
        direccion: document.getElementById('direccion').value,
        numeroCatastro: document.getElementById('numeroCatastro').value
    };
    
    // CONFIGURACIÓN DE MÁRGENES según parámetros requeridos
    const marginTop = 45;        // 4.5 cm
    const marginBottom = 65;     // 6.5 cm
    const marginLeft = 30;       // 3 cm
    const marginRight = 25;      // 2.5 cm
    const pageWidth = 215.9;     // Ancho Carta en mm
    const pageHeight = 279.4;    // Alto Carta en mm
    const maxWidth = pageWidth - marginLeft - marginRight;
    const lineHeight = 5.5;
    const fontSize = 12;
    
    // Función auxiliar para dividir palabras largas con guion
    function dividirTextoConGuiones(texto, anchoMaximo, doc) {
        const palabras = texto.split(' ');
        const lineas = [];
        let lineaActual = '';
        
        for (let i = 0; i < palabras.length; i++) {
            const palabra = palabras[i];
            const pruebaLinea = lineaActual + (lineaActual ? ' ' : '') + palabra;
            const anchoPrueba = doc.getTextWidth(pruebaLinea);
            
            if (anchoPrueba > anchoMaximo && lineaActual) {
                // Si la palabra sola es muy larga, dividirla con guion
                if (doc.getTextWidth(palabra) > anchoMaximo * 0.8) {
                    let palabraDividida = '';
                    for (let j = 0; j < palabra.length; j++) {
                        const char = palabra[j];
                        if (doc.getTextWidth(lineaActual + ' ' + palabraDividida + char + '-') <= anchoMaximo) {
                            palabraDividida += char;
                        } else {
                            lineas.push(lineaActual + (lineaActual ? ' ' : '') + palabraDividida + '-');
                            lineaActual = '';
                            palabraDividida = char;
                        }
                    }
                    lineaActual = palabraDividida;
                } else {
                    lineas.push(lineaActual);
                    lineaActual = palabra;
                }
            } else {
                lineaActual = pruebaLinea;
            }
        }
        
        if (lineaActual) {
            lineas.push(lineaActual);
        }
        
        return lineas;
    }
    
    // Agregar marca de agua
    if (marcaDeAgua) {
        doc.addImage(marcaDeAgua, 'PNG', 0, 0, pageWidth, pageHeight, '', 'NONE', 0.15);
    }
    
    doc.setFont('helvetica');
    doc.setFontSize(fontSize);
    doc.setTextColor(0, 0, 0);
    
    let y = marginTop;
    
    // Encabezado - alineado a la izquierda
    doc.setFont('helvetica', 'normal');
    doc.text(`El Banco, Magdalena, ${datos.fecha}`, marginLeft, y);
    y += lineHeight * 2;
    
    doc.text('SEÑOR(A).', marginLeft, y);
    y += lineHeight;
    
    doc.setFont('helvetica', 'bold');
    doc.text(datos.nombreContribuyente, marginLeft, y);
    y += lineHeight;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`C.C. ${datos.numeroCedula}`, marginLeft, y);
    y += lineHeight;
    
    doc.text(`Dirección: ${datos.direccion}`, marginLeft, y);
    y += lineHeight * 3;
    
    // Tabla de referencia
    doc.text('REFERENCIA:', marginLeft, y);
    doc.text('PROCESO ADMINISTRATIVO COACTIVO', marginLeft + 80, y);
    y += lineHeight * 1.5;
    
    doc.text('CONTRA:', marginLeft, y);
    doc.setFont('helvetica', 'bold');
    doc.text(datos.nombreContribuyente, marginLeft + 80, y);
    y += lineHeight;
    
    doc.setFont('helvetica', 'normal');
    doc.text('REFERENCIA CATASTRAL:', marginLeft, y);
    doc.setFont('helvetica', 'bold');
    doc.text(datos.numeroCatastro, marginLeft + 80, y);
    y += lineHeight * 3;
    
    // Cuerpo del texto - JUSTIFICADO MANUAL
    doc.setFont('helvetica', 'normal');
    const texto1 = `Sírvase comparecer personalmente ante la Tesorería Municipal de El Banco, Magdalena, ubicada en la calle 7 No. 12-85, Palacio Municipal, Oficina de Tesorería, en horas hábiles dentro del término de diez (10) días hábiles contados a partir de la recepción de la presente citación, para efectos de la notificación personal de la resolución Mandamiento de Pago N° ${datos.numeroMandamiento}, del ${datos.fecha}, librado dentro del proceso de referencia.`;
    
    const lineas1 = justificarTexto(texto1, maxWidth, doc);
    for (let i = 0; i < lineas1.length; i++) {
        const esUltima = (i === lineas1.length - 1);
        renderizarLineaJustificada(lineas1[i], marginLeft, y, maxWidth, doc, esUltima);
        y += lineHeight;
    }
    y += lineHeight;
    
    const texto2 = `Se le advierte de que no comparecer dentro del término fijado, la resolución de Mandamiento de Pago se le notificará por correo electrónico conforme a lo dispuesto en el artículo 353 del Acuerdo N° 018 de 2016 (Mediante el cual se modifica el Estatuto Tributario Municipal) concordante a lo dispuesto por el artículo 826 del Estatuto Tributario Nacional, concordante con el artículo 59 de la Ley 788 de 2002.`;
    
    const lineas2 = justificarTexto(texto2, maxWidth, doc);
    for (let i = 0; i < lineas2.length; i++) {
        const esUltima = (i === lineas2.length - 1);
        renderizarLineaJustificada(lineas2[i], marginLeft, y, maxWidth, doc, esUltima);
        y += lineHeight;
    }
    y += lineHeight * 2;
    
    // Firma
    doc.text('Atentamente,', marginLeft, y);
    y += lineHeight * 5;
    
    doc.text('__________________________________', marginLeft, y);
    y += lineHeight;
    
    doc.setFont('helvetica', 'bold');
    doc.text('CIRO RAFAEL VARELA PEDROZO', marginLeft, y);
    y += lineHeight;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Tesorero Municipal', marginLeft, y);
    y += lineHeight;
    doc.text('Municipio de El Banco, Magdalena', marginLeft, y);
    
    const nombreArchivo = `CITACION_${datos.numeroMandamiento}_${datos.nombreContribuyente.replace(/\s+/g, '_')}.pdf`;
    doc.save(nombreArchivo);
    
    console.log('=== PDF CITACIÓN GENERADO EXITOSAMENTE ===');
}

