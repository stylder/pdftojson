const os = require('os');
const express = require('express');
const multer = require('multer');
const cors = require('cors')
const pdf2json = require('./pdf2json');
const upload = multer({ dest: os.tmpdir() });
const Excel = require('exceljs');

const PORT = 8080;
const app = express();
const workbook = new Excel.Workbook();

app.use(cors())

app.get('/', (_, res) => { res.send('ok') });

app.post('/pdf', upload.single('file'), async (req, res) => {
    if (!req?.file) {
        res.sendStatus(500)
        return
    }
    const file = req.file;
    const { path } = file

    pdf2json(path).then((r) => { res.send(r) }).catch((e) => res.sendStatus(500))
});


app.post('/xlsx', upload.single('file'), async (req, res) => {
    if (!req?.file) {
        res.sendStatus(500)
        return
    }
    const file = req.file;
    const { path } = file

    workbook.xlsx.readFile(path).then(() => {
        let worksheet = workbook.getWorksheet(1);

        worksheet.spliceRows(0, 10);

        let json = []

        worksheet.eachRow( (row) => {
            const { values } = row
            const sim = {
                ICCID: (values[1]),
                IMEI: Number(values[2]),
                ESTATUS: (values[3]),
                RESPUESTA: (values[4]),
                TELEFONO: Number(values[6])
            }
            
            json.push(sim)
        })

        res.send(json)
    })


});

app.listen(PORT);

console.log(`Running on PORT: ${PORT}`);