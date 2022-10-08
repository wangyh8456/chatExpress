const db=require('../config/db.js');
const dbt=require('../config/dbTransaction');
const mysql=require('mysql');

module.exports = {
    create:async function(req,res,next){
        const dbcase=await dbt();
        try{
            const result=await dbcase.query(
                `insert into user_friend (userid,friendid,status) values (?,?,?)`,[req.userid,req.friendid,req.status?req.status:0]
            ) 
            await dbcase.commit(); //不提交会提示插入成功，但数据库会在下一次数据插入时插入这一次的数据，可能会出现混乱
            return result;
        }catch(e){
            await dbcase.rollback();
            //异步函数抛出异常：dbTransaction如果throw error,此处接收到抛出的error并通过next传递给错误处理中间件，若没next()，则中间件接收不到
            //同步函数抛出异常：throw即可
            next(e);  
        }finally{
            await dbcase.close()
        }
    },
    findId:async function(data,next){
        let sql=`select id,status from user_friend where userid=? and friendid=?`;
        const result=await db.query(sql,next,[data.userid,data.friendid]);
        return result;
    },
    update:async function(data,next){
        let sql=`update user_friend set `;
        for(let i in data){
            if(i==='id') continue;
            sql+=`${i}=${mysql.escape(data[i])},`
        }
        sql=sql.substr(0,sql.length-1);
        sql+=` where id=${mysql.escape(data.id)}`;
        const result=await db.query(sql,next);
        return result;
    },
    delete:async function(data,next){
        let sql=`delete from user_friend where id=${mysql.escape(data.id)}`;
        const result=await db.query(sql,next);
        return result;
    },
    getList:async function(data,next){
        let sql=`select distinct user.id as id,username,name,avatar,phone,remark,latestid from user,user_friend where user_friend.status=1 and user_friend.friendid=user.id and user_friend.userid=?`;
        const result=await db.query(sql,next,[data.userid]);
        return result;
    },
    getFriendRequest:async function(data,next){
        let sql=`select * from user where id in (select userid from user_friend where status=0 and friendid=?)`;
        const result=await db.query(sql,next,[data.userid]);
        return result;
    },
}