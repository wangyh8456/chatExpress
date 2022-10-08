const service=require('../services/user')
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path=require('path');
const makedirp=require('mkdirp');
const auth=require('../middilewares/authentication');

//检测路径是否存在，不存在则创建
const createFolder = async function(folder){
    try{
        fs.accessSync(folder); 
    }catch(e){
        await makedirp(folder);
    }  
};

const uploadFolder = './public/upload/avatar';
createFolder(uploadFolder);
// 通过 filename 属性定制
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
    },
    filename: function (req, file, cb) {
        const ext=path.extname(file.originalname);
        cb(null, req.user.username +  Date.now()+ ext);  
    }
});

router.post('/create',auth.promotionCreate,async (req,res,next)=>{
    try{
        const result=await service.create(req,res,next);
        if(result===401){
            res.setjson(401,'该用户名已注册!');
            return
        }
        if(result){
            res.setjson(200,result,'创建成功！')
            return
        }
    }catch(e){
        next(e);
    }
});

router.post('/changepwd',async (req,res,next)=>{
    try{
        const result=await service.changepwd(req,res,next);
        if(result===401){
            res.setjson(401,'用户不存在!');
            return
        }
        else if(result===402){
            res.setjson(401,'原密码错误!');
            return
        }
        else{
            res.setjson(200,result,'修改成功！')
            return
        }
    }catch(e){
        next(e);
    }
});

router.post('/login',async (req,res,next)=>{
    try{
        const result=await service.login(req,next);
        if(result===401){
            res.setjson(401,'用户不存在!');
            return
        }
        if(result===402){
            res.setjson(401,'密码错误!');
            return
        }
        if(result===403){
            res.setjson(403,'该账号已被冻结，请联系管理员!');
            return
        }
        if(result){
            res.setjson(200,result,'登录成功！')
            return
        }
    }catch(e){
        next(e)
    }
})

router.post('/getAvatar',async (req,res,next)=>{
    try{
        const result=await service.getAvatarList(req,next);
        res.setjson(200,result,'查询成功！')
        return
    }catch(e){
        next(e)
    }
})

router.post('/update',auth.promotionUpdate,async (req,res,next)=>{
    try{
        const result=await service.update(req,next);
        res.setjson(200,result,'修改成功！')
        return
    }catch(e){
        next(e)
    }
})

router.post('/find',auth.promotionView,async (req,res,next)=>{
    try{
        const result=await service.find(req,next);
        res.setjson(200,result,'查询成功！')
        return
    }catch(e){
        next(e)
    }
})

router.post('/delete/:id',auth.promotionDelete,async (req,res,next)=>{
    try{
        const result=await service.delete(req,next);
        res.setjson(200,result,'删除成功！')
        return
    }catch(e){
        next(e)
    }
})

router.post('/changepwd',auth.promotionUpdate,async (req,res,next)=>{
    try{
        const result=await service.changepwd(req,next);
        if(result===402){
            res.setjson(402,'原密码错误!'); 
            return;
        }
        res.setjson(200,result,'修改密码成功！');
        return
    }catch(e){
        next(e)
    }
})


//multer方式上传文件
// router.post('/changeavatar',upload.single('file'),async (req,res,next)=>{
//     try{
//         const result=await service.uploadAvatar(req,next);
//         res.setjson(200,result,'修改头像成功！');
//     }catch(e){
//         next(e);
//     }
// })

//multiparty方式上传文件
router.post('/changeavatar',auth.promotionUpload,async (req,res,next)=>{
    try{
        const result=await service.uploadFiles(req,next);
        res.setjson(200,result,'修改头像成功！');
    }catch(e){
        next(e);
    }
})

module.exports=router
