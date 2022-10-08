const db=require('../config/db.js');
const dbt=require('../config/dbTransaction');
const mysql=require('mysql');

module.exports = {
    create:async function(req,res,next){
        const content=req.content?req.content:'',address=req.address?req.address:'';
        const dbcase=await dbt();
        try{
            const result=await dbcase.query(
                `insert into group_message (userid,groupid,content,time,type,address) values (?,?,?,?,?,?)`,[req.userid,req.groupid,content,req.time,req.type,address]
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
    updateGroup:async function(data,next){
        let sql=`update groupchat set latestid=? where id=?`;
        const result=await db.query(sql,next,[data.latestid,data.groupid]);
        return result;
    },
    findId:async function(data,next){
        let sql=`select id,status from group_message where userid=? and groupid=?`;
        const result=await db.query(sql,next,[data.userid,data.groupid]);
        return result;
    },
    findById:async function(data,next){
        let sql=`select * from group_message where id=?`;
        const result=await db.query(sql,next,[data.id]);
        return result;
    },
    update:async function(data,next){
        let sql=`update group_message set `;
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
        let sql=`update group_message set status=0 where id=${mysql.escape(data.id)}`;
        const result=await db.query(sql,next);
        return result;
    },
    getMembers:async function(data,next){
        let sql=`select userid from user_group where groupid=? and userid<>?`;
        const result=await db.query(sql,next,[data.groupid,data.userid]);
        return result;
    },
    getMessage:async function(data,next){
        const pageNum=data.pageNum?data.pageNum:1;
        const pageSize=data.pageSize?data.pageSize:5;
        const start=(pageNum-1)*pageSize;
        let sql=`select address,content,groupid,group_message.id as id,group_message.status as status,time,type,userid,avatar from group_message,user where group_message.status=1 and groupid=? and group_message.userid=user.id`;
        sql+=` ORDER BY time DESC limit ?,?`;
        const result=await db.query(sql,next,[data.groupid,start,pageSize]);
        return result.reverse();
    },
    getLatestMessage:async function(data,next){
        let sql=`select * from group_message where id in (select latestid from groupchat where id=?)`;
        const result=await db.query(sql,next,[data.groupid]);
        return result;
    }
}