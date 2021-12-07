const express = require('express');
const multer  = require('multer');
const pdf2json = require('./pdf2json');
const os = require('os');
const upload = multer({ dest: os.tmpdir() });


// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const app = express();

app.get('/', (req, res) => { res.send('ok') });

app.post('/upload', upload.single('file'), async (req, res) => {
    if(!req?.file){
        res.sendStatus(500)
        return
    }
    const file = req.file;
    const {path} = file
    
    pdf2json(path).then((r)=> {res.send(r)}).catch((e)=> res.sendStatus(500))
});

app.listen(PORT, HOST);

console.log(`Running on http://${HOST}:${PORT}`);