/*建表语句：
 create table user (
     id int unsigned auto_increment,
     username varchar(100),
     password varchar(100), 
     name varchar(100),
     avatar varchar(100),
     phone varchar(20),
     status TINYINT default 1,
     roles varchar(100),
     primary key(id)
);
*/
const db=require('../config/db.js');
const dbt=require('../config/dbTransaction');

module.exports = {
    create:async function(req,res,next){
        const dbcase=await dbt();
        try{
            const result=await dbcase.query(
                `insert into user (username,password,name) values (?,?,?)`,[req.username,req.password,req.name]
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
    findBy:async function(colname,colval,next){
        //db.js的query方法中会将异常传递给错误处理中间件，但dbtransaction.js没有，因此需要捕捉异常
        const result=await db.query(
            `select * from user where ${colname}='${colval}'`,next
        )
        return result;
    },
    findAll:async function(data,next){
        const pageNum=data.pageNum?data.pageNum:1;
        const pageSize=data.pageSize?data.pageSize:5;
        const username=data.username?data.username:'';
        const name=data.name?data.name:'';
        const phone=data.phone?data.phone:'';
        const start=(pageNum-1)*pageSize;
        let sql=`select * from user where username like '%${username}%' and name like '%${name}%' and phone like '%${phone}%'`;
        if(data.status||data.status===0){
            sql+=` and status='${data.status}'`;
        }
        sql+=` limit ${start},${pageSize}`;
        const result=await db.query(sql,next);
        return result;
    },
    findNopage:async function(data,next){
        let userid=data.userid,keyword="%"+data.keyword+"%";
        let sql=`select * from user where id<>? and (username like ? or name like ? or phone like ?)`;
        const result=await db.query(sql,next,[userid,keyword,keyword,keyword]);
        return result;
    },
    countUser:async function(data,next){
        const username=data.username?data.username:'';
        const name=data.name?data.name:'';
        const phone=data.phone?data.phone:'';
        let sql=`select count(*) as count from user where username like '%${username}%' and name like '%${name}%' and phone like '%${phone}%'`;
        if(data.status||data.status===0){
            sql+=` and status='${data.status}'`;
        }
        const result=await db.query(sql,next);
        return result[0].count;
    },
    update:async function(data,next){
        let sql=`update user set `;
        for(let i in data){
            if(i==='id') continue;
            sql+=`${i}='${data[i]}',`
        }
        sql=sql.substr(0,sql.length-1);
        sql+=` where id=${data.id}`;
        const result=await db.query(sql,next);
        return result;
    },
    delete:async function(data,next){
        let sql=`delete from user where id=${data}`;
        const result=await db.query(sql,next);
        return result;
    }
}