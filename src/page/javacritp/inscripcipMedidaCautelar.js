const { jsPDF } = window.jspdf;

        // Función para formatear fecha
        function formatearFecha(fecha) {
            if (!fecha) return '';
            const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', opciones);
        }

        async function generarmedidaEmbargoCautelar() {
            // CONFIGURACIÓN DE MÁRGENES
            const marginTop = 45;        
            const marginBottom = 65;     
            const marginLeft = 30;       
            const marginRight = 25;      
            const pageWidth = 215.9;     
            const pageHeight = 279.4;    
            const maxWidth = pageWidth - marginLeft - marginRight;
            const lineHeight = 5.5;
            const fontSize = 12;
            const tituloFontSize = 14;
            const subtituloFontSize = 13;
            
            const espacioTitulo = 12;
            const espacioSubtitulo = 10;
            const espacioEntreTextos = 8;


            // Cargar marca de agua
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
                console.error('Error cargando marca de agua:', error);
            }


            // HACER QUE LA FECHA VAYA CON DIA MES EN TEXTO Y AÑO EN NUMERO (EJEMPLO: 15 DE MARZO DE 2024)
            function formatearFechaCompleta(fecha) {
                if (!fecha) return '___';
                const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
                return new Date(fecha + 'T00:00:00')
                    .toLocaleDateString('es-ES', opciones)
                    .toLowerCase();
            }


            // HACER QUE NUMERO DE DOCMUENTO QUEDE ASI 1217988920 A 1.216.978.920
            // HACER QUE NUMERO DE DOCUMENTO QUEDE ASI 1217988920 A 1.216.978.920
            function formatearNumeroDocumento(valor) {
                if (!valor) return '___';
                const valorLimpio = valor.replace(/\./g, ''); // Quitar puntos
                const numero = parseInt(valorLimpio, 10);
                return numero.toLocaleString('es-CO');
            }

            // Obtener datos del formulario
            const fechaResolucion = formatearFechaCompleta(document.getElementById('fechaResolucion').value) || '___';
            const numeroResolucionCoactivo = document.getElementById('numeroResolucionCoactivo').value || '___';
            const numeroDocumento = formatearNumeroDocumento(document.getElementById('numeroDocumento').value) || '___';
            const nombreTitular = document.getElementById('nombreTitular').value || '___';
            const numeroMatriculaInmobilaria = document.getElementById('numeroMatriculaInmobilaria').value || '___';
            const cedulaCatastral = document.getElementById('cedulaCatastral').value || '___';
            const direcciondelPredio = document.getElementById('direcciondelPredio').value || '___';
            const fechaGeneradoDocumento = formatearFechaCompleta(document.getElementById('fechaGeneradoDocumento').value) || '___';
                        // TEXTOS PREDETERMINADOS CON REEMPLAZOS
            // Este es un documento DIFERENTE - es una SOLICITUD, no una RESOLUCIÓN
            // Debería ir en una nueva sección o función separada

            // ===== VARIABLES DE CONTENIDO =====
            const ENCABEZADO_FECHA = `El Banco, Magdalena, a ${fechaResolucion}`;

            const DESTINATARIO_LINEA1 = `Señor:`;
            const DESTINATARIO_LINEA2 = `REGISTRADOR DE INSTRUMENTOS PÚBLICOS`;
            const DESTINATARIO_LINEA3 = `Oficina de Registro de Instrumentos Públicos de El Banco – Magdalena.`;


            const ASUNTO = `ASUNTO: SOLICITUD DE INSCRIPCIÓN DE MEDIDA CAUTELAR DE EMBARGO SOBRE BIEN INMUEBLE – PROCESO DE COBRO COACTIVO POR IMPUESTO PREDIAL UNIFICADO.`;

            const CUERPO_SOLICITUD = `En mi calidad de Tesorero Municipal de El Banco, Magdalena, actuando como funcionario ejecutor dentro del proceso administrativo de cobro coactivo, y en ejercicio de las facultades conferidas, Estatuto Tributario Municipal de El Banco, Estatuto Tributario Nacional y normas concordantes, respetuosamente me permito SOLICITAR la inscripción de la medida cautelar de EMBARGO decretada mediante Resolución No ${numeroResolucionCoactivo} de fecha ${fechaGeneradoDocumento}, proferida dentro del proceso de cobro coactivo que se adelanta contra del Contribuyente: ${nombreTitular} (identificado/a), con cédula de ciudadanía Nº ${numeroDocumento}, al inmueble identificado con matrícula inmobiliaria Nº 224- ${numeroMatriculaInmobilaria}, cédula Catastral Nº ${cedulaCatastral}, ubicado en la dirección ${direcciondelPredio}.`;

            const FUNDAMENTO_LEGAL = `La medida cautelar se decreta como garantía del crédito fiscal correspondiente a obligaciones insolutas por concepto de Impuesto Predial Unificado, intereses y sanciones, conforme a lo dispuesto en: Artículos 823, 824, 825, 828, 829 y 837 del Estatuto Tributario Nacional, normas pertinentes establecidas en el Estatuto Tributario Municipal de El Banco, Magdalena.`;

            const PETICION = `En consecuencia, se solicita se realice la anotación correspondiente en el folio de matrícula inmobiliaria, dejando constancia de la prohibición de enajenar o gravar el inmueble mientras subsista la medida cautelar o hasta nueva orden de esta autoridad administrativa.`;

            const ANEXOS = `Se anexa para lo de su competencia: Copia auténtica de la Resolución que decreta el embargo, Copia del mandamiento de pago, Documentos soporte pertinentes.`;

            const CIERRE_SOLICITUD = `Agradezco se sirva informar a esta Tesorería Municipal una vez efectuada la inscripción solicitada.`;

            const DESPEDIDA = `Atentamente,`;

            const FIRMA_SOLICITUD = `CIRO RAFAEL VARELA PEDROZO`;

            const puesto_firma = `Tesorero Municipal`;

            // ===== CONFIGURACIÓN DE NEGRITAS =====
            const TEXTO_EN_NEGRITA = [
                fechaResolucion,
                numeroResolucionCoactivo,
                nombreTitular,
                numeroDocumento,
                fechaGeneradoDocumento
            ];

            const palabrasNegrita = [
                'RESOLUCIÓN N°', 
                'DICIEMBRE DE', 
                'COMUNÍQUESE', 
                'NOTIFÍQUESE',  // ✅ Sin coma al inicio
                'CÚMPLASE', 
                'ARTÍCULO', 
                'CUARTO', 
                'TERCERO', 
                'SEGUNDO', 
                'PRIMERO', 
                'DECRETAR', 
                'OFICIAR',
                'ADVERTIR',
                'NOTIFICAR',
                'RESUELVE', 
                'PRIMERO:', 
                'SEGUNDO:', 
                'TERCERO:', 
                'CUARTO:', 
                'QUINTO',
                'SOLICITAR',
                'EMBARGO',
                'SOLICITUD',
                'ASUNTO:'
            ];

            // ===== FUNCIÓN ÚNICA DE NEGRITAS =====
            function debeSerNegrita(palabra) {
                // Verificar primero si está en el array de valores dinámicos
                if (TEXTO_EN_NEGRITA.includes(palabra)) {
                    return true;
                }
                
                // Luego verificar si contiene palabras clave
                const palabraSinSignos = palabra.replace(/[.,;:!?¿¡"'()]/g, '').toUpperCase();
                return palabrasNegrita.some(pn => palabraSinSignos.includes(pn));
            }

            // ===== RESTO DEL CÓDIGO (SIN CAMBIOS) =====
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [pageWidth, pageHeight]
            });

            let yPosition = marginTop;

            function agregarMarcaDeAgua() {
                if (marcaDeAgua) {
                    try {
                        doc.addImage(marcaDeAgua, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'NONE');
                    } catch (error) {
                        console.error('Error al agregar imagen de marca de agua:', error);
                    }
                }
            }

            function verificarEspacio(alturaRequerida) {
                if (yPosition + alturaRequerida > pageHeight - marginBottom) {
                    doc.addPage();
                    agregarMarcaDeAgua();
                    yPosition = marginTop;
                }
            }

            function agregarTextoConNegritas(texto, alineacion = 'left', tamanioFuente = fontSize) {
        if (!texto || texto.trim() === '') return;

        doc.setFontSize(tamanioFuente);
        const palabras = texto.split(' ');
        const lineas = [];
        let lineaActual = [];
        let anchoLineaActual = 0;

        palabras.forEach(palabra => {
            const anchoPalabra = doc.getTextWidth(palabra + ' ');
            
            if (anchoLineaActual + anchoPalabra <= maxWidth) {
                lineaActual.push(palabra);
                anchoLineaActual += anchoPalabra;
            } else {
                if (lineaActual.length > 0) {
                    lineas.push(lineaActual);
                }
                lineaActual = [palabra];
                anchoLineaActual = anchoPalabra;
            }
        });
        
        if (lineaActual.length > 0) {
            lineas.push(lineaActual);
        }

        lineas.forEach((linea, indexLinea) => {
            verificarEspacio(lineHeight);
            
            const esUltimaLinea = indexLinea === lineas.length - 1;
            let xPos = marginLeft;

            if (alineacion === 'center') {
                const anchoTotal = linea.reduce((sum, p) => sum + doc.getTextWidth(p + ' '), 0);
                xPos = (pageWidth - anchoTotal) / 2;
            }

            const espacioDisponible = alineacion === 'left' && !esUltimaLinea && linea.length > 1
                ? (maxWidth - linea.reduce((sum, p) => sum + doc.getTextWidth(p), 0) - doc.getTextWidth(' ') * (linea.length - 1)) / (linea.length - 1)
                : 0;

            linea.forEach((palabra, index) => {
                const esNegrita = debeSerNegrita(palabra);
                
                doc.setFont(undefined, esNegrita ? 'bold' : 'normal');
                doc.text(palabra, xPos, yPosition);
                
                xPos += doc.getTextWidth(palabra) + doc.getTextWidth(' ') + espacioDisponible;
            });

            yPosition += lineHeight;
        });

        doc.setFont(undefined, 'normal');
    }

    // ===== GENERAR PDF =====
    agregarMarcaDeAgua();

    agregarTextoConNegritas(ENCABEZADO_FECHA, 'left', fontSize);
    yPosition += espacioEntreTextos;

    // ✅ DESTINATARIO EN 3 LÍNEAS SEPARADAS
    agregarTextoConNegritas(DESTINATARIO_LINEA1, 'left', fontSize);
    yPosition += lineHeight;

    agregarTextoConNegritas(DESTINATARIO_LINEA2, 'left', fontSize);
    yPosition += lineHeight;

    agregarTextoConNegritas(DESTINATARIO_LINEA3, 'left', fontSize);
    yPosition += espacioEntreTextos;

    agregarTextoConNegritas(ASUNTO, 'left', fontSize);
    yPosition += espacioEntreTextos;

    agregarTextoConNegritas(CUERPO_SOLICITUD, 'left', fontSize);
    yPosition += espacioEntreTextos;

    agregarTextoConNegritas(FUNDAMENTO_LEGAL, 'left', fontSize);
    yPosition += espacioEntreTextos;

    agregarTextoConNegritas(PETICION, 'left', fontSize);
    yPosition += espacioEntreTextos;

    agregarTextoConNegritas(ANEXOS, 'left', fontSize);
    yPosition += espacioEntreTextos;

    agregarTextoConNegritas(CIERRE_SOLICITUD, 'left', fontSize);
    yPosition += espacioEntreTextos * 2;

    agregarTextoConNegritas(DESPEDIDA, 'left', fontSize);
    yPosition += espacioEntreTextos * 4;

    agregarTextoConNegritas(FIRMA_SOLICITUD, 'center', fontSize);
    yPosition += lineHeight;

    agregarTextoConNegritas(puesto_firma, 'center', fontSize);
    yPosition += lineHeight;

    // ===== RESTO SIN CAMBIOS =====
    document.getElementById('pdfLoader').style.display = 'flex';
    document.getElementById('btnGenerarPdf_').disabled = true;

    setTimeout(() => {
        doc.save(`Inscripcion_medida_Cautelar_${numeroResolucionCoactivo}_${nombreTitular}_${fechaResolucion}.pdf`);
        
        setTimeout(() => {
            document.getElementById('pdfLoader').style.display = 'none';
            document.getElementById('btnGenerarPdf_').disabled = false;
        }, 500);
    }, 100);
            }