const mongoose = require('mongoose');
//mongoose 모델 가져오기
const bcrypt = require('bcrypt');
//const e = require('express');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50
  },

  email: {
    type: String,
    trim: true, 
    unique: 1
  },
  password: {
    type: String,
    minlength: 5
  },
  lastname: {
      type: String,
      maxlength: 50

  },
  role: {
    type: Number, 
    default: 0
  },
  image: String,
  token: {
    type: String
  },
  tokenExp: {
    //토큰 유효기간
    type: Number
  },
});

userSchema.pre('save', function (next) {
  var user = this;
  //패스워드가 변환될 때만
  if (user.isModified('password')) {
    //비밀번호를 암호화한다.
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);
      //hash: 암호화된 비밀번호
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function(cb){

    var user = this;
    var token = jwt.sign(user._id.toHexString(), 'secretToken');
  //user._id + 'secretToken'을 이용해 토큰을 만듬.
    user.token = token;
    user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
}

userSchema.statics.findByToken = function ( token, cb){
    var user = this;

    jwt.verify(token, 'secretToken', function(err, decoded){
        user.findOne({"_id": decoded, "token": token}, function(err, user){
            if(err) return cb(err);
            cb(null, user);
        })
    })
}

const User = mongoose.model('User', userSchema);

module.exports = { User }; //모델을 다른 곳에서도 쓸 수 있게 export