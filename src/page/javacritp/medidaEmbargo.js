const { jsPDF } = window.jspdf;

        // Función para formatear fecha
        function formatearFecha(fecha) {
            if (!fecha) return '';
            const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', opciones);
        }

        async function generarmedidaEmbargo() {
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

            //RECIBIR DATOS DEL FORMULARIO DE totalEmbargo Y VOLVERLO EN FLOAT CON PUNTO 1000000 = 1.000.000,00
            function formatearTotalEmbargo(valor) {
                if (!valor) return '___';
                const numero = parseFloat(valor);
                return numero.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }

            // HACER QUE LA FECHA VAYA CON DIA MES EN TEXTO Y AÑO EN NUMERO (EJEMPLO: 15 DE MARZO DE 2024)
            function formatearFechaCompleta(fecha) {
                if (!fecha) return '___';
                const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
                return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', opciones).toUpperCase();
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
            const numeroResolucion = document.getElementById('numeroResolucion').value || '___';
            const fechaResolucion = formatearFechaCompleta(document.getElementById('fechaResolucion').value) || '___';
            const numeroResolucionCoactivo = document.getElementById('numeroResolucionCoactivo').value || '___';
            const numeroDocumento = formatearNumeroDocumento(document.getElementById('numeroDocumento').value) || '___';
            const nombreTitular = document.getElementById('nombreTitular').value || '___';
            const totalEmbargo = formatearTotalEmbargo(document.getElementById('totalEmbargo').value.replace(/\./g, '')) || '___';
            const tituloConstituido = document.getElementById('tituloConstituido').value || '___';
            const fechaGeneradoDocumento = formatearFechaCompleta(document.getElementById('fechaGeneradoDocumento').value) || '___';
                        // TEXTOS PREDETERMINADOS CON REEMPLAZOS
            const TITULO = `RESOLUCIÓN ${numeroResolucion} DEL ${fechaResolucion}`;
            
            const SUBTITULO = `"POR MEDIO DE LA CUAL SE DECRETA MEDIDA CAUTELAR DE EMBARGO DE DINEROS EN ENTIDADES FINANCIERAS, DENTRO DE UN PROCESO ADMINISTRATIVO DE COBRO COACTIVO POR CONCEPTO DEL IMPUESTO PREDIAL UNIFICADO"`;
            
            const TEXTO1 = `EL TESORERO MUNICIPAL DE EL BANCO, MAGDALENA, en su calidad de FUNCIONARIO EJECUTOR, en ejercicio de las facultades legales conferidas por el Decreto Municipal N°. 048 de 2024, ACUERDO N° 018, de fecha 30 de diciembre de 2016, Estatuto Tributario Municipal de El Banco Magdalena, el Estatuto Tributario Nacional aplicable por remisión, y CONSIDERANDO,`;
            
            const TEXTO2 = `PRIMERO: Que el Municipio de El Banco, Magdalena, adelanta proceso administrativo de cobro coactivo identificado con el expediente N° ${numeroResolucionCoactivo}, en contra del señor(a) ${nombreTitular}, identificado(a) con cédula de ciudadanía / NIT N° ${numeroDocumento}`;
            
            const TEXTO3 = `SEGUNDO: Que el contribuyente adeuda al Municipio de El Banco, Magdalena, la suma total de $ ${totalEmbargo} , correspondiente al Impuesto Predial Unificado, conforme al título ejecutivo constituido por ${tituloConstituido}, debidamente ejecutoriado.`;
            
            const TEXTO4 = `TERCERO: Que la obligación objeto de cobro es clara, expresa y actualmente exigible, en los términos de los artículos 828 y siguientes del Estatuto Tributario Nacional, aplicables por remisión del Estatuto Tributario Municipal.`;
            
            const TEXTO5 = `CUARTO: Que de conformidad con el Decreto Municipal N°. 048 de 2024, y el artículo 837 del Estatuto Tributario Nacional, el funcionario ejecutor se encuentra legalmente facultado para decretar embargo de bienes y dineros del deudor, antes o después de librado el mandamiento de pago, con el fin de asegurar la efectividad del recaudo de las obligaciones fiscales a favor de la entidad territorial.`;

            const TEXTO6 = `En mérito de lo expuesto,`;

            const TEXTO7 = `RESUELVE`;
            
            const TEXTO8 = `ARTÍCULO PRIMERO: DECRETAR el EMBARGO de los dineros, depósitos, productos financieros, cuentas de ahorro, cuentas corrientes, CDT y cualquier otro título o producto financiero que el señor(a) ${nombreTitular}, identificado(a) con cédula de ciudadanía / NIT N° ${numeroDocumento}, posea o llegare a poseer en las entidades financieras vigiladas por la Superintendencia Financiera de Colombia, hasta concurrencia de la suma de $ ${totalEmbargo}.`;

            const TEXTO9 = `ARTÍCULO SEGUNDO: OFICIAR a las entidades financieras correspondientes para que procedan de manera inmediata a dar cumplimiento a la presente medida cautelar, y remitan a esta Tesorería Municipal informe detallado sobre el resultado del embargo, dentro de los términos legales.`;

            const TEXTO10 = `ARTÍCULO TERCERO: ADVERTIR que contra el presente acto no procede recurso alguno, de conformidad con lo dispuesto en el artículo 833-1 del Estatuto Tributario Nacional.`;

            const TEXTO11 = `ARTÍCULO CUARTO: NOTIFICAR el presente acto administrativo al deudor, mediante página Web del Municipio, y conforme a las reglas de notificación previstas en el Estatuto Tributario y en el Código de Procedimiento Administrativo y de lo Contencioso Administrativo.`;

            const TEXTO12 = `COMUNÍQUESE, NOTIFÍQUESE Y CÚMPLASE.`;

            const TEXTO13 = `Dado en El Banco, Magdalena, a los ${fechaGeneradoDocumento}.`;

            const ATENTAMENTE = `ATENTAMENTE`;

            const FIRMA = `CIRO RAFAEL VALERA PEDROZO
            Tesorero Municipal
            Municipio de El Banco – Magdalena`;

            // Hacer que lo que esta en ${} tambien vaya en negrita

            const TEXTO_EN_NEGRITA = [
                numeroResolucion,
                fechaResolucion,
                numeroResolucionCoactivo,
                nombreTitular,
                numeroDocumento,
                totalEmbargo,
                fechaGeneradoDocumento
            ];

            function debeSerNegrita(palabra) {
                return TEXTO_EN_NEGRITA.includes(palabra);
            }


            // Palabras que van en negrita
            const palabrasNegrita = ['RESOLUCIÓN N°', 'DICIEMBRE DE', 'COMUNÍQUESE', 'NOTIFÍQUESE', 'CÚMPLASE', 'ARTÍCULO', 'CUARTO', ',NOTIFICAR', 'ARTÍCULO', 'TERCERO', 'ADVERTIR', 'ARTÍCULO', 'SEGUNDO', 'OFICIAR', 'ARTÍCULO', 'PRIMERO', 'DECRETAR', 'RESUELVE', 'PRIMERO:', 'SEGUNDO:', 'TERCERO:', 'CUARTO:', 'QUINTO'];

            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [pageWidth, pageHeight]
            });

            let yPosition = marginTop;

           // Función para agregar marca de agua a una página
            function agregarMarcaDeAgua() {
                if (marcaDeAgua) {
                    try {
                        // La marca de agua cubre toda la página
                        doc.addImage(marcaDeAgua, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'NONE');
                    } catch (error) {
                        console.error('Error al agregar imagen de marca de agua:', error);
                    }
                }
            }
                        

    // Agregar marca de agua a

            function verificarEspacio(alturaRequerida) {
                if (yPosition + alturaRequerida > pageHeight - marginBottom) {
                    doc.addPage();
                    agregarMarcaDeAgua();
                    yPosition = marginTop;
                }
            }

            function debeSerNegrita(palabra) {
                const palabraSinSignos = palabra.replace(/[.,;:!?¿¡"'()]/g, '').toUpperCase();
                return palabrasNegrita.some(pn => palabraSinSignos.includes(pn));
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

            // Generar PDF
            agregarMarcaDeAgua();

            agregarTextoConNegritas(TITULO, 'center', tituloFontSize);
            yPosition += espacioTitulo;

            agregarTextoConNegritas(SUBTITULO, 'center', subtituloFontSize);
            yPosition += espacioSubtitulo;

            agregarTextoConNegritas(TEXTO1, 'left', fontSize);
            yPosition += espacioEntreTextos;

            agregarTextoConNegritas(TEXTO2, 'left', fontSize);
            yPosition += espacioEntreTextos;

            agregarTextoConNegritas(TEXTO3, 'left', fontSize);
            yPosition += espacioEntreTextos;

            agregarTextoConNegritas(TEXTO4, 'left', fontSize);
            yPosition += espacioEntreTextos;

            agregarTextoConNegritas(TEXTO5, 'left', fontSize);
            yPosition += espacioEntreTextos;

            agregarTextoConNegritas(TEXTO6, 'left', fontSize);
            yPosition += espacioEntreTextos;
            
            agregarTextoConNegritas(TEXTO7, 'left', fontSize);
            yPosition += espacioEntreTextos;

            agregarTextoConNegritas(TEXTO8, 'left', fontSize);
            yPosition += espacioEntreTextos;

            agregarTextoConNegritas(TEXTO9, 'left', fontSize);
            yPosition += espacioEntreTextos;
            
            agregarTextoConNegritas(TEXTO10, 'left', fontSize);
            yPosition += espacioEntreTextos;

            agregarTextoConNegritas(TEXTO11, 'left', fontSize);
            yPosition += espacioEntreTextos;

            agregarTextoConNegritas(TEXTO12, 'left', fontSize);
            yPosition += espacioEntreTextos;

            agregarTextoConNegritas(TEXTO13, 'left', fontSize);

            yPosition += 30;
            agregarTextoConNegritas(ATENTAMENTE, 'center', fontSize);
            yPosition += espacioEntreTextos * 4;

            // Agregar cada línea de la firma por separado y centrada
            const lineasFirma = FIRMA.split('\n');
            lineasFirma.forEach((linea, index) => {
                verificarEspacio(lineHeight);
                doc.setFont(undefined, index === 0 ? 'bold' : 'normal'); // Primera línea en negrita
                doc.text(linea.trim(), pageWidth / 2, yPosition, { align: 'center' });
                yPosition += lineHeight;
            });

            // Mostrar loader
            document.getElementById('pdfLoader').style.display = 'flex';
            document.getElementById('btnGenerarPdf_').disabled = true;

            // Dar tiempo para que se muestre el loader
            setTimeout(() => {
                doc.save(`Resolucion_${numeroResolucion}_${nombreTitular}_${fechaResolucion}.pdf`);
                
                // Ocultar loader
                setTimeout(() => {
                    document.getElementById('pdfLoader').style.display = 'none';
                    document.getElementById('btnGenerarPdf_').disabled = false;
                }, 500);
            }, 100);
        }

document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[required], input[type="number"], input[type="date"]');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.style.borderColor = '#28a745';
                this.style.backgroundColor = '#d4edda';
            } else {
                this.style.borderColor = '#ddd';
                this.style.backgroundColor = '#fff';
            }
        });
        
        // Verificar al cargar si ya tiene valor
        if (input.value.trim() !== '') {
            input.style.borderColor = '#28a745';
            input.style.backgroundColor = '#d4edda';
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Formatear Número de Documento
    const numeroDocumento = document.getElementById('numeroDocumento');
    
    numeroDocumento.addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\./g, '').replace(/\D/g, ''); // Quitar puntos y no números
        e.target.value = formatearNumero(valor);
    });

    // Formatear Total del Embargo
    const totalEmbargo = document.getElementById('totalEmbargo');
    
    totalEmbargo.addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\./g, '').replace(/\D/g, ''); // Quitar puntos y no números
        e.target.value = formatearNumero(valor);
    });

    // Función para formatear con puntos de miles
    function formatearNumero(numero) {
        if (!numero) return '';
        return numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
});