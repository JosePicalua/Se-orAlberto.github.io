
const config = {
    marginTop: 50,
    marginBottom: 25,
    marginLeft: 30,
    marginRight: 30,
    pageWidth: 215.9,
    pageHeight: 282.4,
    lineHeight: 5.5,
    fontSize: 12
};
config.maxWidth = config.pageWidth - config.marginLeft - config.marginRight;

// LISTA DE BANCOS PREDEFINIDOS
const bancos = [
    {
        codigo: "AVVILLAS",
        nombre: "BANCO AV VILLAS",
        ciudad: "Bogotá D.C.",
        direccion: "Carrera 13 # 27-00"
    },
    {
        codigo: "COLPATRIA",
        nombre: "BANCO COLPATRIA",
        ciudad: "Santa Marta",
        direccion: "Calle 11 # 5-50"
    },
    {
        codigo: "BANCOLOMBIA",
        nombre: "BANCOLOMBIA",
        ciudad: "Bogotá D.C.",
        direccion: "Carrera 48 # 26-85"
    },
    {
        codigo: "BANCO_AGRARIO",
        nombre: "BANCO AGRARIO DE COLOMBIA",
        ciudad: "El Banco, Magdalena",
        direccion: "Calle 10 # 8-50"
    }
];

// Función para obtener la fecha actual en formato completo en español
function obtenerFechaActualCompleta() {
    const meses = [
        'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
        'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    
    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    
    return `${dia} DE ${mes} DE ${año}`;
}

// Función para obtener fecha en formato YYYY-MM-DD
function obtenerFechaActualISO() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
}

// Función para convertir una fecha a formato completo en español
function formatearFechaCompleta(fechaISO) {
    const meses = [
        'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
        'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    
    const fecha = new Date(fechaISO + 'T00:00:00');
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    
    return `${dia} DE ${mes} DE ${año}`;
}

function obtenerDatosFormulario() {
    // Obtener la fecha base del formulario - CON VALIDACIÓN
    const fechaInput = document.getElementById('fecha');
    const fechaBase = fechaInput && fechaInput.value ? fechaInput.value : '';
    
    // Crear fecha aumentada (fecha base + 10 días)
    let fechaAumentada = '';
    if (fechaBase) {
        const fecha = new Date(fechaBase + 'T00:00:00');
        fecha.setDate(fecha.getDate() + 10);
        
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        const fechaFormateada = `${año}-${mes}-${dia}`;
        
        fechaAumentada = formatearFechaCompleta(fechaFormateada);
    }
    
    // Obtener todos los valores con validación segura
    const nombreInput = document.getElementById('nombreContribuyente');
    const cedulaInput = document.getElementById('cedulaContribuyente');
    const numResolucionInput = document.getElementById('numResolucion');
    const fechaResolucionInput = document.getElementById('fechaResolucion');
    const deudaTextoInput = document.getElementById('deudaTexto');
    const deudaValorInput = document.getElementById('deudaValor');
    
    return {
        fecha: fechaAumentada,
        referencia: "Embargo Jurisdicción Coactiva del Municipio El Banco, Magdalena",
        nit: "891.780.044-2",
        contribuyente: {
            nombre: nombreInput && nombreInput.value ? nombreInput.value : '',
            cedula: cedulaInput && cedulaInput.value ? cedulaInput.value : ''
        },
        resolucion: {
            numero: numResolucionInput && numResolucionInput.value ? numResolucionInput.value : '',
            fecha: fechaResolucionInput && fechaResolucionInput.value ? fechaResolucionInput.value : '',
            fechaCorta: fechaResolucionInput && fechaResolucionInput.value ? fechaResolucionInput.value : ''
        },
        deuda: {
            texto: deudaTextoInput && deudaTextoInput.value ? deudaTextoInput.value : '',
            valor: deudaValorInput && deudaValorInput.value ? deudaValorInput.value : ''
        },
        firmante: {
            nombre: "CIRO RAFAEL VARELA PEDROZO",
            cargo: "Tesorero Municipal"
        }
    };
}

// Función para verificar si hay que crear una nueva página
function verificarNuevaPagina(doc, yPos) {
    const limite = config.pageHeight - config.marginBottom;
    if (yPos >= limite) {
        doc.addPage();
        return config.marginTop;
    }
    return yPos;
}

// Crear PDF para un banco específico
async function crearPDF(datos, banco) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [config.pageWidth, config.pageHeight]
    });

    // CARGAR MARCA DE AGUA (en Base64)
    let marcaDeAgua = null;
    let usarMarcaTexto = false;

    try {
        console.log('Intentando cargar marca de agua desde: src/component/img/marcadeaguaTESORERIAMUNICIPAL.png');
        const response = await fetch('../component/img/marcadeaguaTESORERIAMUNICIPAL.png');
        console.log('Response status:', response.status);
        console.log('Response OK:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        console.log('Blob obtenido, tamaño:', blob.size, 'bytes');
        console.log('Blob tipo:', blob.type);
        
        // Verificar que sea una imagen válida
        if (!blob.type.startsWith('image/')) {
            throw new Error('El archivo no es una imagen válida');
        }
        
        marcaDeAgua = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log('Marca de agua convertida a Base64');
                resolve(reader.result);
            };
            reader.onerror = () => {
                reject(new Error('Error al leer el archivo'));
            };
            reader.readAsDataURL(blob);
        });
        
        console.log('Marca de agua cargada exitosamente');
        console.log('Base64 length:', marcaDeAgua.length);
        
    } catch (error) {
        console.error('Error cargando marca de agua:', error);
        console.warn('Se usará marca de agua de texto como respaldo');
        usarMarcaTexto = true;
    }

    // Función para agregar marca de agua a una página
    const agregarMarcaDeAgua = () => {
        if (marcaDeAgua && !usarMarcaTexto) {
            try {
                // Intentar agregar la imagen
                // La marca de agua cubre toda la página, DEBAJO del contenido de texto
                doc.addImage(marcaDeAgua, 'PNG', 0, 0, config.pageWidth, config.pageHeight, undefined, 'NONE');
            } catch (error) {
                console.error('Error al agregar imagen de marca de agua:', error);
                // Si falla, usar texto
                usarMarcaTexto = true;
                agregarMarcaTexto();
            }
        } else {
            agregarMarcaTexto();
        }
    };
    
    const agregarMarcaTexto = () => {
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.1 }));
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(50);
        
        const centerX = config.pageWidth / 2;
        const centerY = config.pageHeight / 2;
        doc.text('TESORERÍA MUNICIPAL', centerX, centerY, {
            angle: 45,
            align: 'center'
        });
        
        doc.restoreGraphicsState();
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(config.fontSize);
    };
    
    // Agregar marca de agua a la primera página
    agregarMarcaDeAgua();

    let yPos = config.marginTop;

    // Verificar nueva página con marca de agua
    const verificarNuevaPaginaConMarca = async (doc, yPos, espacioNecesario = 30) => {
        if (yPos + espacioNecesario > config.pageHeight - config.marginBottom) {
            doc.addPage();
            // Agregar marca de agua a la nueva página
            agregarMarcaDeAgua();
            return config.marginTop;
        }
        return yPos;
    };

    // Utilidades de renderizado mejoradas
    const textoCentrado = (texto, y, bold = false) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(config.fontSize);
        const textWidth = doc.getTextWidth(texto);
        const x = (config.pageWidth - textWidth) / 2;
        doc.text(texto, x, y);
        return y + config.lineHeight;
    };

    const justificarLinea = (line, y, maxWidth) => {
        const words = line.trim().split(/\s+/);
        if (words.length === 1) {
            doc.text(line, config.marginLeft, y);
            return;
        }

        let totalWordWidth = 0;
        words.forEach(word => {
            totalWordWidth += doc.getTextWidth(word);
        });

        const availableSpace = maxWidth - totalWordWidth;
        const spaceBetweenWords = availableSpace / (words.length - 1);

        let xPos = config.marginLeft;
        words.forEach((word, index) => {
            doc.text(word, xPos, y);
            if (index < words.length - 1) {
                xPos += doc.getTextWidth(word) + spaceBetweenWords;
            }
        });
    };

    const textoNormal = async (texto, y, bold = false, justificado = false) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(config.fontSize);
        const lines = doc.splitTextToSize(texto, config.maxWidth);

        for (let i = 0; i < lines.length; i++) {
            y = await verificarNuevaPaginaConMarca(doc, y);
            const isLastLine = i === lines.length - 1;
            
            if (justificado && !isLastLine) {
                justificarLinea(lines[i], y, config.maxWidth);
            } else {
                doc.text(lines[i], config.marginLeft, y);
            }
            
            if (i < lines.length - 1) {
                y += config.lineHeight;
            }
        }

        return y + config.lineHeight;
    };

    const textoMixto = async (partes, y, justificado = false) => {
        doc.setFontSize(config.fontSize);
        const textoCompleto = partes.map(p => p.texto).join('');
        const lines = doc.splitTextToSize(textoCompleto, config.maxWidth);

        const renderizarLineaMixta = (linea, y) => {
            let xPos = config.marginLeft;
            let textoRestante = linea;

            partes.forEach(parte => {
                const idx = textoRestante.indexOf(parte.texto);
                if (idx !== -1) {
                    // Texto antes de la parte
                    if (idx > 0) {
                        const before = textoRestante.substring(0, idx);
                        doc.setFont('helvetica', 'normal');
                        doc.text(before, xPos, y);
                        xPos += doc.getTextWidth(before);
                    }
                    
                    // La parte actual
                    doc.setFont('helvetica', parte.bold ? 'bold' : 'normal');
                    doc.text(parte.texto, xPos, y);
                    xPos += doc.getTextWidth(parte.texto);
                    
                    textoRestante = textoRestante.substring(idx + parte.texto.length);
                }
            });

            // Texto final si queda algo
            if (textoRestante.length > 0) {
                doc.setFont('helvetica', 'normal');
                doc.text(textoRestante, xPos, y);
            }
        };

        for (let i = 0; i < lines.length; i++) {
            y = await verificarNuevaPaginaConMarca(doc, y);
            const isLastLine = i === lines.length - 1;
            
            if (justificado && !isLastLine) {
                justificarLinea(lines[i], y, config.maxWidth);
            } else {
                renderizarLineaMixta(lines[i], y);
            }
            
            if (i < lines.length - 1) {
                y += config.lineHeight;
            }
        }

        doc.setFont('helvetica', 'normal');
        return y + config.lineHeight;
    };

    // CONTENIDO DEL DOCUMENTO
    const ubicacion = "El Banco, Magdalena";
    const textoCompleto = ubicacion + " " + datos.fecha;

    yPos = await textoNormal(textoCompleto, yPos);
    yPos += config.lineHeight;

    yPos = await textoNormal("SEÑORES", yPos);
    yPos = await textoNormal(banco.nombre, yPos, true);
    yPos = await textoNormal(banco.direccion, yPos);
    yPos = await textoNormal(banco.ciudad, yPos);
    yPos += config.lineHeight;

    yPos = await textoNormal(`REFERENCIA: ${datos.referencia}`, yPos, true);
    yPos = await textoNormal(`NIT. ${datos.nit}`, yPos);
    yPos += config.lineHeight;

    yPos = await textoNormal(`CONTRA: ${datos.contribuyente.nombre}`, yPos, true);
    yPos = await textoNormal(`C.C. ${datos.contribuyente.cedula}`, yPos);
    yPos += config.lineHeight;

    // PÁRRAFO 1 con negrillas
    const parrafo1Partes = [
        {texto: 'Mediante la presente comunico que esta dependencia ha proferido Resolución de Embargo ', bold: false},
        {texto: datos.resolucion.numero, bold: true},
        {texto: ' DEL ', bold: false},
        {texto: datos.resolucion.fecha, bold: true},
        {texto: ', contra el contribuyente ', bold: false},
        {texto: datos.contribuyente.nombre, bold: true},
        {texto: ', identificado con C.C. ', bold: false},
        {texto: datos.contribuyente.cedula, bold: true},
        {texto: ', donde se decreta el embargo y secuestro de dineros depositados en cuentas corrientes y/o de ahorros, o bajo cualquier título o encargo fiduciario, en bancos, corporaciones de ahorro y vivienda, banco fiduciario y compañía de financiamiento comercial y similares en todo el país, que se encuentre a nombre de ', bold: false},
        {texto: datos.contribuyente.nombre, bold: true},
        {texto: ', con C.C. ', bold: false},
        {texto: datos.contribuyente.cedula, bold: true},
        {texto: ', hasta por la suma de ', bold: false},
        {texto: datos.deuda.texto, bold: true},
        {texto: ' (', bold: false},
        {texto: datos.deuda.valor, bold: true},
        {texto: '). Sírvase consignar los dineros embargados a favor del Municipio de El Banco, Magdalena en cuentas de depósito judicial del Banco Agrario de El Banco, Magdalena.', bold: false}
    ];

    yPos = await textoMixto(parrafo1Partes, yPos, true);
    yPos += config.lineHeight;

    // PÁRRAFO 2
    const parrafo2 = `Se le comunica a las entidades encargadas de cumplir esta medida que su inobservancia o incumplimiento a lo aquí ordenado, los hace responsables solidariamente del pago de esta orden tributaria, Artículo 795 del Estatuto Tributario Nacional, además, las entidades requeridas están obligadas en todos los casos a dar pronta y cumplida respuesta a esta administración, so pena de ser sancionada al tenor del Artículo 651 literal a) del mismo Estatuto, esto, en armonía con lo dispuesto por el Artículo 59 de la Ley 788 de 2002.`;

    yPos = await textoNormal(parrafo2, yPos, false, true);
    yPos += config.lineHeight;

    // PÁRRAFO 3
    const parrafo3 = `Se anexa copia del Acta de posesión del funcionario quien suscribe la presente comunicación y la Resolución de embargo N°. ${datos.resolucion.numero}, del ${datos.resolucion.fechaCorta}.`;

    yPos = await textoNormal(parrafo3, yPos, false, true);
    yPos += config.lineHeight * 2;

    // FIRMAS
    yPos = await verificarNuevaPaginaConMarca(doc, yPos, 60);
    yPos = await textoNormal("Cordialmente,", yPos);
    yPos += config.lineHeight * 4;

    yPos = await verificarNuevaPaginaConMarca(doc, yPos, 40);
    yPos = textoCentrado("_________________________________", yPos);
    yPos = textoCentrado(datos.firmante.nombre, yPos, true);
    yPos = textoCentrado(datos.firmante.cargo, yPos);

    return doc;
}

// Previsualizar PDF (muestra solo el primer banco)
async function previsualizarPDF() {
    try {
        const datos = obtenerDatosFormulario();
        
        if (!datos.contribuyente.nombre || !datos.contribuyente.cedula) {
            alert('Por favor complete los campos obligatorios del contribuyente');
            return;
        }
        
        console.log('Generando previsualización...');
        const banco = bancos[0];
        const pdf = await crearPDF(datos, banco);
        const blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);
        
        const previewFrame = document.getElementById('pdfPreview');
        const previewArea = document.getElementById('previewArea');
        
        if (previewFrame) {
            previewFrame.src = url;
            console.log('PDF cargado en preview');
        }
        if (previewArea) {
            previewArea.classList.add('active');
        }
    } catch (error) {
        console.error('Error al previsualizar:', error);
        alert('Error al generar PDF: ' + error.message);
    }
}

// Descargar PDFs individuales por cada banco
async function descargarPDFs() {
    try {
        const datos = obtenerDatosFormulario();
        
        if (!datos.contribuyente.nombre || !datos.contribuyente.cedula) {
            alert('Por favor complete los campos obligatorios del contribuyente');
            return;
        }
        
        console.log(`Generando ${bancos.length} PDFs...`);
        
        for (let i = 0; i < bancos.length; i++) {
            const banco = bancos[i];
            console.log(`Generando PDF ${i + 1}/${bancos.length}: ${banco.nombre}`);
            
            const pdf = await crearPDF(datos, banco);
            const nombreArchivo = `${banco.codigo}_${datos.contribuyente.nombre.replace(/\s+/g, "_")}.pdf`;
            pdf.save(nombreArchivo);
            
            // Pausa entre descargas
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        alert(`Se han generado ${bancos.length} PDFs correctamente.`);
    } catch (error) {
        console.error('Error al generar PDFs:', error);
        alert('Error al generar PDFs: ' + error.message);
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando generador de PDFs...');
    
    // Conversión automática a mayúsculas
    const upperCaseInputs = ['nombreContribuyente', 'numResolucion', 'fechaResolucion', 'deudaTexto'];
    upperCaseInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                this.value = this.value.toUpperCase();
            });
        }
    });
    
    // Formateo de cédula con puntos
    const cedulaInput = document.getElementById('cedulaContribuyente');
    if (cedulaInput) {
        cedulaInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            this.value = value;
        });
    }
    
    // Inicializar fechas
    const fechaInput = document.getElementById('fecha');
    const fechaResolucionInput = document.getElementById('fechaResolucion');
    
    if (fechaInput && typeof obtenerFechaActualISO === 'function') {
        fechaInput.value = obtenerFechaActualISO();
    }
    if (fechaResolucionInput && typeof obtenerFechaActualCompleta === 'function') {
        fechaResolucionInput.value = obtenerFechaActualCompleta();
    }
});

// Exponer funciones globalmente
window.previsualizarPDF = previsualizarPDF;
window.descargarPDFs = descargarPDFs;