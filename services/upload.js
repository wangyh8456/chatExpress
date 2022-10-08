const os = require('os');
const constant=require('../config/constant');
const fs = require('fs');
const {parse} =require('fast-csv');
// const iconv=require('iconv-lite')
const pathtool=require('path');
const makedirp=require('mkdirp');
const multiparty=require('multiparty');
const pump=require('pump');

//检测路径是否存在，不存在则创建
async function createFolder(folder){
  try{
      fs.accessSync(folder); 
  }catch(e){
      await makedirp(folder);
  }  
};

function streamToBuffer(stream) {  
  return new Promise((resolve, reject) => {
    let buffers = [];
    stream.on('error', reject);
    stream.on('data', (data) => buffers.push(data));
    stream.on('end', () => resolve(Buffer.concat(buffers)));
  });
}


/**
 * 获取当前机器的ip地址
 */
function getIpAddress() {
  var ifaces=os.networkInterfaces()
  for (var dev in ifaces) {
    let iface = ifaces[dev]

    for (let i = 0; i < iface.length; i++) {
      let {family, address, internal} = iface[i]

      if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
        return address
      }
    }
  }
}
// let ipAddress = getIpAddress();
let ipAddress=constant.ipaddress;

const uploadSingle=(path)=>{
  const filepath='http://'+ipAddress+':'+constant.port+'/'+path.replace(/\\/g,'/');
  return filepath;
}

module.exports={
    uploadSingle,
    filesUpload:async (req,path,next)=>{
      try{
        await createFolder(path);
        let form = new multiparty.Form();
        let result=[],count=0;
        return new Promise((resolve,reject)=>{
          form.on('error', function(err){
            next(err);
          });
          form.on('close', function(){
            resolve(result);
          });
          // listen on part event
          form.on('part',async function(part){
              if (part.filename) {
                try{
                  const extname=pathtool.extname(part.filename);
                  const dir=path+'/'+req.user.username+Date.now()+(count++)+extname;
                  const writeStream = fs.createWriteStream(dir);
                  //流写入文件
                  await pump(part, writeStream);
                  result.push(uploadSingle(dir));
                  // 没有该语句只能接收到一个文件
                  part.resume();
                }catch(e){
                  next(e)
                }
              }
              else{
                part.resume();
              }
          });
          // parse the form
          form.parse(req);
        })
      }catch(e){
        next(e);
      }
    },
    uploadWithoutHttp:async (req,path,next)=>{
      try{
        await createFolder(path);
        let form = new multiparty.Form();
        let result=[],count=0;
        return new Promise((resolve,reject)=>{
          form.on('error', function(err){
            next(err);
          });
          form.on('close', function(){
            resolve(result);
          });
          // listen on part event
          form.on('part',async function(part){
              if (part.filename) {
                try{
                  const extname=pathtool.extname(part.filename);
                  const dir=path+'/'+req.user.username+Date.now()+(count++)+extname;
                  const writeStream = fs.createWriteStream(dir);
                  //流写入文件
                  await pump(part, writeStream);
                  result.push(dir);
                  // 没有该语句只能接收到一个文件
                  part.resume();
                }catch(e){
                  next(e)
                }
              }
              else{
                part.resume();
              }
          });
          // parse the form
          form.parse(req);
        })
      }catch(e){
        next(e);
      }
    },
    parseCSV:async (file,req,next)=>{
      console.log(file)
      try{
        let result=[];
        return new Promise(async (resolve,reject)=>{
          // csv.parseStream(fs.createReadStream(file))
          const stream=parse({ headers: ['name','sort','pid','level'], renameHeaders: true })
          .on('data',function(row,index){
            result.push(row);
          })
          .on('end',function(count){
            resolve(result);
          })
          .on('error',function(error){
            next(error);
          });
          stream.write(await streamToBuffer(fs.createReadStream(file)));
          stream.end();
        })
      }catch(e){
        next(e);
      }
    },
}