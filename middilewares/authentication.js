const constant=require('../config/constant');
const fakeperms=[1,2,3,4,5]; //拥有view、update权限

const authentication={
    promotionView:async (req,res,next)=>{
        let rlt=await validate_session(req,res,'view');
        if(!rlt.status){
            return res.status(401).send(rlt.msg);
        }
        next();
    },
    promotionCreate:async (req,res,next)=>{
        let rlt=await validate_session(req,res,'create');
        if(!rlt.status){
            return res.status(401).send(rlt.msg);
        }
        next();
    },
    promotionUpdate:async (req,res,next)=>{
        let rlt=await validate_session(req,res,'update');
        if(!rlt.status){
            return res.status(401).send(rlt.msg);
        }
        next();
    },
    promotionDelete:async (req,res,next)=>{
        let rlt=await validate_session(req,res,'delete');
        if(!rlt.status){
            return res.status(401).send(rlt.msg);
        }
        next();
    },
    promotionUpload:async (req,res,next)=>{
        let rlt=await validate_session(req,res,'upload');
        if(!rlt.status){
            return res.status(401).send(rlt.msg);
        }
        next();
    }
}

const validate_session=async (req,res,permissionName)=>{
    let temp=fakeperms.map(e=>{
        const index=constant.promotions.findIndex(i=>Number(i.id)===Number(e));
        if(index>-1){
            return constant.promotions[index].name
        }
    })
    if(!temp.includes(permissionName)){
        return {status:false,msg:`You have no permission to ${permissionName}!`}
    }
    return {status:true}
}

module.exports=authentication;