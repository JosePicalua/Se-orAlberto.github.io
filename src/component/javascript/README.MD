configuracion de PDF
// ============================================
// CONFIGURACIÓN DE PÁGINA Y MÁRGENES
// ============================================
const { jsPDF } = window.jspdf;
const doc = new jsPDF({
    unit: 'mm',
    format: 'letter' // Tamaño CARTA: 21.59 x 27.94 cm
});

// DIMENSIONES DE LA PÁGINA
const pageWidth = 215.9;   // Ancho en mm (8.5 pulgadas)
const pageHeight = 279.4;  // Alto en mm (11 pulgadas)

// MÁRGENES (ajusta estos valores según necesites)
const marginTop = 25;      // Margen superior (2.5 cm) - AUMENTA para bajar todo el contenido
const marginLeft = 30;     // Margen izquierdo (3 cm)
const marginRight = 30;    // Margen derecho (3 cm)
const marginBottom = 25;   // Margen inferior (2.5 cm) - Espacio antes del salto de página

// ÁREA ÚTIL PARA TEXTO
const maxWidth = pageWidth - marginLeft - marginRight; // ~156 mm de ancho útil

// CONFIGURACIÓN DE FUENTE
const fontSize = 12;        // Tamaño base de fuente (12pt)
const lineHeight = 5.5;     // Espaciado entre líneas (5.5mm)

// ============================================
// CÓMO USAR LOS MÁRGENES
// ============================================

// 1. INICIAR POSICIÓN Y (siempre empieza desde marginTop)
let y = marginTop;

// 2. CONFIGURAR FUENTE INICIAL
doc.setFont('helvetica');       // Fuente: helvetica (similar a Arial)
doc.setFontSize(fontSize);      // Tamaño: 12pt
doc.setTextColor(0, 0, 0);      // Color: negro

// ============================================
// TIPOS DE ALINEACIÓN
// ============================================

// TEXTO CENTRADO
doc.setFont('helvetica', 'bold');
doc.text('TÍTULO CENTRADO', pageWidth / 2, y, { align: 'center' });
y += lineHeight;

// TEXTO CENTRADO CON ANCHO MÁXIMO (para títulos largos)
doc.text('TÍTULO MUY LARGO QUE SE AJUSTA', pageWidth / 2, y, { 
    align: 'center',
    maxWidth: maxWidth 
});
y += lineHeight * 2; // Doble espacio después del título

// TEXTO JUSTIFICADO (respeta márgenes izquierdo y derecho)
doc.setFont('helvetica', 'normal');
const textoJustificado = `Este es un párrafo largo que se justificará automáticamente...`;
y = agregarTextoJustificado(doc, textoJustificado, marginLeft, y, maxWidth, lineHeight);
y += lineHeight; // Espacio después del párrafo

// ============================================
// TEXTO CON NEGRITAS - DOS FORMAS
// ============================================

// FORMA 1: Con etiquetas <b> (MÁS FÁCIL)
const textoConNegrita = `Este es <b>texto en negrita</b> y esto es normal.`;
y = agregarTextoConEtiquetas(doc, textoConNegrita, marginLeft, y, maxWidth, lineHeight);
y += lineHeight;

// FORMA 2: Con array de partes
const partes = [
    {t: 'Texto normal ', b: false},
    {t: 'TEXTO EN NEGRITA', b: true},
    {t: ' más texto normal', b: false}
];
y = agregarTextoConNegritas(doc, partes, marginLeft, y, maxWidth, lineHeight);
y += lineHeight;

// ============================================
// CAMBIAR TAMAÑO DE FUENTE
// ============================================

// Cambiar temporalmente el tamaño
doc.setFontSize(11);  // Más pequeño
doc.text('Texto más pequeño', pageWidth / 2, y, { align: 'center' });
y += lineHeight;

// Restaurar tamaño original
doc.setFontSize(fontSize);  // Volver a 12pt

// ============================================
// CAMBIAR ESTILO DE FUENTE
// ============================================

doc.setFont('helvetica', 'normal');  // Normal
doc.setFont('helvetica', 'bold');    // Negrita
doc.setFont('helvetica', 'italic');  // Cursiva (itálica)

// ============================================
// ESPACIADO PERSONALIZADO
// ============================================

y += lineHeight;      // Espacio simple
y += lineHeight * 2;  // Doble espacio
y += lineHeight * 1.5; // Espacio y medio

// ============================================
// CONTROL DE SALTOS DE PÁGINA
// ============================================

// Verificar si hay espacio antes de escribir
y = verificarYSaltarPagina(doc, y, lineHeight, 5, marcaDeAgua, pageWidth, pageHeight, marginTop, marginBottom);
// El 5 significa: necesito espacio para al menos 5 líneas

// ============================================
// AGREGAR MARCA DE AGUA
// ============================================

// En cada página (se hace automáticamente con verificarYSaltarPagina)
if (marcaDeAgua) {
    doc.addImage(marcaDeAgua, 'PNG', 0, 0, pageWidth, pageHeight, '', 'NONE', 0.15);
    // 0.15 = 15% de opacidad
}

// ============================================
// GUARDAR EL PDF
// ============================================

doc.save('nombre_archivo.pdf');

// ============================================
// RESUMEN RÁPIDO DE VALORES COMUNES
// ============================================

/*
MÁRGENES COMUNES:
- marginTop: 20-30 mm (20=arriba, 30=más abajo)
- marginLeft/Right: 25-30 mm
- marginBottom: 20-25 mm

TAMAÑOS DE FUENTE:
- 9pt: Muy pequeño
- 10pt: Pequeño
- 11pt: Reducido
- 12pt: Normal (estándar)
- 14pt: Grande
- 16pt: Muy grande

ESPACIADO:
- lineHeight: 5-6 mm (5=compacto, 6=espaciado)
- Espacio simple: y += lineHeight
- Doble espacio: y += lineHeight * 2

ALINEACIÓN:
- Izquierda: doc.text(texto, marginLeft, y)
- Centro: doc.text(texto, pageWidth / 2, y, { align: 'center' })
- Derecha: doc.text(texto, pageWidth - marginRight, y, { align: 'right' })
- Justificado: agregarTextoJustificado(...)

FUNCIONES PRINCIPALES:
- agregarTextoJustificado() → Texto normal justificado
- agregarTextoConEtiquetas() → Texto con <b>negritas</b>
- agregarTextoConNegritas() → Texto con array [{t:'',b:true}]
- verificarYSaltarPagina() → Controla saltos automáticos
*/




// Configurar página
let y = marginTop;
doc.setFont('helvetica');
doc.setFontSize(12);

// Título principal
doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
doc.text('MI DOCUMENTO LEGAL', pageWidth / 2, y, { align: 'center' });
y += lineHeight * 2;

// Subtítulo
doc.setFontSize(12);
doc.text('Subtítulo Importante', pageWidth / 2, y, { align: 'center' });
y += lineHeight * 2;

// Párrafo normal
doc.setFont('helvetica', 'normal');
const parrafo1 = `Este es el primer párrafo del documento...`;
y = agregarTextoJustificado(doc, parrafo1, marginLeft, y, maxWidth, lineHeight);
y += lineHeight;

// Párrafo con negritas
const parrafo2 = `Este es <b>texto importante</b> dentro del párrafo.`;
y = agregarTextoConEtiquetas(doc, parrafo2, marginLeft, y, maxWidth, lineHeight);
y += lineHeight * 1.5;

// Sección en negrita
doc.setFont('helvetica', 'bold');
doc.text('RESUELVE:', pageWidth / 2, y, { align: 'center' });
y += lineHeight * 1.5;

// Contenido con negritas mezcladas
doc.setFont('helvetica', 'normal');
const resolucion = `<b>PRIMERO:</b> Aprobar el documento con fecha ${fecha}...`;
y = agregarTextoConEtiquetas(doc, resolucion, marginLeft, y, maxWidth, lineHeight);

// Guardar
doc.save('documento.pdf');