const db=require('../config/db.js');
const dbt=require('../config/dbTransaction');
const mysql=require('mysql');

module.exports = {
    create:async function(req,res,next){
        const dbcase=await dbt();
        try{
            const result=await dbcase.query(
                `insert into groupchat (userid,groupname,createTime) values (?,?,?)`,[req.userid,req.groupname,req.createTime]
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
    createUG:async function(req,res,next){
        const dbcase=await dbt();
        try{
            await Promise.all(req.users.map(async e=>{
                await dbcase.query(
                    `insert into user_group (userid,groupid) values (?,?)`,[e,req.groupid]
                ) 
            }))
            await dbcase.commit();
            return {};
        }catch(e){
            await dbcase.rollback();
            next(e);  
        }finally{
            await dbcase.close()
        }
    },
    findId:async function(data,next){
        let sql=`select id from user_group where userid=? and groupid=?`;
        const result=await db.query(sql,next,[data.userid,data.groupid]);
        return result;
    },
    findIds:async function(data,next){
        let sql=`select id from user_group where userid=?`;
        const result=await db.query(sql,next,[data.userid]);
        return result;
    },
    update:async function(data,next){
        let sql=`update groupchat set `;
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
        let sql=`delete from user_group where id=${mysql.escape(data.id)}`;
        const result=await db.query(sql,next);
        return result;
    },
    getList:async function(data,next){
        let sql=`select distinct user_group.id as id,user_group.userid as userid,groupchat.latestid as latestid,user_group.groupid as groupid,groupname,notice from user_group,groupchat where user_group.userid=? and user_group.groupid=groupchat.id`;
        const result=await db.query(sql,next,[data.userid]);
        return result;
    },
    getMembers:async function(data,next){
        let sql=`select distinct user.id as id,name,avatar from user,user_group where user_group.groupid=? and user.id=user_group.userid`;
        const result=await db.query(sql,next,[data.groupid,data.userid]);
        return result;
    }
}