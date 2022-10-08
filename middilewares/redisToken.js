const constant=require('../config/constant');
const {TokenError}=require('../error/error')
const {ERROR_CODE}=require('../error/error_code')

module.exports =async (req,res, next) => {
    let time=Math.round(Date.now()/1000);
    const path=req.path;
    try{
        if(path==='/user/login'){
            await redisClient.set('token_'+req.body.username,time,{EX:constant.redisTokenExpireTime})
            return next();
        }
        if(constant.whiteList.indexOf(path)<0){
            const val=await redisClient.get('token_'+req.user.username,req.user.username);
            if(!val){
                return next(new TokenError({message:'Token Timeout!',code:ERROR_CODE.UNAUTHORIZED})); 
            }else{
                await redisClient.set('token_'+req.user.username,time,{EX:constant.redisTokenExpireTime});
                return next();
            }       
        }else{
            return next();
        }
    }catch(e){
        console.log(e)
        next(new TokenError({message:'Invalid Token!',code:ERROR_CODE.UNAUTHORIZED}));
    }
}