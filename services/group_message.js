const model=require('../models/group_message');
const uploadtool=require('../services/upload');

const constant=require('../config/constant');

const GroupMessageService={
    create:async (req,res,next)=>{
        const time=Date.now()/1000;
        const reqdata={...req.body,time};
        const result=await model.create(reqdata,res,next);
        await model.updateGroup({latestid:result.insertId,groupid:req.body.groupid,userid:req.body.userid},next);
        const members=await model.getMembers({groupid:req.body.groupid,userid:req.body.userid},next);
        try{
            members.map(async e=>{
                let tempval=await redisClient.hGet('msgCount_'+e.userid,req.body.groupid+'');
                let count=isNaN(parseInt(tempval))||parseInt(tempval)<1?1:parseInt(tempval)+1
                console.log('msgCount_'+e.userid,req.body.groupid,tempval)
                await redisClient.hSet('msgCount_'+e.userid,req.body.groupid+'',count);
            });
            return {...req.body,time};
        }catch(e){
            return next(e);
        }
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
        try{
            await redisClient.hSet('msgCount_'+req.user.id,req.body.groupid+'',0);
            return result;
        }catch(e){
            return next(e);
        }
    },
    getNews:async (req,next)=>{
        const result1=await redisClient.hGet('msgCount_'+req.body.userid,req.body.groupid+'');
        const result2=await model.getLatestMessage({userid:req.body.userid,groupid:req.body.groupid},next);
        return {newMsg:parseInt(result1),latestMsg:result2[0]}
    },
    uploadFile:async (req,next)=>{
        const files=await uploadtool.filesUpload(req,'public/upload/grouppic/',next);
        return files[0];
    },
}

module.exports=GroupMessageService;