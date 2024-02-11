const twtForm=document.getElementById('twt-form');
const twtMessages=document.querySelector('.twt-messages');
const roomName=document.getElementById('room-name');
const userList=document.getElementById('users');
const {username,password}=Qs.parse(location.search,{ignoreQueryPrefix:true});

console.log(username);

const socket=io();

socket.emit('joinRoom',({username,password}));

socket.on('message',message =>{
    console.log(message);
    outputMessage(message);

    twtMessages.scrollTop=twtMessages.scrollHeight;

});


twtForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const msg=e.target.elements.msg.value;
    socket.emit('twtMessage',msg);

    e.target.elements.msg.value='';
    e.target.elements.msg.focus();
});

function outputMessage(message){
    const div=document.createElement('div');
    div.classList.add('message');
    div.innerHTML=`<p class="meta">${message.username} <br><span>${message.time}</span></p>
                    <p class="text">
                        ${message.text}
                    </p>`;
    const likebutton=document.createElement('button');
    likebutton.innerHTML=`<link rel="stylesheet" href="css/style2.css">
    <button class="like-button" >Likes:</button>
    <p> ${message.likes}</p>`;
    likebutton.addEventListener('click',()=>{
        inclike(message);

    });
    div.appendChild(likebutton);
    const dislikebutton=document.createElement('button');
    dislikebutton.innerHTML=`<link rel="stylesheet" href="css/style2.css">
    <button class="dislike-button" >Dislike:</button>
    <p> ${message.dislikes}</p>`;
    dislikebutton.addEventListener('click',()=>{
        incdislike(message);

    });
    div.appendChild(dislikebutton);

    document.querySelector('.twt-messages').appendChild(div);

}

function inclike(message){
    console.log("clicked");
    socket.emit('twtlike',message);
}
function incdislike(message){
    console.log("clicked");
   socket.emit('twtdislike',message);
}