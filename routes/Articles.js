const auth = require('../middleware/auth');
const { Article, validate } = require('../models/article')
const express = require('express');
const router = express.Router();
const { sendNotification } = require('../services');

router.get('/', async(req,res)=>{
    const articles = await Article.find();
    res.send(articles);
})

router.post('/', async(req, res) =>{
  let count;
  await Article.estimatedDocumentCount({}, (error, size)=>{
    if(error) return res.status(400).send('articleId not generated please try again');
    count = size + 1; 
     return count;
   });

   const { error } = validate(req);
   if (error) return res.status(400).send(error.details[0].message);
   if(count == undefined) return res.status(400).send('Server Error, Plese Try Again');
   let article = new Article(addArticle(req,count));
   article = await article.save()
   .then(async () =>{
    const result = await sendNotification('MULTIPLE',article,`New Article`,article.title,'Article');
    // console.log(`article notification`,result);
     res.status(200).send('SUCCESSFULLY ADDED');
   }).catch(err => {
     console.log(`err`,err);
       res.status(401).send(err);
   })

})

router.put('/likes', async(req, res) =>{
  const article = Article.findOne({articleId: req.body.articleId});
  if(!article) res.status(404).send('Article not found');
  article.likes = article.likes + 1;
  await article.save();
  res.status(200).send('Liked');
})

function addArticle(req, count){
    const addedArticle={
      //TODO: handlepost request
      title: req.body.title,
      article: req.body.article,
      articleId: 'article###' + count
    };
    return addedArticle;
  }

  module.exports = router; 