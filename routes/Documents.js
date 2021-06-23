const auth = require('../middleware/auth');
const { Document, validate } = require('../models/document')
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const { sendNotification } = require('../services');
const URI ='mongodb://localhost/Lawgician'
//mongodb+srv://abhishek8938:gotranks@cluster0-79cas.mongodb.net/test?retryWrites=true

const mongoURI = `mongodb+srv://abhishek8938:gotranks@cluster0-79cas.mongodb.net/test?retryWrites=true`;

let gfs;

const conn = mongoose.createConnection(URI);

conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('files');
})

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'files'
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });

router.get('/', async (req, res) => {
  let docs = await Document.find().or({ SentTo: req.headers.id }).or({ From: req.headers.id }).sort({ CreatedAt: -1 }).limit(30);
  res.status(200).json({
    docs: docs
  })
})
router.get('/filter', async (req, res) => {
  let clientDocs = await Document.find().or({ SentTo: req.headers.customerid }).or({ From: req.headers.customerid }).sort({ CreatedAt: -1 });
 return res.status(200).send(clientDocs);
})

router.get('/forClient', async (req, res) => {
  if (req.headers.type === 'QUERY') {
    let query = await Document.find().or({ SentTo: req.headers.id }).or({ From: req.headers.id }).and({ Type: 'QUERY' }).sort({ CreatedAt: -1 }).limit(20);
    return res.status(200).json({
      query: query
    })
  } else if (req.headers.type === undefined) {
    let docs = await Document.find().or({ SentTo: req.headers.id }).or({ From: req.headers.id }).and({ Type: ['image/jpeg', 'image/png', 'application/pdf','text/plain'] }).sort({ CreatedAt: -1 }).limit(20);
    return res.status(200).json({
      docs: docs
    })
  }

})

router.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file) {
      return res.status(404).json({
        err: 'no file exists'
      });
    }
    const readstream = gfs.createReadStream(file.filename);
    readstream.pipe(res);
  });
})

router.post('/addDocument', upload.single('file'), async (req, res) => {

  if(req.headers.customername == undefined || req.headers.customeremail == undefined || req.headers.customermobile == undefined){
    return res.status(400).send('customer details missing')
  }
// const headers =;
console.log(`add`,req.headers);
  const data = {
    SentTo: req.headers.sentto,
    From: req.headers.from,
    Note: req.headers.note
  }
  const { error } = validate(data);
  if (error) return res.status(400).send(error.details[0].message);
  let fileId;
  let fileType;
  if (req.file == undefined && req.headers.type == 'QUERY') {
    fileId = 'NOFILE';
    fileType = 'QUERY'
  } else if (req.file == undefined && req.headers.type == undefined) {
    return res.status(404).send('Parameter missing');
  } else if (req.file != undefined) {
    fileId = req.file.filename;
    fileType = req.file.contentType;
  }
  let document = new Document(addedDocument(req.headers.sentto, req.headers.from, req.headers.note, fileId, fileType,req.headers.customername,req.headers.customeremail,req.headers.customermobile));
    document = await document.save();
  let type = document.Type;
  if(document.SentTo == 'ADMIN'){
    return
  }
  if(type == 'QUERY'){
    type = 'Query'
  }else{
    type = 'Document'
  }
  const result = await sendNotification(document.SentTo,{ Type: type },`New ${type}`,document.Note,type);
  console.log(`document notification`,result.data);
  res.status(200).send(document);
})

function addedDocument(sentTo, From, note, fileId, fileType,customerName,customerEmail,customerMobile) {
  const addeddocument = {
    //TODO: handlepost request
    SentTo: sentTo,
    From: From,
    fileId: fileId,
    Note: note,
    Type: fileType,
    CustomerEmail:customerEmail,
    CustomerMobile:customerMobile,
    CustomerName:customerName
  };
  return addeddocument;
}

module.exports = router; 