const path=require('path');
const http=require('http');
const express= require('express');
const socketio=require('socket.io');
const bodyParser=require('body-parser');
const {formatMessage,formatolderMesaage}=require('./utils/messages');

const {userJoin,getCurrentUser}=require('./utils/users');
const mysql=require('mysql');

const app= express();

const Server=http.createServer(app);
const io=socketio(Server);

const con=mysql.createConnection({
    port:'3306',
    host:'localhost',
    user:'root',
    password:'c074',
    database:'wt_presentation'
});
con.connect(function(err)
{
    if(err)
    {return console.log("Error:"+err.message);}
    else
    {
        return console.log("Database is running!");
    }
});
let table1="create table if not exists users(Id INT(10) Primary key auto_increment,email varchar(50),username varchar(50) , password varchar(50)) ";

con.query(table1, function(err, results, fields) {
    if (err) {
      console.log(err.message);
    }
    else {
        console.log("");
    }
  });

let table= `create table if not exists tweets(Id INT(10) Primary key auto_increment,username varchar(50) , time varchar(100),message LONGTEXT, likes INT(10), dislikes INT(10))`;

con.query(table, function(err, results, fields) {
    if (err) {
      console.log(err.message);
    }
    else {
        console.log("");
    }
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname,'public')));


app.post('/',(req,res)=>{
    var username=req.body.Username;
    var email=req.body.email;
    var password=req.body.pwd;
    let sqlinsert="insert into users(email,username,password) values('"+email+"','"+username+"','"+password+"')";
    
    con.query(sqlinsert,function(err,results,fields)
    {
        if(err)
        {
            console.log(err.message);
        }
        else
        {
            console.log("value inserted");
        }
    });
    res.redirect('/login');
});

app.get('/login',(req,res)=>{

    res.sendFile(path.join(__dirname,'public/login.html'));
});

const botName='ERROR! ';
io.on('connection' ,socket=>{

    socket.on('joinRoom',({username,password})=>{
        let sqltest="select * from users where username='"+username+"' and password='"+password+"'";
        con.query(sqltest,function(err,results,fields)
        {
            if(err)
            {
                console.log(err.message);
            }
            else
            {
                if(results.length>0)
                {
                    const user=userJoin(socket.id,username);
                    socket.join('world');
                    const sql="select * from tweets order by time  ";
                        con.query(sql,function(err,results,fields)
                        {
                            if(err)
                            {
                                console.log(err.message);
                            }
                            else
                            {
                                results.forEach(element => {
                                    socket.emit('message',formatolderMesaage(element.username,element.message,element.time,element.likes,element.dislikes));
                                });
                            }
                        });

                }
                else
                {
                    socket.emit('message',formatMessage(botName,'Incorrect username or password'));
                }
            }
        });
        
    });
    socket.on('twtMessage',(msg)=>{
        const user=getCurrentUser(socket.id);
        sms=formatMessage(user.username,msg);

        io.emit('message',sms);

        const sql1="insert into tweets(username,time,message,likes,dislikes) values('"+user.username+"','"+sms.time+"','"+sms.text+"','"+sms.likes+"','"+sms.dislikes+"')";
        con.query(sql1, function(err, results, fields) {
            if (err) {
              console.log(err.message);
            }
            else {
                console.log("Value inserted");
            }
          });

    });
    socket.on('twtlike',(sms)=>{  
        const user=getCurrentUser(socket.id);
        const sql="update tweets set likes=likes+1 where username='"+user.username+"' and message='"+sms.text+"'";

        con.query(sql,function(err,results,fields)
        {
            if(err)
            {
                console.log(err.message);
            }
            else
            {
                console.log("liked");
            }
        });
    });
    socket.on('twtdislike',(msg)=>{
        const user=getCurrentUser(socket.id);

        const sql="update tweets set dislikes=dislikes+1 where username='"+user.username+"' and message='"+msg.text+"'";
        con.query(sql,function(err,results,fields)
        {
            if(err)
            {
                console.log(err.message);
            }
            else
            {
                console.log("disliked");
            }
        });
    });
   
    
}); 

const port= process.env.PORT || 3000;
Server.listen(port,()=>{
    console.log('Server started at port 3000');
});
