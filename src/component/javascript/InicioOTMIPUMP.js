
async function generarPDF() {
    console.log('=== INICIANDO GENERACIÓN DE PDF ===');
    const { jsPDF } = window.jspdf;
    // Configurar tamaño CARTA (Letter): 216 x 279 mm
    const doc = new jsPDF({
        unit: 'mm',
        format: 'letter' // 8.5 x 11 pulgadas = 21.59 x 27.94 cm
    });
    
    // Cargar marca de agua desde la ruta local
    let marcaDeAgua = null;
    try {
        console.log('Intentando cargar marca de agua desde: src/component/img/marcadeaguaTESORERIAMUNICIPAL.png');
        const response = await fetch('src/component/img/marcadeaguaTESORERIAMUNICIPAL.png');
        console.log('Response status:', response.status);
        console.log('Response OK:', response.ok);
        
        const blob = await response.blob();
        console.log('Blob obtenido, tamaño:', blob.size, 'bytes');
        
        marcaDeAgua = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log('Marca de agua convertida a Base64');
                resolve(reader.result);
            };
            reader.readAsDataURL(blob);
        });
        console.log('Marca de agua cargada exitosamente');
    } catch (error) {
        console.error('Error cargando marca de agua:', error);
        alert('No se pudo cargar la marca de agua. Verifica que el archivo existe en: src/component/img/marcadeaguaTESORERIAMUNICIPAL.png');
    }
    
    const datos = {
        numeroMandamiento: 'OTMIPUMP2025' + document.getElementById('numeroMandamiento').value.padStart(4, '0'),
        fecha: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase(),
        numeroFactura: document.getElementById('numeroFactura').value,
        nombreContribuyente: document.getElementById('nombreContribuyente').value.toUpperCase(),
        numeroCedula: document.getElementById('numeroCedula').value,
        anosParafiscal: document.getElementById('anosParafiscal').value,
        direccion: document.getElementById('direccion').value,
        numeroCatastro: document.getElementById('numeroCatastro').value,
        numeroInmobiliario: document.getElementById('numeroInmobiliario').value,
        totalDeuda: document.getElementById('totalDeuda').value.toUpperCase(),
        numeroRadicacion: document.getElementById('numeroRadicacion').value.toUpperCase()
    };
    
    console.log('Datos del formulario:', datos);

    // CONFIGURACIÓN DE MÁRGENES PARA TAMAÑO CARTA
    const marginTop = 50;    // Texto más abajo
    const marginBottom = 25; // Espacio inferior
    const marginLeft = 30;   // Espacio izquierdo
    const marginRight = 30;  // Espacio derecho
    const pageWidth = 215.9; // Ancho Carta en mm (8.5 pulgadas)
    const pageHeight = 279.4; // Alto Carta en mm (11 pulgadas)
    const maxWidth = pageWidth - marginLeft - marginRight; // ~156 mm
    const lineHeight = 5.5; // Espaciado de línea optimizado
    const fontSize = 12;

    // FUNCIONES AUXILIARES PARA TEXTO JUSTIFICADO Y DIVISIÓN DE PALABRAS
    
    // Función para verificar espacio y saltar página si es necesario
    function verificarYSaltarPagina(doc, y, lineHeight, numLineasNecesarias = 1, marcaDeAgua, pageWidth, pageHeight, marginTop, marginBottom) {
        const espacioNecesario = lineHeight * numLineasNecesarias;
        if (y + espacioNecesario > pageHeight - marginBottom) {
            doc.addPage();
            if (marcaDeAgua) {
                doc.addImage(marcaDeAgua, 'PNG', 0, 0, pageWidth, pageHeight, '', 'NONE', 0.15);
            }
            return marginTop;
        }
        return y;
    }
    function procesarTextoConNegritas(texto) {
        const partes = [];
        const regex = /<b>(.*?)<\/b>/g;
        let ultimoIndice = 0;
        let match;
        
        while ((match = regex.exec(texto)) !== null) {
            // Agregar texto normal antes de la negrita
            if (match.index > ultimoIndice) {
                partes.push({ t: texto.substring(ultimoIndice, match.index), b: false });
            }
            // Agregar texto en negrita
            partes.push({ t: match[1], b: true });
            ultimoIndice = regex.lastIndex;
        }
        
        // Agregar texto restante
        if (ultimoIndice < texto.length) {
            partes.push({ t: texto.substring(ultimoIndice), b: false });
        }
        
        return partes.length > 0 ? partes : [{ t: texto, b: false }];
    }

    function dividirPalabra(palabra, doc, maxWidth) {
        const partes = [];
        let parteActual = '';
        
        for (let i = 0; i < palabra.length; i++) {
            const caracter = palabra[i];
            const pruebaParte = parteActual + caracter;
            const anchoParte = doc.getTextWidth(pruebaParte + '-');
            
            if (anchoParte <= maxWidth) {
                parteActual = pruebaParte;
            } else {
                if (parteActual.length > 0) {
                    partes.push(parteActual + '-');
                    parteActual = caracter;
                } else {
                    partes.push(pruebaParte + '-');
                    parteActual = '';
                }
            }
        }
        
        if (parteActual) {
            partes.push(parteActual);
        }
        
        return partes;
    }

    function justificarLinea(doc, texto, x, y, maxWidth) {
        const palabras = texto.split(' ');
        if (palabras.length <= 1) {
            doc.text(texto, x, y);
            return;
        }
        
        const anchoTexto = doc.getTextWidth(texto);
        const espacioTotal = maxWidth - anchoTexto;
        const espacioEntrePalabras = espacioTotal / (palabras.length - 1);
        
        let xActual = x;
        for (let i = 0; i < palabras.length; i++) {
            doc.text(palabras[i], xActual, y);
            xActual += doc.getTextWidth(palabras[i] + ' ') + espacioEntrePalabras;
        }
    }

    function verificarYSaltarPagina(doc, y, lineHeight, numLineasNecesarias = 1) {
        const espacioNecesario = lineHeight * numLineasNecesarias;
        if (y + espacioNecesario > pageHeight - marginBottom) {
            doc.addPage();
            if (marcaDeAgua) {
                doc.addImage(marcaDeAgua, 'PNG', 0, 0, pageWidth, pageHeight, '', 'NONE', 0.15);
            }
            return marginTop;
        }
        return y;
    }

    function agregarTextoJustificado(doc, texto, x, y, maxWidth, lineHeight) {
        const palabras = texto.split(' ');
        let lineas = [];
        let lineaActual = '';
        
        for (let i = 0; i < palabras.length; i++) {
            const palabra = palabras[i];
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
            // Verificar espacio antes de cada línea
            y = verificarYSaltarPagina(doc, y, lineHeight, 1, marcaDeAgua, pageWidth, pageHeight, marginTop, marginBottom);
            
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
        // Construir array de palabras con su estado de negrita
        let palabrasConEstilo = [];
        
        for (let parte of partes) {
            const palabrasDeParte = parte.t.split(' ').filter(p => p.length > 0);
            for (let palabra of palabrasDeParte) {
                palabrasConEstilo.push({ texto: palabra, bold: parte.b });
            }
        }
        
        // Distribuir palabras en líneas
        let lineas = [];
        let lineaActual = [];
        let anchoActual = 0;
        
        for (let i = 0; i < palabrasConEstilo.length; i++) {
            const item = palabrasConEstilo[i];
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
        
        // Renderizar líneas con justificación
        for (let i = 0; i < lineas.length; i++) {
            // Verificar espacio antes de cada línea
            y = verificarYSaltarPagina(doc, y, lineHeight, 1, marcaDeAgua, pageWidth, pageHeight, marginTop, marginBottom);
            
            const linea = lineas[i];
            const esUltimaLinea = (i === lineas.length - 1);
            
            if (!esUltimaLinea && linea.length > 1) {
                // Justificar línea (excepto última)
                let anchoTotal = 0;
                for (let item of linea) {
                    doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
                    anchoTotal += doc.getTextWidth(item.texto);
                }
                
                const espacioDisponible = maxWidth - anchoTotal;
                const espacioEntrePalabras = espacioDisponible / (linea.length - 1);
                
                let xActual = x;
                for (let j = 0; j < linea.length; j++) {
                    const item = linea[j];
                    doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
                    doc.text(item.texto, xActual, y);
                    xActual += doc.getTextWidth(item.texto) + espacioEntrePalabras;
                }
            } else {
                // Última línea o línea con una sola palabra: alineada a la izquierda
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
    
    // Función simplificada que acepta texto con etiquetas <b>
    function agregarTextoConEtiquetas(doc, texto, x, y, maxWidth, lineHeight) {
        const partes = procesarTextoConNegritas(texto);
        return agregarTextoConNegritas(doc, partes, x, y, maxWidth, lineHeight);
    }

    // Agregar marca de agua en primera página - AJUSTADA A TAMAÑO CARTA
    if (marcaDeAgua) {
        console.log('Agregando marca de agua a página 1');
        doc.addImage(marcaDeAgua, 'PNG', 0, 0, pageWidth, pageHeight, '', 'NONE', 0.15);
    } else {
        console.warn('No se agregó marca de agua (no disponible)');
    }

    console.log('Creando títulos página 1...');
    
    // CONFIGURACIÓN INICIAL DE FUENTE
    doc.setFont('helvetica');
    doc.setFontSize(fontSize);
    doc.setTextColor(0, 0, 0);

    let y = marginTop;

    // Títulos - CENTRADOS CON MÁRGENES
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11); // Reducir tamaño de fuente para el título largo
    doc.text(`MANDAMIENTO DE PAGO ${datos.numeroMandamiento} DEL ${datos.fecha}`, pageWidth / 2, y, { 
        align: 'center', 
        maxWidth: maxWidth 
    });
    y += lineHeight;

    doc.setFontSize(11); // Volver a tamaño normal para el segundo título
    doc.text('DENTRO DEL PROCESO ADMINISTRATIVO COACTIVO', pageWidth / 2, y, { 
        align: 'center' 
    });
    y += lineHeight * 2;

    // Restaurar tamaño para el resto del documento
    doc.setFontSize(fontSize);

    // Primer párrafo - JUSTIFICADO
    doc.setFont('helvetica', 'normal');
    const texto1 = `El suscrito funcionario Ejecutor de la Tesorería del Municipio de El Banco, Magdalena, en uso de sus facultades legales, especialmente las conferidas mediante el decreto N° 048, de 19 de marzo 2024, en el cual se le delegan unas funciones y competencias en materia de cobro coactivo del municipio de El Banco Magdalena, El Estatuto Tributario Municipal ACUERDO N° 018, de fecha 30 de diciembre de 2016, artículo 823 del Estatuto Tributario y el artículo 98 del CPACA.`;
    
    y = agregarTextoJustificado(doc, texto1, marginLeft, y, maxWidth, lineHeight);
    y += lineHeight;

    // CONSIDERANDO - CENTRADO
    doc.setFont('helvetica', 'bold');
    doc.text('CONSIDERANDO', pageWidth / 2, y, { align: 'center' });
    y += lineHeight * 1.5;

    doc.setFont('helvetica', 'normal');
    
    console.log('Procesando sección CONSIDERANDO...');
    
    // Segundo párrafo con negritas específicas - JUSTIFICADO
    const parrafo2 = [
        {t: 'Que, en la oficina de Tesorería del municipio de El Banco, Magdalena, obra factura de liquidación oficial del impuesto Predial Unificado factura N° ', b: false},
        {t: datos.numeroFactura, b: true},
        {t: ', estableciendo una obligación a favor de la ', b: false},
        {t: 'ALCALDÍA MUNICIPAL DE EL BANCO, MAGDALENA', b: true},
        {t: ', a cargo del contribuyente ', b: false},
        {t: datos.nombreContribuyente, b: true},
        {t: ', identificado(a), con cedula de ciudadanía N° ', b: false},
        {t: datos.numeroCedula, b: true},
        {t: '. por concepto de Impuesto Predial Unificado de los periodos fiscales ', b: false},
        {t: datos.anosParafiscal, b: true},
        {t: ', sobre el predio ubicado en la dirección ', b: false},
        {t: datos.direccion, b: true},
        {t: ', así mismo se encuentra identificado con cédula catastral N° ', b: false},
        {t: datos.numeroCatastro, b: true},
        {t: ', y matrícula inmobiliaria N° ', b: false},
        {t: datos.numeroInmobiliario, b: true},
        {t: ', adeuda ', b: false},
        {t: datos.totalDeuda, b: true},
        {t: ', más vigencias e intereses de mora que se causen hasta el pago efectivo de la obligación.', b: false}
    ];
    
    y = agregarTextoConNegritas(doc, parrafo2, marginLeft, y, maxWidth, lineHeight);
    y += lineHeight;

    // Tercer párrafo con resolución en bold - JUSTIFICADO
    doc.setFont('helvetica', 'normal');
    const parrafo3 = [
        {t: 'La factura mencionada de liquidación oficial del impuesto Predial Unificado quedo en firme mediante ', b: false},
        {t: datos.numeroRadicacion, b: true},
        {t: ', quedando una obligación clara, expresa y exigible de acuerdo con lo establecido en artículo 828 del Estatuto Tributario Nacional, Acuerdo Municipal N° 018, de fecha 30 de diciembre de 2016, mediante el decreto N° 048, de 19 de marzo 2024, siendo procedente librar mandamiento de pago en contra del contribuyente, con la finalidad de obtener el pago de la obligación, de conformidad con lo establecido en los artículos 826 y siguientes del Estatuto Tributario Nacional.', b: false}
    ];
    
    y = agregarTextoConNegritas(doc, parrafo3, marginLeft, y, maxWidth, lineHeight);
    y += lineHeight * 1.5;

    doc.setFont('helvetica', 'normal');
    doc.text('En mérito de lo expuesto este despacho,', marginLeft, y);
    y += lineHeight * 1.5;

    doc.setFont('helvetica', 'bold');
    doc.text('DISPONE:', pageWidth / 2, y, { align: 'center' });
    y += lineHeight * 1.5;

    console.log('Procesando sección DISPONE...');

    // PRIMERO con negritas en datos - JUSTIFICADO
    const parrafo4 = [
        {t: 'PRIMERO: LIBRAR', b: true},  // ← SIN <b>, solo b: true (minúscula)
        {t: ', mandamiento de pago en contra del señor(a), ', b: false},
        {t: datos.nombreContribuyente, b: true},
        {t: ', identificado(a), con cedula de ciudadanía N° ', b: false},
        {t: datos.numeroCedula, b: true},
        {t: ', a favor de la Alcaldía Municipal de El Banco, conforme a lo expuesto en la parte motiva de este AUTO. Por la suma de ', b: false},
        {t: datos.totalDeuda, b: true},
        {t: ', por concepto del NO pago del impuesto predial unificado, más intereses moratorios hasta que realice el pago de la obligación y costas que genere el proceso.', b: false}
    ];

    y = agregarTextoConNegritas(doc, parrafo4, marginLeft, y, maxWidth, lineHeight);
    y += lineHeight;

    // Verificar espacio para siguiente sección
    y = verificarYSaltarPagina(doc, y, lineHeight, 5, marcaDeAgua, pageWidth, pageHeight, marginTop, marginBottom);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);

    // SEGUNDO con matrícula en bold - JUSTIFICADO
    const parrafo5 = [
        {t: 'SEGUNDO: ORDENAR', b: true},  // ← SIN <b>, solo b: true (minúscula)
        {t: ', el embargo y posterior secuestro del bien inmueble identificado con matrícula inmobiliaria N° ', b: false},
        {t: datos.numeroInmobiliario, b: true},
        {t: ', el cual figura como propiedad del contribuyente mencionado en el presente auto, más el embargo de los productos financieros en las diferentes entidades bancarias de los cuales sea titular el deudor referenciado.', b: false}
    ];

    y = agregarTextoConNegritas(doc, parrafo5, marginLeft, y, maxWidth, lineHeight);
    y += lineHeight;

    // TERCERO - con etiquetas <b> - JUSTIFICADO
    const texto6 = `<b>TERCERO: ADVERTIR</b>, al deudor que las obligaciones objeto de este mandamiento de pago deberán cancelarse dentro de los 10 días siguientes a su notificación, fundado en los artículos 826, 865, del Estatuto Tributario Nacional, y el artículo 353 de Estatuto Tributario Municipal, es menester mencionar que, dentro de los 15 días siguientes a su notificación, podrá proponer las excepciones consagradas en los artículos 830 y 831 del Estatuto Tributario Nacional.`;

    y = agregarTextoConEtiquetas(doc, texto6, marginLeft, y, maxWidth, lineHeight);  // ← CAMBIO AQUÍ
    y += lineHeight;

    // CUARTO - con etiquetas <b> - JUSTIFICADO
    const texto7 = `<b>CUARTO: NOTIFICAR</b>, personalmente el presente mandamiento de pago, al deudor, apoderado, poseedor, herederos determinados e indeterminados en concordancia con el artículo 826 y 565 del Estatuto Tributario Nacional.`;

    y = agregarTextoConEtiquetas(doc, texto7, marginLeft, y, maxWidth, lineHeight);  // ← CAMBIO AQUÍ
    y += lineHeight;

    // QUINTO - con etiquetas <b> - JUSTIFICADO
    const texto8 = `<b>QUINTO: INFORMAR</b>, que contra la presente decisión no procede recurso alguno, de conformidad con el articulo 833-1, del Estatuto Tributario Nacional.`;

    y = agregarTextoConEtiquetas(doc, texto8, marginLeft, y, maxWidth, lineHeight);  // ← CAMBIO AQUÍ
    y += lineHeight * 2;

    // Firma - centrado y bold
    doc.setFont('helvetica', 'bold');
    doc.text('NOTIFÍQUESE Y CÚMPLASE', pageWidth / 2, y, { align: 'center' });
    y += lineHeight * 4.5;

    doc.text('__________________________________', pageWidth / 2, y, { align: 'center' });
    y += lineHeight;
    doc.text('CIRO RAFAEL VARELA PEDROZO', pageWidth / 2, y, { align: 'center' });
    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.text('Tesorero Municipal', pageWidth / 2, y, { align: 'center' });

    const nombreArchivo = `${datos.numeroMandamiento}_${datos.nombreContribuyente.replace(/\s+/g,)}_${datos.numeroRadicacion}.pdf`;
    console.log('Guardando PDF como:', nombreArchivo);
    doc.save(nombreArchivo);
    
    console.log('=== PDF GENERADO EXITOSAMENTE CON FORMATO CARTA ===');
    

}



