const moment=require('moment-timezone');

function formatMessage(username,text)
{
    return{
        username,
        text,
        time:moment().tz("Asia/Calcutta").format(),
        likes:0,
        dislikes:0
    };
}
function formatolderMesaage(username,text,time,likes,dislikes)
{
    return{
        username,
        text,
        time,
        likes,
        dislikes
    };
}
module.exports={formatMessage,formatolderMesaage};