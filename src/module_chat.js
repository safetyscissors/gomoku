$(document).on('submit','#chatForm',function(e){
	chat_send_msg();
});

function chat_init(){
	$('#chatHeader').html(GLOBAL['game'].opponentname);
	chat_notification_join();
	chat_init_load();
	$('#gameMenu .hidden').addClass('endgame');
	$('#gameMenu .hidden').removeClass('hidden');	
	$('#chatPane').fadeIn(200);
	$('#gameMenu').css('left',300);
}
function chat_init_load(){
	$("#chatHeader").html(GLOBAL['opponent']);
	var chatbus=new Bus();
	chatbus.load('request','chatinit');
	chatbus.load('uid',GLOBAL['uid']);
	chatbus.load('gid',GLOBAL['game'].gid);
	chatbus.load('callback','chat_load_bulk');
	chatbus.depart();
}
function chat_load_bulk(data){
	if(data.length>0){
		data=jQuery.parseJSON(data);
		for(var i=0;i<data.length;i++){
			chat_load_msg(data[i][0],data[i][1],false);
		}
	}
}
function chat_send_msg(){
	var msg=chat_clean($('#msg').val());
	var chatbus=new Bus();
	chatbus.load('request','newmsg');
	chatbus.load('msg',msg);
	chatbus.load('opponent',GLOBAL['game'].opponentid);
	chatbus.load('uid',GLOBAL['uid']);
	chatbus.load('gid',GLOBAL['game'].gid);
	chatbus.load('callback','chat_receive_msg');
	chatbus.depart();
	$('#msg').val('');
}
	function chat_clean(msg){
		return msg;
	}
	function chat_receive_msg(data){
	}

function chat_notification_join(){
	var notificationid='gameroom_'+GLOBAL['game'].gid;
	var channel=GLOBAL['pusher'].subscribe(notificationid);
	channel.bind('chat', function(data) {
		chat_load_msg(data.id,data.msg,true);
	});
	channel.bind('game', function(data) {
		switch(data.type){
			case 'move':	game_load_move(data.move,data.turn);
						break;
			case 'lose':	if(data.winner!=GLOBAL['uid']){
							game_next_state();						
							game_over('oh noes. you lose.');
							game_confirm_end();
						}
						break;
			case 'forfeit':if(data.requestor!=GLOBAL['uid']){
							winner=GLOBAL['uid'];
							game_next_state();
							game_over('you win. they gave up.');
							game_confirm_end();
						}
						break;
			case 'undo':	game_opponent_undid(data.turn);
						break;
		}
	});

}
function chat_notification_leave(){
	var notificationid='gameroom_'+GLOBAL['game'].gid;
	GLOBAL['pusher'].unsubscribe(notificationid);	
}
function chat_load_msg(id,msg,alert){
	msg=msg.split('\\').join('');
	var sender=(GLOBAL['uid']==id)?'myChat':'rcdChat';
	$('#chatHistory').append('<div class="'+sender+'">'+msg+'</div>');
	$('#chatHistory').scrollTop($('#chatHistory')[0].scrollHeight);
	
}
