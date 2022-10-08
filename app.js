var express = require('express');
var app = express();
var bodyParse = require('body-parser');
const dotenv = require('dotenv');
const expressJwt = require('express-jwt');
// 引入swagger插件
// const swaggerUI = require('swagger-ui-express');
// const swaggerJsdoc = require('swagger-jsdoc');

const constant=require('./config/constant');
const socketCb=require('./socketio');
const {CustomError,DbError,HttpError,TokenError}=require('./error/error');
const {STATUS,ERROR_CODE,HTTP_STATUS}=require('./error/error_code');
const explogger=require('./middilewares/loggerMiddleWare').expLogger;
const logger=require('./middilewares/loggerMiddleWare').logger;

dotenv.config('./env');

//redis全局变量
global.redisClient = require("redis").createClient(6379,'localhost');
redisClient.connect();

var setResJSON=require('./middilewares/unifyResFormat');
var redisToken=require('./middilewares/redisToken')

//定时任务清理redis中的过期记录
// const nodeSchedule=require('./nodeSchedule');
// nodeSchedule();

const port = process.env.PORT;

app.use(bodyParse.json({}));
app.use(bodyParse.urlencoded({extended: true}));
app.use(explogger);

//开放public为静态资源文件夹，若不需要token即可访问，可放到jwt认证前
app.use('/public', express.static(__dirname + '/public'));

// // swagger配置
// const swaggerOptions = {
//     definition: {
//         openapi: '3.0.3',
//         info: {
//             title: '管理后台接口',
//             version: '1.0.1',
//         },
//     },
//     apis: ['./controllers/*.js'],
// };
// // 启动swagger的中间件
// const openapiSpecification = swaggerJsdoc(swaggerOptions);
// app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(openapiSpecification));

//jwt认证
app.use(expressJwt({
    secret: constant.jwtkey,  // 签名的密钥 或 PublicKey
    credentialsRequired: false,
    algorithms: ['HS256'], //指定为RS256时报错，因为加密解析使用同一密钥
}).unless({
    path: constant.whiteList  // 指定路径不经过 Token 解析
}));
//redisToken认证
app.use(redisToken);

//统一数据返回格式
app.use(setResJSON);

app.use(require('./controllers'));

//路径不存在
app.use((req,res,next) => {
    const err=new CustomError({
        message:`MicroService ${process.env.app} can't resolve this: [${req.method}]${req.url}`,
        code:ERROR_CODE.NOT_FOUND
    });
    next(err);
});
//统一错误处理中间件
app.use(function (err, req, res, next) {
    console.log(err)
    if(err.name === 'UnauthorizedError'){
        err=new TokenError({message:'Invalid Token!',code:ERROR_CODE.UNAUTHORIZED});
    }
    if(err instanceof CustomError){
        if(!err.code) err.code=ERROR_CODE.UNKNOWN_ERROR;
    }else if(err instanceof HttpError){
        if(!err.code) err.code=ERROR_CODE.GATEWAY_ERROR;
    }else if(err instanceof DbError){
        if(!err.code) err.code=ERROR_CODE.INTERNAL_SERVER_ERROR;
    }else if(err instanceof TokenError){
        if(!err.code) err.code=ERROR_CODE.UnauthorizedError;
    }else{
        err=new CustomError({
            message:`Not Defined Error`,
            code:ERROR_CODE.UNKNOWN_ERROR
        });
    }

    //接收到的err直接被捕捉，因此前面修改code的代码无效
    logger.error({
        level:'error',
        path:req.baseUrl+req.path,
        detail:err.message || 'Unknown Error',
        message:`API Response[${err.code.http_status}]:${JSON.stringify({
            code:err.code.code,
            message:err.code.message
        })}`
    });
    return res.status(err.code.http_status || 500).send(err.code)

    // if(err.name==='UnauthorizedError'){
    //     return res.status(403).send('Invalid Token!')
    // }else{
    //     return res.status(err.status || 500).send('Inter Server Error!')
    // }
});

const server = require('http').Server(app);

//socket
const io=require('socket.io')(server, { cors: true });
io.listen(8891);
io.on('connection',socketCb(io));

server.listen(port, function() {
    console.log('listen to port:' + port);
})

module.exports=app;