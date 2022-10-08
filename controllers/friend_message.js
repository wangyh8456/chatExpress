const service=require('../services/friend_message');
const express = require('express');
const router = express.Router();

router.post('/create',async (req,res,next)=>{
    try{
        const result=await service.create(req,res,next);
        res.setjson(200,result,'添加成功！')
        return
    }catch(e){
        next(e);
    }
});

router.post('/update',async (req,res,next)=>{
    try{
        const result=await service.update(req,next);
        res.setjson(200,{},'操作成功！')
        return
    }catch(e){
        next(e);
    }
});

router.post('/delete',async (req,res,next)=>{
    try{
        const result=await service.delete(req,next);
        res.setjson(200,{},'操作成功！')
        return
    }catch(e){
        next(e);
    }
});

router.post('/getList',async (req,res,next)=>{
    try{
        const result=await service.getList(req,next);
        res.setjson(200,result,'操作成功！')
        return
    }catch(e){
        next(e);
    }
});

router.post('/getNews',async (req,res,next)=>{
    try{
        const result=await service.getNews(req,next);
        res.setjson(200,result,'操作成功！')
        return
    }catch(e){
        next(e);
    }
});

router.post('/uploadFile',async (req,res,next)=>{
    try{
        const result=await service.uploadFile(req,next);
        res.setjson(200,result,'操作成功！')
        return
    }catch(e){
        next(e);
    }
});

module.exports=router;