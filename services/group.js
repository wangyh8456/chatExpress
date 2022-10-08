const model=require('../models/group');
const messagemodel=require('../models/group_message');
const usermodel=require('../models/user');

const GroupService={
    create:async (req,res,next)=>{
        const users=req.body.ids.split(',');
        users.push(req.body.userid);
        const reqdata={userid:req.body.userid,groupname:req.body.name+'的群聊',createTime:Math.round(Date.now()/1000)};
        const result=await model.create(reqdata,res,next);
        await model.createUG({users,groupid:result.insertId},res,next);
        return result;
    },
    insertNew:async (req,res,next)=>{
        const users=req.body.ids.split(',');
        let exists=false;
        users.forEach(async e=>{
            const temp=await model.findId({userid:e,groupid:req.body.groupid},next);
            if(temp.length>0){
                exists=true;
            }
        })
        if(exists){
            return 401;
        }else{
            const result=await model.createUG({users,groupid:req.body.groupid},res,next);
            return result;
        }
    },
    Quit:async (req,res,next)=>{
        const {userid,groupid}=req.body;
        const ids=await model.findId({userid,groupid},next);
        const result=model.delete({id:ids[0]},next);
        return result;
    },
    update:async (req,res,next)=>{
        const result=await model.update(req.body,next);
        return result;
    },
    getList:async (req,res,next)=>{
        const list=await model.getList(req.body,next);
        // const self=await usermodel.findBy('id',req.body.userid,next);
        // let selfobj={id:self[0].id,name:self[0].name,avatar:self[0].avatar,remark:null};
        //拆分 变多次查询remark
        const result=await Promise.all(list.map(async e=>{
            let info=[];
            const result1=await redisClient.hGet('msgCount_'+req.body.userid,e.groupid+'');
            info=await messagemodel.findById({id:e.latestid},next);
            let members=await model.getMembers({userid:e.userid,groupid:e.groupid},next);
            // members.push(selfobj);
            return {...e,members,latestMsg:info[0],newsCount:parseInt(result1)};
        }));
        return result;
    }
}

module.exports=GroupService;