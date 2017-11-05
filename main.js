const socket = io('https://rtcstream.heroku.com');

$('#div-stream').hide();

socket.on('ONLINE_USER_ARRAY',arrUser =>{
        $('#div-stream').show();
        $('#div-signup').hide();
        arrUser.forEach( user => {
            const {name ,peerId} = user;

            $('#ulUser').append(`<li id = "${peerId}">${name}</li>`)
        });

        socket.on('NEW_USER_ONLINE',username =>{
            const {name ,peerId} = username;
            $('#ulUser').append(`<li id ="${peerId}">${name}</li>`)
        });
        
});

socket.on('SOMEONE_DISCONNECT',peerId => {
    
    $(`#${peerId}`).remove();
});

socket.on('SIGNUP_FAILED', () => alert('VUI LONG CHON USERNAME KHAC'));



function openStream(){
    const config = {audio : true, video : false};
    return navigator.mediaDevices.getUserMedia(config);
};

function playStream(idVideoTag,stream){
    const video  = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
};

//openStream().then(stream => playStream('localStream',stream));


const peer = new Peer({
    key: 'peerjs',
    host:'rtcstream.heroku.com',
     secure : true,
    port :443
});
peer.on('open',id => {
    $('#my-peer').append(id);
    $('#btnSignUp').click(()=>{
        const username = $('#txtUserName').val();
        socket.emit('SIGNUP_NEW_USER',{name: username,peerId: id});
    });
});

$('#btnCall').click(() => {
    const id  = $('#remoteId').val();
    openStream().then(stream =>{
        playStream('localStream',stream);
        const call = peer.call(id,stream);
        call.on('stream',remoteStream => playStream('friendStream',remoteStream));
    });
})

peer.on('call',call => {
    openStream().then(stream=>{
        call.answer(stream);
        playStream('localStream',stream);
        call.on('stream',remoteStream => playStream('remoteStream',remoteStream));
    }
    );
});


$('#ulUser').on('click','li',function(){
    const id = $(this).attr('id');
        openStream().then(stream =>{
            playStream('localStream',stream);
            const call = peer.call(id,stream);
            call.on('stream',remoteStream => playStream('friendStream',remoteStream));
        });
});