import PDFDocument from 'pdfkit';
import bwipjs from 'bwip-js'; // Para generar código de barras en imágenes

export default async function handler(req, res) {
    const { labels, perPage } = req.body;

    const doc = new PDFDocument({
        size: perPage === 1 ? 'A4' : [595.28, 841.89], // A4 para una etiqueta o tamaño estándar
        margin: 0
    });

    let x = 30, y = 30;
    const labelWidth = perPage === 1 ? 550 : perPage === 2 ? 270 : 270;
    const labelHeight = perPage === 1 ? 770 : perPage === 2 ? 380 : 380;

    for (let i = 0; i < labels.length; i++) {
        if (i > 0 && i % perPage === 0) {
            doc.addPage();
            x = 30;
            y = 30;
        }

        // Dibuja el contorno de la etiqueta
        doc.rect(x, y, labelWidth, labelHeight).stroke();

        // Genera el código de barras como imagen
        const barcodeBuffer = await bwipjs.toBuffer({
            bcid: 'code128', // Tipo de código de barras
            text: labels[i].Código, // Texto que se codificará
            scale: 3,
            height: 40, // Altura del código de barras
            includetext: false // Excluye el texto debajo del código de barras
        });

        // Inserta el código de barras en el PDF
        doc.image(barcodeBuffer, x + (labelWidth - 200) / 2, y + 10, { width: 200 });

        // Añade la descripción del producto
        doc.fontSize(14).font('Helvetica-Bold').text(labels[i].Descripción, x + 20, y + 60, { width: labelWidth - 40, align: 'center' });

        // Añade los precios (Ajustando los estilos para coincidir con las imágenes)
        doc.fontSize(12).font('Helvetica').text(`Precio Normal: ${labels[i].Precio}`, x + 20, y + 100, { width: labelWidth - 40, align: 'left' });
        doc.fontSize(12).text(`Oferta: ${labels[i].Oferta}`, x + 20, y + 120, { width: labelWidth - 40, align: 'left' });

        // Ajusta la posición de la siguiente etiqueta
        if (perPage === 2) {
            y += 400;
        } else if (perPage === 4) {
            x += 280;
            if (x > 300) {
                x = 30;
                y += 400;
            }
        }
    }

    // Envía el PDF generado como respuesta
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.end();
}
