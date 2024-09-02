import multer from 'multer';
import xlsx from 'xlsx';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

const upload = multer();

export default function handler(req, res) {
    upload.single('file')(req, {}, async err => {
        if (err) return res.status(500).send('Error al subir archivo');

        const workbook = xlsx.read(req.file.buffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const codesToSearch = xlsx.utils.sheet_to_json(sheet);

        const dbWorkbook = xlsx.readFile(path.resolve('./data/data.xlsx'));
        const dbSheet = dbWorkbook.Sheets[dbWorkbook.SheetNames[0]];
        const dbData = xlsx.utils.sheet_to_json(dbSheet);

        const results = codesToSearch.map(searchItem => 
            dbData.find(dbItem => dbItem['Código de Barra'] === searchItem['Código'])
        );

        res.status(200).json({ results });
    });
}
