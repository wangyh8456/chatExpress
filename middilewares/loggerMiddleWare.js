'use strict';

const winston = require('winston');
const expressWinston = require('express-winston');
require('winston-daily-rotate-file');
const message = Symbol.for('message');
const os = require('os');
const path = require('path');
const moment=require('moment-timezone');

const constant = require('../config/constant');
// console.log(moment.tz(new Date(),'UTC').toString())

const jsonFormatter = (logEntry) => {
    const base = {
        timestamp: moment.tz(new Date(),constant.timezone).format(),
        host: os.hostname(),
        path: path.basename(__dirname) + '/' + path.basename(__filename, '.js')};
    const json = Object.assign(base, logEntry);
    logEntry[message] = JSON.stringify(json);
    return logEntry;
};

const transport = new (winston.transports.DailyRotateFile)({
    level: constant.logLevel,
    format: winston.format(jsonFormatter)(),
    filename: constant.logFile+`/${constant.logPrefix}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD', 
    zippedArchive: false, //为true时除当前日志外的其它日志会被压缩
    maxSize: '20m', //日志文件最大数
    maxFiles: '180d' //日志文件超过限制时可新创建的日志数量
});
const errortransport = new (winston.transports.DailyRotateFile)({
    level: 'error',
    format: winston.format(jsonFormatter)(),
    filename: constant.logFile+`/errorlog/${constant.logPrefix}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD', 
    zippedArchive: false, //为true时除当前日志外的其它日志会被压缩
    maxSize: '20m', //日志文件最大数
    maxFiles: '180d' //日志文件超过限制时可新创建的日志数量
});

transport.on('rotate', (oldFilename, newFilename) => {
    // do something fun
    console.log(oldFilename,newFilename) //rotate:旋转，当文件内容超出大小时自动创建新文件并写入剩余内容，此时触发旋转。
});

let logger = winston.createLogger({
    transports: [
        errortransport,
    ],
});

const expLogger = expressWinston.logger({
    // winstonInstance: logger,   //有该选项时不需要format、transports
    transports:[
        transport
    ],
    level: constant.logLevel,  //日志等级
    meta: true,  //请求的meta信息
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true, //为true时msg设置的格式无效，采用默认格式，为false时message为msg设置的格式
    colorize: false,  //是否着色处理
    ignoreRoute: (req, res) => {
        const paths = [
            // "/user/login"  //不写入日志的路径
        ];
        return paths.indexOf(req.url) >= 0;
    }
});

module.exports = {
    logger: logger,
    expLogger: expLogger
};