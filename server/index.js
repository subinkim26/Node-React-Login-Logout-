const express = require('express')
const app = express()
const port = 5000
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { User } = require("./models/User");
const config = require("./config/key");
const mongoose = require('mongoose');
const {auth} = require("./middleware/auth");



app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());



mongoose.connect(config.mongoURI, {
  useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false
}).then(()=>console.log('MongoDB Connected...'))
  .catch(err => console.log(err))



app.get('/', (req, res) => res.send('노드 이용중'))


app.get('/api/hello', (req, res) =>{

  res.send("안녕")
})

app.post('/api/users/register', (req, res) => {

  //회원가입할때 필요한 정보 client 에서 가져오면
  //db에 넣어준다.
    const user = new User(req.body);
    //비밀번호 암호화
  
    //mongoDB method
    user.save((err, userInfo) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).json({
        success: true
      });
    });
  });
  
  app.post('/api/users/login', (req, res) => {
    //요청된 이메일이 데이터베이스에 있는지 찾아본다.
    User.findOne({ email: req.body.email }, (err, user) => {
      if (!user) {
        //없다면
        return res.json({
          loginSuccess: false,
          message: "이메일을 확인해주세요"
        });
      }
  
      //있다면, 비밀번호가 맞는지 확인.
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (!isMatch)
          return res.json({ 
              loginSuccess: false,
               message: "비밀번호가 틀렸습니다"
             });
  
        //비밀번호까지 같다면 token 생성.
        user.generateToken((err, user) => {
            if(err) return res.status(400).send(err);
            res.cookie("x_auth", user.token)
            .status(200)
            .json({ loginSuccess: true, userId: user._id})
        });
      });
    });
  });


  app.get('/api/users/auth', auth, (req, res)=>{
      res.status(200).json({
          _id: req.user._id,
          isAdmin : req.user.role === 0 ? false : true,
          isAuth: true,
          email: req.user.email,
          name : req.user.name,
          lastname: req.user.lastname,
          role : req.user.role,
          image: req.user.image
      })

  })

  app.get('/api/users/logout', auth, (req, res) =>{
      User.findOneAndUpdate({_id : req.user._id},
         {token: ""}
        , (err, user) =>{
            if(err) return res.json({success: false, err});
            return res.status(200).send({
                success: true
            })
        })
  })

app.listen(port, ()=> console.log(`Example app listening on port ${port}!`))