$(document).on('click tap', 'li', function(e){
	lobby_start($(this).attr('value'));
});
$(document).on('submit','#challenge',function(e){
	e.preventDefault();
	login_feedback('#gamefeedback','','');
	lobby_new_game();
});


function lobby_init(){
	//get data
	lobby_notification_join();
	var lobbybus=new Bus();
	lobbybus.load('request','activegames');
	lobbybus.load('callback','lobby_load_callback');
	lobbybus.depart();
}
function lobby_load_callback(data){
console.debug(data);
if(data.length>0){
	var output='<ul id="gameList">';
	data=data.split('|');
	for(var i=0;i<data.length;i++){
		data[i]=data[i].split('-');
		var online=(data[i][4]=='1')?' -online':'';
		var turn=(data[i][2]=='1')?'your turn. ':'their turn. ';
		output+="<li id='game"+data[i][0]+"' class='"+turn.replace(/\s.+/g, '')+"' value='"+data[i][0]+"'>";
		output+=data[i][1]+online+"<br>";
		output+="<span>"+turn+'last move, '+data[i][3]+"</span></li>";
	}
	output+='</ul>';
	$('#activegames').html(output);
}
}
function lobby_update_online(element){
	var lobbybus=new Bus();
	lobbybus.load('request','activegames');
	lobbybus.load('callback','lobby_load_callback');
	lobbybus.depart();
}
function lobby_notification_join(){
	var notificationid='notification_'+GLOBAL['uid'];
	var channel=GLOBAL['pusher'].subscribe(notificationid);
		Pusher.log = function(message) {
			if (window.console && window.console.log) {
				window.console.log(message);
			}
		};
	channel.bind('online', function(data) {
		lobby_update_online(data.action);
	});
}
function lobby_notification_leave(){
	var lobbybus=new Bus();
	lobbybus.load('request','leavelobby');
	lobbybus.depart();	

	var notificationid='notification_'+GLOBAL['uid'];
	GLOBAL['pusher'].unsubscribe(notificationid);	
}
function lobby_new_game(){
	var newgamebus=new Bus();
	newgamebus.load('request','newgame');
	newgamebus.load('target',$('#target').val());
	newgamebus.load('callback','lobby_new_callback');
	newgamebus.depart();
}
function lobby_new_callback(data){
	if(data.indexOf('error')>=0){
		login_feedback('#gamefeedback',data.substring(5),'bad');
	}else{
		data=data.split('-');
		menu_load_page('livegame');
		game_init(data[0],data[1],data[3],data[2],data[4]);
	}
}
function lobby_start(gid){
	var gameinitbus=new Bus();
	gameinitbus.load('request','startgame');
	gameinitbus.load('gid',gid);
	gameinitbus.load('callback','lobby_new_callback');
	gameinitbus.depart();
}
