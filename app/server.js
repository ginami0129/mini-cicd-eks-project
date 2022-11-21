//환경 변수 저장
require('dotenv').config()

// express 라이브러리 첨부
const express =require('express'); 

//express 라이브러리 사용
const app = express();

const bodyParser= require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
// listen () 함수는 두개의 파라미터를 필요로 함
// listen(서버를 오픈할 포트번호, function(){서버가 오픈되면 실행할 코드})

app.set('view engine', 'ejs');

app.use('/public', express.static('public'));// public css 등록 

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

var db;

const MongoClient = require('mongodb').MongoClient; // 부르기
MongoClient.connect(process.env.DB_URL, function(에러, client){

  if(에러)  return console.log(에러);
  
  db= client.db('goorm-app'); 

  // db.collection('post').insertOne({이름: 'park', 나이 : 26 }, function(에러, 결과){
  //   console.log('저장완료');
  // });

  app.listen(process.env.PORT, function(){
    console.log(process.env.PORT+'번 포트로 접근 '); // 8080 포트로 들어오면 실행 
  });

})


// app.listen(8080, function(){
//   console.log('listening on 8080'); // 8080 포트로 들어오면 실행 
// });

app.get('/pet', function(요청, 응답){
 응답.send('펫쇼핑할 수 있는 사이트');
});

app.get('/beauty', function(요청, 응답){
  응답.send('뷰티용품 쇼핑 페이지임');
 });

 app.get('/', function(요청, 응답){
  // 응답.sendFile(__dirname + '/index.html');
  응답.render('index.ejs');
 });

 app.get('/write', function(요청, 응답){
  // 응답.sendFile(__dirname + '/write.html');
  응답.render('write.ejs');
 });



 app.get('/list',function(요청,응답){
  db.collection('post').find().toArray(function(에러, 결과){
    console.log(결과);
    //db 가져오면서 결과를 list.ejs 로 보내기
    //posts 라는 이름으로 결과를 보내기 
    응답.render('list.ejs',{posts: 결과});
  });

  // 무슨 무슨 데이터를 꺼내주세요

 });



 //detail 로 접속하면 detail.ejs 보여줌

 app.get('/detail/:id', function(요청, 응답){
  db.collection('post').findOne({_id: parseInt(요청.params.id)}, function(에러, 결과){
    console.log(결과)
    응답.render('detail.ejs',{ data : 결과});
  })

 })

 app.get('/edit/:id',function(요청,응답){
  db.collection('post').findOne({_id: parseInt(요청.params.id)}, function(에러, 결과){
    console.log(결과)
    응답.render('edit.ejs',{post: 결과} ) // post 라는 이름으로 쏴주기
  })
 });

 app.put('/edit', function(요청, 응답){ 
  db.collection('post').updateOne( {_id : parseInt(요청.body.id) }, { $set : { 제목 : 요청.body.title , 날짜 : 요청.body.date }}, 
    function(에러,결과){ 
    
    console.log('수정완료') 
    console.log(요청.body)
      응답.redirect('/list')
  }); 
}); 

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());  

app.get('/login', function(요청, 응답){
  응답.render('login.ejs')
});

app.post('/login',passport.authenticate('local',{
  
  failureRedirect : '/fail'
}), function(요청, 응답){
  응답.redirect('/')
});

app.get('/fail', function(요청,응답){
응답.render('loginfail.ejs')
})


app.get('/mypage', 로그인했니,function (요청, 응답) {
  console.log(요청.user); //요청에 user deserialize 가 있다. 
  응답.render('mypage.ejs', {사용자: 요청.user})
}) 

//로그인 여부를 확인하는 미들웨어
function 로그인했니(요청, 응답, next) { 
  if (요청.user) { 
    next() 
  } 
  else { 
    응답.render('loginfail.ejs') 
  } 
} 

passport.use(new LocalStrategy({
  usernameField: 'id', //form 의 name=id
  passwordField: 'pw', // form 의 name = pw
  session: true, // 세션으로 저장 
  passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
  console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
    if (에러) return done(에러)

    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
    if (입력한비번 == 결과.pw) {
      return done(null, 결과) // 여기서 로그인된 결과가 serializeUser 에 user 
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));

// 세션을 저장시키는 코드 (로그인성공시)
passport.serializeUser(function (user, done) {
  done(null, user.id) // id를 이용하여 세셔능ㄹ 만듬
});

// 마이페이지에 접속할때 사용
passport.deserializeUser(function (아이디, done) {
  db.collection('login').findOne({ id: 아이디 }, function (에러, 결과) {
    done(null, 결과) // function 요청.user 에 담긴다.

  })
}); 

// 회원가입  
app.post('/register', function (요청, 응답) {
  db.collection('login').insertOne({ id: 요청.body.id, pw: 요청.body.pw }, function (에러, 결과) {
    응답.redirect('/')
  })
})

app.post('/add',로그인했니,function(요청,응답){
  
  // 응답.send('전송완료')
  console.log(요청.body.title);
  console.log(요청.body.date);
  db.collection('counter').findOne({name: '게시물갯수'}, function(에러, 결과){
    console.log(결과.totalPost)
    var 총게시물갯수 = 결과.totalPost;
   var 저장할거 = {_id: 총게시물갯수+1,작성자 : 요청.user._id,작성자이름: 요청.user.id,제목: 요청.body.title, 날짜: 요청.body.date, };
  
    db.collection('post').insertOne(저장할거, function(){
      console.log('저장완료');
      // 콜백함수는 순차적  여기서 total +1 시켜야함
      db.collection('counter').updateOne({name: '게시물갯수' },{ $inc :{totalPost:1} },function(에러, 결과){ //총게시물 업데이트
        if(에러) {return console.log(에러)}
        응답.redirect('/list')
      });
  
    });
  
  });
  
   });

   app.delete('/delete', function(요청, 응답){
    console.log('삭제 요청');
   요청.body._id= parseInt(요청.body._id);

   var 삭제할데이터 = {_id : 요청.body._id, 작성자 :  요청.user._id}
    db.collection('post').deleteOne(삭제할데이터
      ,function(에러, 결과){
      console.log('삭제완료');
      // if(에러){console.log(에러)}
      if(에러){응답.status(401).send("작성자가 아닙니다.")}
      응답.status(200).send({message: '성공. '}); // 응답 확인하기
  
  
        }   )
   })
  
   // 챗 페이지로 이동
   app.get('/chat', 로그인했니, function(요청, 응답){ 

    db.collection('chatroom').find({ member : 요청.user._id }).toArray().then((결과)=>{
      console.log(결과);
      응답.render('chat.ejs', {data : 결과,user: 요청.user})
    })
  
  }); 

  const {ObjectId } = require('mongodb')


  app.post('/chatroom', function(요청, 응답){

    var 저장할거 = {
      title : '채팅방',
      member : [ObjectId(요청.body.당한사람id), 요청.user._id],
      memberName:  [요청.body.당한사람이름, 요청.user.id],
   
      date : new Date()
    }
  
    db.collection('chatroom').insertOne(저장할거).then(function(결과){
      응답.render('chat.ejs', {data : 결과})
    });
  });

  app.post('/message', 로그인했니, function(요청, 응답){
    var 저장할거 = {
      parent : 요청.body.parent,
      userid : 요청.user._id,
      userName: 요청.user.id,
      content : 요청.body.content,
      date : new Date(),
    }
    db.collection('message').insertOne(저장할거)
    .then((결과)=>{
      응답.send(결과);
    })
  }); 

  // 서버와 유저간 실시간 소통채널 열기 

  app.get('/message/:id', 로그인했니, function(요청, 응답){

    응답.writeHead(200, {
      "Connection": "keep-alive",
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    });
  
    db.collection("message").find({ parent : 요청.params.id }).toArray()
    .then((결과)=>{
      console.log(결과);
      응답.write('event: test\n');
      응답.write('data: ' +JSON.stringify(결과) + '\n\n');
    });
  
   const pipeline = [
      {$match: { "fullDocument.parent" : 요청.params.id}}
   ];
   const collection = db.collection("message");
   const changeStream = collection.watch(pipeline);
   changeStream.on("change", (result)=>{
    응답.write("event: test\n");
    응답.write("data:" + JSON.stringify([result.fullDocument]) +"\n\n");
   })
  
  
  });

  app.get('/logout',로그인했니, function(요청,응답){
   요청.logout(function(에러){
    if(에러){ return next(err);}
    응답.redirect('/login');
   }) ;
  })