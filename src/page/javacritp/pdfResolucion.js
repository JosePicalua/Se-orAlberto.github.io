function numeroALetras(num) {
    const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const decenas = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    if (num === 0) return 'cero';
    if (num === 100) return 'cien';
    if (num === 1000) return 'mil';

    let letras = '';

    // Millones
    if (num >= 1000000) {
        const millones = Math.floor(num / 1000000);
        if (millones === 1) {
            letras += 'un millón ';
        } else {
            letras += numeroALetras(millones) + ' millones ';
        }
        num %= 1000000;
    }

    // Miles
    if (num >= 1000) {
        const miles = Math.floor(num / 1000);
        if (miles === 1) {
            letras += 'mil ';
        } else {
            letras += numeroALetras(miles) + ' mil ';
        }
        num %= 1000;
    }

    // Centenas
    if (num >= 100) {
        const centena = Math.floor(num / 100);
        if (num === 100) {
            letras += 'cien ';
        } else {
            letras += centenas[centena] + ' ';
        }
        num %= 100;
    }

    // Decenas y unidades
    if (num >= 20) {
        const decena = Math.floor(num / 10);
        letras += decenas[decena];
        num %= 10;
        if (num > 0) {
            letras += ' y ' + unidades[num];
        }
    } else if (num >= 10) {
        letras += especiales[num - 10];
    } else if (num > 0) {
        letras += unidades[num];
    }

    return letras.trim();
}



function obtenerFechaTextoResolucion(fechaInput) {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    // Si viene una fecha, usarla. Si no, usar la actual.
    const fecha = fechaInput ? new Date(fechaInput) : new Date();

    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();
    
    return `${numeroALetras(dia)} (${dia}) día del mes de ${mes} año ${anio}`;
}

function formatoCOP(numero) {
    return numero.toLocaleString('es-CO');
}

function numeroALetrasPesos(num) {
    return numeroALetras(num).toUpperCase() + " PESOS";
}

function actualizarSumaTotal() {
    let sumaTotal = 0;

    if (vigenciaActualGuardada) {
        sumaTotal += Number(vigenciaActualGuardada.total);
    }

    vigenciasAntiguasGuardadas.forEach(vigencia => {
        sumaTotal += Number(vigencia.total);
    });

    // Total en formato colombiano (1.000.000)
    const totalFormato = sumaTotal.toLocaleString('es-CO');

    // Total en letras (UN MILLÓN DE PESOS)
    const totalLetras = numeroALetras(sumaTotal).toUpperCase() + " PESOS";

    // Mostrar en la pantalla
    document.getElementById('totalprecioUnificadoAntiguo').value = totalFormato;
    document.getElementById('totalprecioUnificadoAntiguoLetras').value = totalLetras;

}


async function generarPdfResolucion() {
    const { jsPDF } = window.jspdf;
    
    // Crear documento
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'cm',
        format: [21.59, 35.56]
    });

    // Márgenes y dimensiones
    const pageWidth = 21.59;
    const pageHeight = 35.56;
    const margenIzq = 4.5;
    const margenDer = 2.5;
    const marginTop = 5.0;
    const marginBottom = 2.5;
    const anchoUtil = pageWidth - margenIzq - margenDer;
    let y = marginTop;
    const lineHeight = 0.5;

    // Cargar marca de agua
    let marcaDeAgua = null;
    try {
        const response = await fetch('../component/img/marcadeaguaTESORERIAMUNICIPAL.png');
        const blob = await response.blob();
        marcaDeAgua = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.log('No se pudo cargar la marca de agua');
    }

    // Aplicar marca de agua en la primera página
    if (marcaDeAgua) {
        doc.addImage(marcaDeAgua, 'PNG', 0, 0, pageWidth, pageHeight);
    }

    // Obtener datos del formulario
    const numeroResolucion = document.getElementById("numeroResolucion").value;
    const fechaResolucion = obtenerFechaTextoResolucion(document.getElementById('fechaResolucion').value);
    const nombreContizante = document.getElementById("nombreContribuyente").value;
    const numeroCedula = document.getElementById("numeroCedula").value;
    const referencia = document.getElementById("referencia").value;
    const direccion = document.getElementById("direccion").value;
    const numeroFactura = document.getElementById("numeroFactura").value;


    console.log("numeroResolucion:", document.getElementById("numeroResolucion"));
    console.log("fechaResolucion:", document.getElementById("fechaResolucion"));
    console.log("nombreContizante:", document.getElementById("nombreContizante"));
    console.log("numeroCedula:", document.getElementById("numeroCedula"));
    console.log("referencia:", document.getElementById("referencia"));
    console.log("direccion:", document.getElementById("direccion"));
    console.log("numeroFcactura:", document.getElementById("numeroFcactura"));
    console.log("totalFactura:", document.getElementById("totalFactura"));
    console.log("totalFacturaLetras:", document.getElementById("totalFacturaLetras"));


    // ✅ CALCULAR TOTALES DIRECTAMENTE
    let sumaTotal = 0;
    if (vigenciaActualGuardada) {
        sumaTotal += Number(vigenciaActualGuardada.total);
    }
    vigenciasAntiguasGuardadas.forEach(vigencia => {
        sumaTotal += Number(vigencia.total);
    });

    const totalFactura = sumaTotal.toLocaleString('es-CO');
    const totalFacturaLetras = numeroALetras(sumaTotal).toUpperCase() + " PESOS";


    // ========== ENCABEZADO ==========
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    
    const titulo1 = `RESOLUCIÓN N°. ${numeroResolucion} DEL ${fechaResolucion.toUpperCase()}`;
    const anchoTitulo1 = doc.getTextWidth(titulo1);
    doc.text(titulo1, (pageWidth - anchoTitulo1) / 2, y);
    y += lineHeight * 3;

    // Título principal
    doc.setFontSize(10);
    const titulo2Linea1 = '"POR MEDIO DE LA CUAL SE LIQUIDA UNA OBLIGACIÓN TRIBUTARIA POR';
    const titulo2Linea2 = 'CONCEPTO DE IMPUESTO PREDIAL UNIFICADO Y SE CONSTITUYE TÍTULO';
    const titulo2Linea3 = 'EJECUTIVO"';
    
    doc.text(titulo2Linea1, (pageWidth - doc.getTextWidth(titulo2Linea1)) / 2, y);
    y += lineHeight;
    doc.text(titulo2Linea2, (pageWidth - doc.getTextWidth(titulo2Linea2)) / 2, y);
    y += lineHeight;
    doc.text(titulo2Linea3, (pageWidth - doc.getTextWidth(titulo2Linea3)) / 2, y);
    y += lineHeight * 2;

    // Texto introductorio con negritas
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    const partes1 = [
        { t: 'EL TESORERO MUNICIPAL DEL MUNICIPIO DE EL BANCO – MAGDALENA,', b: true },
        { t: 'en ejercicio de las facultades conferidas por la Constitución Política (arts. 287, 300 y 313), el Estatuto Tributario Nacional (arts. 565, 567, 720, 823, 826, 828, 829, 830 y 831), la Ley 1066 de 2006 (arts. 1 y 2) y su Decreto Reglamentario 4473 de 2006, la Ley 1437 de 2011 (arts. 67, 69 y 98), la Ley 1551 de 2012 (art. 91), el Acuerdo Municipal N° 018 de 2016, y el Decreto Municipal N° 048 de 2024,', b: false }
    ];
    
    y = agregarTextoConNegritas(doc, partes1, margenIzq, y, anchoUtil, lineHeight);
    y += lineHeight;

    // ========== CONSIDERANDO ==========
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const considerandoAncho = doc.getTextWidth('CONSIDERANDO');
    doc.text('CONSIDERANDO', (pageWidth - considerandoAncho) / 2, y);
    y += lineHeight * 1.5;

    // Considerandos (párrafos justificados)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const parrafo1 = `1. Que el Municipio de El Banco – Magdalena, como entidad territorial, de conformidad con los artículos 287, 300 y 313 de la Constitución Política, tiene autonomía para la gestión de sus intereses, dentro de los cuales se incluye la facultad para establecer, administrar, recaudar y cobrar sus tributos, ejerciendo jurisdicción coactiva conforme al artículo 823 del Estatuto Tributario Nacional, al Decreto Municipal N° 048 de 2024, al Acuerdo Municipal N° 018 de 2016 y al artículo 2 de la Ley 1066 de 2006.`;
    y = agregarTextoJustificado(doc, parrafo1, margenIzq, y, anchoUtil, lineHeight);
    y += lineHeight;

    const partes2 = [
        { t: '2. Que la Tesorería Municipal, en ejercicio de sus funciones y mediante verificación en el sistema de información tributaria, identificó que el señor(a),', b: false },
        { t: nombreContizante + ',', b: true },
        { t: 'identificado(a), con C.C. N°', b: false },
        { t: numeroCedula + ',', b: true },
        { t: 'figura como propietario(a), del predio', b: false },
        { t: direccion + ',', b: true },
        { t: 'de uso agropecuario, identificado con cédula catastral N°', b: false },
        { t: referencia + ',', b: true },
        { t: 'en esta municipalidad e inscrito en la Oficina de Registro de Instrumentos Públicos de El Banco – Magdalena.', b: false }
    ];
    y = agregarTextoConNegritas(doc, partes2, margenIzq, y, anchoUtil, lineHeight);
    y += lineHeight;

    const parrafo3 = `3. Que el contribuyente presenta una deuda pendiente por concepto del Impuesto Predial Unificado, que incluye capital, intereses moratorios y sobretasas, conforme a lo establecido en los Acuerdos Municipales vigentes, en especial el Acuerdo N° 018 de 2016.`;
    y = agregarTextoJustificado(doc, parrafo3, margenIzq, y, anchoUtil, lineHeight);
    y += lineHeight;

    const parrafo4 = `4. Que la obligación tributaria fue determinada mediante liquidación oficial practicada por la Administración Municipal, conforme a los artículos 826 y 828 del Estatuto Tributario Nacional y los artículos 55, 56, del Acuerdo Municipal N° 018 de 2016, resultando una obligación clara, expresa y exigible, constituyendo título ejecutivo en los términos de ley.`;
    y = agregarTextoJustificado(doc, parrafo4, margenIzq, y, anchoUtil, lineHeight);
    y += lineHeight;

    const parrafo5 = `5. Que previamente se adelantó la etapa persuasiva de cobro prevista en el artículo 2 de la Ley 1066 de 2006 y el artículo 1 del Decreto Reglamentario 4473 de 2006, sin que el contribuyente realizara el pago o suscribiera acuerdo de pago.`;
    y = agregarTextoJustificado(doc, parrafo5, margenIzq, y, anchoUtil, lineHeight);
    y += lineHeight;

    const parrafo6 = `6. Que, en mérito de lo expuesto, se hace necesario expedir la presente resolución para liquidar la obligación tributaria y constituir el correspondiente título ejecutivo a favor del Municipio de El Banco – Magdalena.`;
    y = agregarTextoJustificado(doc, parrafo6, margenIzq, y, anchoUtil, lineHeight);
    y += lineHeight * 1.5;

    // ========== RESUELVE ==========
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const resuelveAncho = doc.getTextWidth('RESUELVE');
    doc.text('RESUELVE', (pageWidth - resuelveAncho) / 2, y);
    y += lineHeight * 1.5;

    // Artículo Primero
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    const partesPrimero = [
        { t: 'ARTÍCULO PRIMERO:', b: true },
        { t: 'Liquidar a cargo del contribuyente', b: false },
        { t: nombreContizante + ',', b: true },
        { t: 'identificado con C.C. N°', b: false },
        { t: numeroCedula + ',', b: true },
        { t: 'la obligación tributaria por concepto de Impuesto Predial Unificado, por la suma total de', b: false },
        { t: totalFactura + ' ' + totalFacturaLetras + ' (' + totalFactura + '),', b: true },
        { t: 'discriminados en la factura N°', b: false },
        { t: numeroFactura + ':', b: true }
    ];
    y = agregarTextoConNegritas(doc, partesPrimero, margenIzq, y, anchoUtil, lineHeight);
    y += lineHeight * 1.5;

    // ========== TABLAS DE VIGENCIAS ==========
    
    // 🟦 1. VIGENCIA ACTUAL
    if (vigenciaActualGuardada) {
        y = verificarYSaltarPagina(doc, y, lineHeight, 8, marcaDeAgua, pageWidth, pageHeight, marginTop, marginBottom);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('CONCEPTO VIGENCIA ACTUAL', margenIzq, y);
        y += 0.3;

        const columnasActual = [
            { header: 'CONCEPTO', dataKey: 'concepto' },
            { header: 'VALOR', dataKey: 'valor' }
        ];

        const datosActual = [
            { concepto: 'Predial Unificado', valor: '$' + vigenciaActualGuardada.predialUnificado.toLocaleString('es-CO') },
            { concepto: 'Sobretasa del Medio Ambiente', valor: '$' + vigenciaActualGuardada.sobretasaAmbiente.toLocaleString('es-CO') },
            { concepto: 'Sistematización de Recibo', valor: '$' + vigenciaActualGuardada.sistematizacion.toLocaleString('es-CO') },
            { concepto: 'Sobretasa Bomberil', valor: '$' + vigenciaActualGuardada.sobretasaBomberil.toLocaleString('es-CO') },
            { concepto: 'Total', valor: '$' + vigenciaActualGuardada.total.toLocaleString('es-CO') }
        ];

        doc.autoTable({
            startY: y,
            head: [columnasActual.map(c => c.header)],
            body: datosActual.map(row => [row.concepto, row.valor]),
            margin: { left: margenIzq, right: margenDer },
            styles: { fontSize: 8, cellPadding: 0.15 },
            headStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: anchoUtil * 0.65 },
                1: { cellWidth: anchoUtil * 0.35, halign: 'right' }
            }
        });

        y = doc.lastAutoTable.finalY + 0.5;
    }

    // 🟩 2. VIGENCIAS ANTIGUAS
    if (vigenciasAntiguasGuardadas && vigenciasAntiguasGuardadas.length > 0) {
        for (let vigencia of vigenciasAntiguasGuardadas) {
            y = verificarYSaltarPagina(doc, y, lineHeight, 10, marcaDeAgua, pageWidth, pageHeight, marginTop, marginBottom);
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text(`CONCEPTO VIGENCIA ${vigencia.año}`, margenIzq, y);
            y += 0.3;

            const datosAntigua = [
                { concepto: 'Predial', valor: '$' + vigencia.predial.toLocaleString('es-CO') },
                { concepto: 'Sobretasa del Medio Ambiente', valor: '$' + vigencia.sobretasaAmbiente.toLocaleString('es-CO') },
                { concepto: 'Sobretasa Bomberil', valor: '$' + vigencia.sobretasaBomberil.toLocaleString('es-CO') },
                { concepto: 'Sub. Total', valor: '$' + vigencia.subTotal.toLocaleString('es-CO') },
                { concepto: 'Mora Predial', valor: '$' + vigencia.moraPredial.toLocaleString('es-CO') },
                { concepto: 'Mora Sobretasa del Medio Ambiente', valor: '$' + vigencia.moraSobretasa.toLocaleString('es-CO') },
                { concepto: 'Total', valor: '$' + vigencia.total.toLocaleString('es-CO') }
            ];

            doc.autoTable({
                startY: y,
                head: [['CONCEPTO', 'VALOR']],
                body: datosAntigua.map(row => [row.concepto, row.valor]),
                margin: { left: margenIzq, right: margenDer },
                styles: { fontSize: 8, cellPadding: 0.15 },
                headStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: 'bold' },
                columnStyles: {
                    0: { cellWidth: anchoUtil * 0.65 },
                    1: { cellWidth: anchoUtil * 0.35, halign: 'right' }
                }
            });

            y = doc.lastAutoTable.finalY + 0.5;
        }
    }

    // Total general
    y = verificarYSaltarPagina(doc, y, lineHeight, 3, marcaDeAgua, pageWidth, pageHeight, marginTop, marginBottom);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    const totalTexto = `Valor Vigencia Actual y Anteriores: ${totalFactura}`;
    doc.text(totalTexto, margenIzq, y);
    y += lineHeight * 2;

    // ========== ARTÍCULOS RESTANTES ==========
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const partesSegundo = [
        { t: 'ARTÍCULO SEGUNDO:', b: true },
        { t: 'Declarar que la presente liquidación constituye título ejecutivo a favor del Municipio de El Banco – Magdalena, en los términos del artículo 828 del Estatuto Tributario Nacional y del artículo 530 del Acuerdo Municipal N° 018 de 2016, y servirá de base para el inicio del procedimiento administrativo de cobro coactivo, conforme a los artículos 823 y siguientes del Estatuto Tributario Nacional, el artículo 98 del CPACA, el artículo 5 de la Ley 1066 de 2006 y demás normas concordantes.', b: false }
    ];
    y = agregarTextoConNegritas(doc, partesSegundo, margenIzq, y, anchoUtil, lineHeight);
    y += lineHeight;

    const partesTercero = [
        { t: 'ARTÍCULO TERCERO:', b: true },
        { t: 'Notificar la presente resolución al contribuyente de conformidad con los artículos 565, 567 y 826 del Estatuto Tributario Nacional, los artículos 67 y 69 del CPACA, y el artículo 353 del Acuerdo Municipal N° 018 de 2016. Contra este acto procede el recurso de reconsideración, el cual deberá interponerse dentro de los dos (2) meses siguientes a su notificación, conforme al artículo 720 del Estatuto Tributario Nacional.', b: false }
    ];
    y = agregarTextoConNegritas(doc, partesTercero, margenIzq, y, anchoUtil, lineHeight);
    y += lineHeight;

    const partesCuarto = [
        { t: 'ARTÍCULO CUARTO:', b: true },
        { t: 'En firme la presente resolución y vencido el término para el pago voluntario previsto en el artículo 828 del Estatuto Tributario Nacional, la Tesorería Municipal iniciará el proceso administrativo de cobro coactivo, pudiendo decretar y ejecutar medidas cautelares tales como embargo, secuestro y remate de bienes, de conformidad con los artículos 829, 830 y 831 del Estatuto Tributario Nacional, el artículo 98 del CPACA, el Decreto 4473 de 2006 y el Acuerdo Municipal N° 018 de 2016.', b: false }
    ];
    y = agregarTextoConNegritas(doc, partesCuarto, margenIzq, y, anchoUtil, lineHeight);
    y += lineHeight * 2;

    // ========== CIERRE ==========
    y = verificarYSaltarPagina(doc, y, lineHeight, 6, marcaDeAgua, pageWidth, pageHeight, marginTop, marginBottom);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const comuniqueseAncho = doc.getTextWidth('COMUNÍQUESE, NOTIFÍQUESE Y CÚMPLASE.');
    doc.text('COMUNÍQUESE, NOTIFÍQUESE Y CÚMPLASE.', (pageWidth - comuniqueseAncho) / 2, y);
    y += lineHeight * 2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const diaTexto = fechaResolucion.split(' ')[0];
    const dadoTexto = `Dado en El Banco, Magdalena, a los ${diaTexto} (${new Date(document.getElementById('fechaResolucion').value).getDate()}) días del mes de ${fechaResolucion.split('mes de ')[1]}.`;
    y = agregarTextoJustificado(doc, dadoTexto, margenIzq, y, anchoUtil, lineHeight);
    y += lineHeight * 4;

    // Firma
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const firmaAncho = doc.getTextWidth('CIRO RAFAEL VARELA PEDROZO');
    doc.text('CIRO RAFAEL VARELA PEDROZO', (pageWidth - firmaAncho) / 2, y);
    y += lineHeight * 0.8;
    
    const cargoAncho = doc.getTextWidth('Tesorero Municipal');
    doc.text('Tesorero Municipal', (pageWidth - cargoAncho) / 2, y);

    // Guardar PDF
    doc.save(`RESOLUCIÓN_N°_${numeroResolucion}_${nombreContizante}.pdf`);
}

// Funciones auxiliares
function verificarYSaltarPagina(doc, y, lineHeight, lineasNecesarias, marcaDeAgua, pageWidth, pageHeight, marginTop, marginBottom) {
    if (y + (lineHeight * lineasNecesarias) > pageHeight - marginBottom) {
        doc.addPage();
        if (marcaDeAgua) {
            doc.addImage(marcaDeAgua, 'PNG', 0, 0, pageWidth, pageHeight);
        }
        return marginTop;
    }
    return y;
}

function dividirPalabra(palabra, doc, maxWidth) {
    const partes = [];
    let actual = '';
    for (let char of palabra) {
        if (doc.getTextWidth(actual + char) <= maxWidth) {
            actual += char;
        } else {
            if (actual) partes.push(actual);
            actual = char;
        }
    }
    if (actual) partes.push(actual);
    return partes;
}

function justificarLinea(doc, linea, x, y, maxWidth) {
    const palabras = linea.split(' ');
    if (palabras.length === 1) {
        doc.text(linea, x, y);
        return;
    }
    
    let anchoTotal = 0;
    for (let palabra of palabras) {
        anchoTotal += doc.getTextWidth(palabra);
    }
    
    const espacioDisponible = maxWidth - anchoTotal;
    const espacioEntrePalabras = espacioDisponible / (palabras.length - 1);
    
    let xActual = x;
    for (let i = 0; i < palabras.length; i++) {
        doc.text(palabras[i], xActual, y);
        xActual += doc.getTextWidth(palabras[i]) + espacioEntrePalabras;
    }
}

function agregarTextoJustificado(doc, texto, x, y, maxWidth, lineHeight) {
    const palabras = texto.split(' ');
    let lineas = [];
    let lineaActual = '';
    
    for (let palabra of palabras) {
        const pruebaLinea = lineaActual + (lineaActual ? ' ' : '') + palabra;
        const anchoLinea = doc.getTextWidth(pruebaLinea);
        
        if (anchoLinea <= maxWidth) {
            lineaActual = pruebaLinea;
        } else {
            if (doc.getTextWidth(palabra) > maxWidth) {
                if (lineaActual) {
                    lineas.push(lineaActual);
                    lineaActual = '';
                }
                const partesPalabra = dividirPalabra(palabra, doc, maxWidth);
                for (let j = 0; j < partesPalabra.length; j++) {
                    if (j === partesPalabra.length - 1) {
                        lineaActual = partesPalabra[j];
                    } else {
                        lineas.push(partesPalabra[j]);
                    }
                }
            } else {
                lineas.push(lineaActual);
                lineaActual = palabra;
            }
        }
    }
    
    if (lineaActual) {
        lineas.push(lineaActual);
    }
    
    for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i];
        
        if (i === lineas.length - 1) {
            doc.text(linea, x, y);
        } else {
            justificarLinea(doc, linea, x, y, maxWidth);
        }
        y += lineHeight;
    }
    
    return y;
}

function agregarTextoConNegritas(doc, partes, x, y, maxWidth, lineHeight) {
    let palabrasConEstilo = [];
    
    for (let parte of partes) {
        const palabrasDeParte = parte.t.split(' ').filter(p => p.length > 0);
        for (let palabra of palabrasDeParte) {
            palabrasConEstilo.push({ texto: palabra, bold: parte.b });
        }
    }
    
    let lineas = [];
    let lineaActual = [];
    let anchoActual = 0;
    
    for (let item of palabrasConEstilo) {
        doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
        const anchoPalabra = doc.getTextWidth(item.texto);
        const anchoEspacio = doc.getTextWidth(' ');
        const anchoTotal = anchoPalabra + (lineaActual.length > 0 ? anchoEspacio : 0);
        
        if (anchoActual + anchoTotal <= maxWidth) {
            lineaActual.push(item);
            anchoActual += anchoTotal;
        } else {
            if (lineaActual.length > 0) {
                lineas.push(lineaActual);
            }
            lineaActual = [item];
            anchoActual = anchoPalabra;
        }
    }
    
    if (lineaActual.length > 0) {
        lineas.push(lineaActual);
    }
    
    for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i];
        const esUltimaLinea = (i === lineas.length - 1);
        
        if (!esUltimaLinea && linea.length > 1) {
            let anchoTotal = 0;
            for (let item of linea) {
                doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
                anchoTotal += doc.getTextWidth(item.texto);
            }
            
            const espacioDisponible = maxWidth - anchoTotal;
            const espacioEntrePalabras = espacioDisponible / (linea.length - 1);
            
            let xActual = x;
            for (let item of linea) {
                doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
                doc.text(item.texto, xActual, y);
                xActual += doc.getTextWidth(item.texto) + espacioEntrePalabras;
            }
        } else {
            let xActual = x;
            for (let item of linea) {
                doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
                doc.text(item.texto, xActual, y);
                xActual += doc.getTextWidth(item.texto + ' ');
            }
        }
        
        y += lineHeight;
    }
    
    return y;
}

function closeModal(type) {
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
