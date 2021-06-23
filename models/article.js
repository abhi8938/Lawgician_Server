const Joi = require('joi');
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        minlength:5
    },
    article:{
        type:String,
        required:true,
        minlength:5
    },
    postedOn:{
        type:Date,
        default:new Date()
    },
    likes:{
        type:Number
    },
    articleId:{
        required:true,
        type:String
    }
});

const Article = mongoose.model('Articles', articleSchema);

function validateArticle(req){
    const schema = {
        title:Joi.string().min(5).required(),
        article: Joi.string().min(5).required(),
        postedOn: Joi.date(),
        likes: Joi.number(),
        articleid: Joi.string(),
    }
    return Joi.validate(req.body, schema);
}

exports.Article = Article;
exports.validate = validateArticle;