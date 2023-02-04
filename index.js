const express = require('express')
const multer = require('multer')
const cors = require('cors')
const { urlencoded } = require('express')
const path = require('path')
const fs = require('fs')
const app = express()

app.use(express.static(path.join(__dirname, 'uploads')))
app.use(urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())


var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "uploads");
    },
    filename: function (req, file, callback) {
        callback(null, `${path.basename(file.originalname, path.extname(file.originalname))}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

var upload = multer({ storage: storage }).single('file');

var multipleUpload = multer({ storage: storage }).array('files')

app.post('/file', (req, res) => {
    upload(req, res, (err) => {
        if (err) return res.status(500).json(err)
        return res.status(200).json({ path: req.file.filename })
    })
})

app.post('/multiplefiles', (req, res) => {
    multipleUpload(req, res, (err) => {
        if (err) return res.status(500).json(err)
        const files = []
        req.files.forEach(file => { files.push(file.filename) })
        return res.status(200).json({ path: files })
    })
})

app.post('/getfile', (req, res) => {
    const file = req.body
    const filePath = path.join(__dirname, 'uploads', file.name)
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) return res.status(404).json(err)
        const options = {
            root: path.join(__dirname, 'uploads'),
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        }
        return res.sendFile(file.name, options, console.log)
    })
})

app.get('/files', (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads')
    fs.readdir(directoryPath, function (err, files) {
        if (err) return res.status(500).json(err)
        files = files.filter(file => file[0] != '.')
        return res.status(200).json(files)
    });
})

app.delete('/deletefile', (req, res) => {
    const file = req.body
    const filePath = path.join(__dirname, 'uploads', file.name)
    fs.unlink(filePath, (err) => {
        if (err) return res.status(500).json(err)
        return res.status(200).json({ message: 'File deleted successfully.' })
    })
})

app.listen(3000, () => {
    console.log("App is listening on port 3000")
})
