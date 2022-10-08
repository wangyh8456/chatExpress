const model=require('../models/friend');
const usermodel=require('../models/user');
const messagemodel=require('../models/friend_message');

const constant=require('../config/constant');

const FriendService={
    create:async (req,res,next)=>{
        const id=await model.findId({userid:req.body.userid,friendid:req.body.friendid},next);
        if(id&&id.length>0){
            return 401;
        }
        const reqdata={userid:req.body.userid,friendid:req.body.friendid};
        const result=await model.create(reqdata,res,next);
        return result;
    },
    updateStatus:async (req,res,next)=>{
        const id=await model.findId({userid:req.body.friendid,friendid:req.body.userid},next);
        const anoId=await model.findId({userid:req.body.userid,friendid:req.body.friendid},next);
        if(!id||id.length<1){
            return 401;
        }
        let result,status=req.body.status;
        if(status===1){
            result=await model.update({status,id:id[0].id},next);
            if(!anoId||anoId.length<1){
                await model.create({userid:req.body.userid,friendid:req.body.friendid,status:1},res,next);
            }else{
                await model.update({status,id:anoId[0].id},next);
            }
        }else{
            result=await model.delete({id:id[0].id},next)&&await model.delete({id:anoId[0].id},next);
        }
        return result;
    },
    updateRemark:async (req,next)=>{
        const id=await model.findId({userid:req.body.userid,friendid:req.body.friendid},next);
        if(!id||id.length<1){
            return 401;
        }
        const result=await model.update({remark:req.body.remark,id:id[0].id},next);
        return result;
    },
    search:async (req,next)=>{
        const result=await usermodel.findNopage({userid:req.body.userid,keyword:req.body.keyword},next);
        return await Promise.all(result.map(async e=>{
            const id=await model.findId({userid:req.body.userid,friendid:e.id},next);
            if(!id||id.length<1){
                return {...e,password:undefined,hasAdd:0};
            }else{
                return {...e,password:undefined,hasAdd:id[0].status?2:1};
            }
        }));
        // return result;
    },
    getFriendList:async (req,next)=>{
        const result=await model.getList({userid:req.body.userid},next);
        const result2=await Promise.all(result.map(async e=>{
            let info={};
            if(e.latestid){
                info=await messagemodel.findById({id:e.latestid},next);
            }
            return {...e,latestMsg:info[0]};
        }))
        return result2;
    },
    getFriendRequest:async (req,next)=>{
        const result=await model.getFriendRequest({userid:req.body.userid},next);
        return result;
    }
}

module.exports=FriendService;