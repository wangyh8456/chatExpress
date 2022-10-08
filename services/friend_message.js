const model=require('../models/friend_message');
const uploadtool=require('../services/upload');

const constant=require('../config/constant');

const FriendMessageService={
    create:async (req,res,next)=>{
        const time=Date.now()/1000;
        const reqdata={...req.body,time};
        const result=await model.create(reqdata,res,next);
        await model.updateFriend({latestid:result.insertId,friendid:req.body.friendid,userid:req.body.userid},next)
        return {...req.body,time};
    },
    update:async (req,next)=>{
        const result=await model.update(req.body,next);
        return result;
    },
    delete:async (req,next)=>{
        const result=await model.delete({id:req.body.id},next);
        return result;
    },
    getList:async (req,next)=>{
        const result=await model.getMessage(req.body,next);
        await Promise.all(result.map(async e=>{
            if(e.friendid===req.body.userid){
                await model.update({id:e.id,isLatest:1},next);
            }
        }))
        return result;
    },
    getNews:async (req,next)=>{
        const result1=await model.getNews({userid:req.body.friendid,friendid:req.body.userid},next);
        const result2=await model.getLatestMessage({userid:req.body.userid,friendid:req.body.friendid},next);
        return {newMsg:result1,latestMsg:result2[0]}
    },
    uploadFile:async (req,next)=>{
        const files=await uploadtool.filesUpload(req,'public/upload/userpic/',next);
        return files[0];
    },
}

module.exports=FriendMessageService;