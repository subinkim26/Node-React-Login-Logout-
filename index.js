const express = require('express')
const app = express()
const port = 7000
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { User } = require("./models/User");
const config = require("./config/key");
const mongoose = require('mongoose')



app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());



mongoose.connect(config.mongoURI, {
  useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false
}).then(()=>console.log('MongoDB Connected...'))
  .catch(err => console.log(err))



app.get('/', (req, res) => res.send('노드 이용중'))

app.post('/api/users/register', (req, res) => {
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

app.listen(port, ()=> console.log(`Example app listening on port ${port}!`))