module.exports = (req,res, next) => {
    res.setjson = (code,data,message) => {
        let jsondata = {}
        if(code === 200) {
            jsondata = {
                status: code,
                data,
                message
            }
        } else {
            jsondata = {
                status: code,
                message:data
            }
        }
        res.json(jsondata)
    };
    next()
}