const model=require('../models/user')
var md5=require('md5-node');
var jwt = require('jsonwebtoken');
const stringRandom = require('string-random');

const constant=require('../config/constant');
const uploadtool=require('./upload');
const fs = require("fs");

function getFileList(dir){
    let tmp = [];
    const files = fs.readdirSync(dir);
    files.forEach(function (item, index) {
        tmp.push('http://'+constant.ipaddress+':'+constant.port+'/public/avatar/'+item);
    })
    return tmp;
}

const userService={
    create:async (req,res,next)=>{
        const username=await model.findBy('username',req.body.username,next);
        if(username&&username.length>0){
            return 401;
        }
        const reqdata={...req.body,password:md5(req.body.password),name:'用户'+stringRandom(5)};
        const result=await model.create(reqdata,res,next);
        return result;
    },
    login:async (req,next)=>{
        const user=await model.findBy('username',req.body.username,next);
        // console.log(user,req.body)
        if(!user||user.length<1){
            return 401;
        }
        const password=md5(req.body.password);
        if(!user[0].status){
            return 403;
        }
        if(user[0].password!==password){
            return 402;
        }
        const token = jwt.sign({username:user[0].username,id:user[0].id},constant.jwtkey,{expiresIn:constant.jwtExpireTime,algorithm:'HS256'});
        const result={...user[0],token};
        delete result.password
        return result;
    },
    getAvatarList:()=>{
        const avatar = getFileList('./public/avatar');
        return {avatar};
    },
    find:async (req,next)=>{
        const user=await model.findAll(req.body,next);
        user.map(item=>{
            delete item.password;
            return item;
        });
        const count=await model.countUser(req.body,next);
        const result={
            list:user,
            total:count,
            pageSize:req.body.pageSize||5,
            pageNum:req.body.pageNum||1,
        }
        return result;
    },
    update:async (req,next)=>{
        const result=await model.update(req.body,next);
        return result;
    },
    changepwd:async (req,next)=>{
        const user=await model.findBy('id',req.body.id,next);
        if(!user||user.length<1){
            return 401;
        }
        // console.log(user[0])
        const password=md5(req.body.oldpassword);
        if(user[0].password!==password){
            return 402;//原密码错误
        }
        const result=await model.update({password:md5(req.body.newpassword),id:req.body.id},next);
        return result;
    },
    delete:async (req,next)=>{
        const result=await model.delete(req.params.id,next);
        return result;
    },
    uploadAvatar:async (req,next)=>{
        const filepath=uploadtool.uploadSingle(req.file.path);
        await model.update({avatar:filepath,id:req.user.id},next);
        const user=await model.findBy('id',req.user.id,next);
        const result=user[0];
        delete result.password;
        return result;
    },
    uploadFiles:async (req,next)=>{
        const files=await uploadtool.filesUpload(req,'public/upload/multiparty/',next);
        await model.update({avatar:files[0],id:req.user.id},next);
        const user=await model.findBy('id',req.user.id,next);
        const result=user[0];
        delete result.password;
        return result;
    },
}

module.exports=userService