const service=require('../services/friend');
const express = require('express');
const router = express.Router();

router.post('/create',async (req,res,next)=>{
    try{
        const result=await service.create(req,res,next);
        if(result===401){
            res.setjson(401,'请勿重复添加!');
            return
        }
        res.setjson(200,result,'添加成功！')
        return
    }catch(e){
        next(e);
    }
});

router.post('/updateStatus',async (req,res,next)=>{
    try{
        const result=await service.updateStatus(req,res,next);
        if(result===401){
            res.setjson(401,'记录不存在!');
            return
        }
        res.setjson(200,{},'操作成功！')
        return
    }catch(e){
        next(e);
    }
});

router.post('/updateRemark',async (req,res,next)=>{
    try{
        const result=await service.updateRemark(req,next);
        if(result===401){
            res.setjson(401,'记录不存在!');
            return
        }
        res.setjson(200,{},'操作成功！')
        return
    }catch(e){
        next(e);
    }
});

router.post('/search',async (req,res,next)=>{
    try{
        const result=await service.search(req,next);
        res.setjson(200,result,'查询成功！')
        return
    }catch(e){
        next(e);
    }
});

router.post('/getFriendList',async (req,res,next)=>{
    try{
        const result=await service.getFriendList(req,next);
        res.setjson(200,result,'查询成功！')
        return
    }catch(e){
        next(e);
    }
});

router.post('/getFriendRequest',async (req,res,next)=>{
    try{
        const result=await service.getFriendRequest(req,next);
        res.setjson(200,result,'查询成功！')
        return
    }catch(e){
        next(e);
    }
});

module.exports=router;