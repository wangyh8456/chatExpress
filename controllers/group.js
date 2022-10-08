const service=require('../services/group');
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

router.post('/createug',async (req,res,next)=>{
    try{
        const result=await service.insertNew(req,res,next);
        if(result===401){
            res.setjson(401,'有成员已在群内!');
            return
        }
        res.setjson(200,result,'添加成功！')
        return
    }catch(e){
        next(e);
    }
});

router.post('/quit',async (req,res,next)=>{
    try{
        const result=await service.Quit(req,res,next);
        res.setjson(200,result,'操作成功！')
        return
    }catch(e){
        next(e);
    }
});

router.post('/getlist',async (req,res,next)=>{
    try{
        const result=await service.getList(req,res,next);
        res.setjson(200,result,'操作成功！')
        return
    }catch(e){
        next(e);
    }
});

router.post('/update',async (req,res,next)=>{
    try{
        const result=await service.update(req,res,next);
        res.setjson(200,result,'操作成功！')
        return
    }catch(e){
        next(e);
    }
});

module.exports=router;