const socketCb=(io)=>{
    return (socket)=>{
        console.log('a user connect!');
        socket.on('add friend',(data)=>{
            io.emit('friend request',data);
        });
        socket.on('agree friend',(data)=>{
            io.emit('friend agree',data);
        });
        socket.on('disconnect',(data)=>{
            console.log('a user disconnect!');
        })
        socket.on('friend sendMsg',(data)=>{
            io.emit('friend getMsg',data);
            io.emit('friend news',data);
        })
        socket.on('group sendMsg',(data)=>{
            io.emit('group getMsg',data);
            io.emit('group news',data);
        })
    }
}

module.exports=socketCb;