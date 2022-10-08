var schedule = require('node-schedule');

function scheduleCronstyle(){
    schedule.scheduleJob('30 * * * * *', function(){
        let date=Math.round(Date.now()/1000);
        redisClient.hvals("token", function(err, tokenValue) { //tokenValue是一个数组，值是value
			tokenValue.forEach(function(value, i) {
				console.log(i,':',value,' ',date)
				if(date>value){
					//超时，删除
					console.log(value,':超时，删除')
					redisClient.del('token', value, function(err, resData) {  //删除value时key也被删除
						if(err){
							console.log('delErr:',err)
						}
						console.log(value,':删除成功')
					})
				}else{
					// console.log(value,':未超时')
				}
			});
		})
    }); 
}

module.exports=scheduleCronstyle