const db=require('../config/db.js');
const dbt=require('../config/dbTransaction');
const mysql=require('mysql');

module.exports = {
    create:async function(req,res,next){
        const content=req.content?req.content:'',address=req.address?req.address:'';
        const dbcase=await dbt();
        try{
            const result=await dbcase.query(
                `insert into friend_message (userid,friendid,content,time,type,address) values (?,?,?,?,?,?)`,[req.userid,req.friendid,content,req.time,req.type,address]
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
    updateFriend:async function(data,next){
        let sql=`update user_friend set latestid=? where (friendid=? and userid=?) or (friendid=? and userid=?)`;
        const result=await db.query(sql,next,[data.latestid,data.friendid,data.userid,data.userid,data.friendid]);
        return result;
    },
    findId:async function(data,next){
        let sql=`select id,status from friend_message where userid=? and friendid=?`;
        const result=await db.query(sql,next,[data.userid,data.friendid]);
        return result;
    },
    findById:async function(data,next){
        let sql=`select * from friend_message where id=?`;
        const result=await db.query(sql,next,[data.id]);
        return result;
    },
    update:async function(data,next){
        let sql=`update friend_message set `;
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
        let sql=`update friend_message set status=0 where id=${mysql.escape(data.id)}`;
        const result=await db.query(sql,next);
        return result;
    },
    getMessage:async function(data,next){
        const pageNum=data.pageNum?data.pageNum:1;
        const pageSize=data.pageSize?data.pageSize:5;
        const start=(pageNum-1)*pageSize;
        let sql=`select * from friend_message where status=1 and ((friendid=? and userid=?) or (friendid=? and userid=?))`;
        sql+=` ORDER BY time DESC limit ?,?`;
        const result=await db.query(sql,next,[data.friendid,data.userid,data.userid,data.friendid,start,pageSize]);
        return result.reverse();
    },
    getNews:async function(data,next){
        let sql=`select id from friend_message where status=1 and friendid=? and userid=? and isLatest=0`;
        sql+=` ORDER BY time,id ASC`;
        const result=await db.query(sql,next,[data.friendid,data.userid]);
        return result;
    },
    getLatestMessage:async function(data,next){
        let sql=`select * from friend_message where id in (select latestid from user_friend where friendid=? and userid=?)`;
        const result=await db.query(sql,next,[data.friendid,data.userid]);
        return result;
    }
}