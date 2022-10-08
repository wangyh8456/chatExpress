const {request,app} = require('./common')
let token='';
//describe和it的第一个参数都为说明文字
describe('/user/login /role/exportlist',()=>{
    it('/user/login post',async () =>{
        const response=await request(app)
        .post('/user/login')
        .send(
            {"username":"admin"}
        )
        .send(
            {"password":"123456"}
        )
        expect(response.status).toBe(200);
        console.log(response,'response');
        let body=JSON.parse(response.text);
        token=body.data.token;
        //  .end((err,res)=>{
        //     if(err) console.log(err);
        //  });
    });
    it('/role/exportlist get',async () =>{
        const response=await request(app)
        .get('/role/exportlist')
        .query(
        {"pageNum":"1","pageSize":"2"}
        )
        .set('authorization','Bearer '+token)
        expect(response.status).toBe(200);
        console.log(response,'response');
        //  .end((err,res)=>{
        //     if(err) console.log(err);
        //  });
    });
});

// 前beforeEach(() => {});
// 后afterEach(() => {});
//所有用例的前后执行

//beforeAll(() => {});afterAll(() => {});
//只会被执行一次。