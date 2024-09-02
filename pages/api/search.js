import { readFileSync } from 'fs';
import path from 'path';
import xlsx from 'xlsx';

export default function handler(req, res) {
    const { query } = req;
    const workbook = xlsx.readFile(path.resolve('./data/data.xlsx'));
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Filtrar resultados según el parámetro de búsqueda
    const results = data.filter(item => 
        item['Código de Barra'].toString() === query.code ||
        item['Código Largo'].toString() === query.longCode ||
        item['Código Corto'].toString() === query.shortCode ||
        item['Descripción'].toLowerCase().includes(query.description?.toLowerCase())
    );

    res.status(200).json({ results });
}
