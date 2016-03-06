/* ********************* GLOBALS ********************* *\
	array 	page
	string 	currentpage
\* *************************************************** */

//link clicks
$(document).on('click tap', 'a', function(e){
	menu_load_page($(this).attr('id'));
	e.preventDefault();
});
//page change listener
$(window).on('hashchange', function() {
	var hash=window.location.hash.substring(1);
	if(GLOBAL['currentpage']!=hash){
		menu_load_page(hash);
	}
});

function menu_load_page(menu_action){
	//back btn gets caught by default
	if(!login_in()){	//if not logged in,
		if(GLOBAL['currentpage']=='play'&&menu_action!='play'){
			 canvas_clear();
		}
		switch(menu_action){
		case 'new':	menu_transition(menu_new_user);
					break;
		case 'login':	menu_transition(menu_login); 
					break;
		case 'play':	menu_transition(menu_play);
					break;
		default:		menu_transition(menu_logged_out);
					menu_action='';
		}
	}else{	//if logged in,
		if(GLOBAL['currentpage']=='live'&&menu_action!='live'){
			lobby_notification_leave();
		}
		if(GLOBAL['currentpage']=='livegame'&&menu_action!='livegame'){
			console.log(GLOBAL['game'].gid);
			if(typeof GLOBAL['pusher'].channel('gameroom_'+GLOBAL['game'].gid)!=='undefined'){
			console.log('problem');
				chat_notification_leave();
			}
		}
		if(GLOBAL['currentpage']=='play'&&menu_action!='play'){
			if(typeof GLOBAL['game']!=='undefined'){
				GLOBAL['uid']=GLOBAL['game'].p1;
			}
			canvas_clear();
		}
		switch(menu_action){
		case 'play':	menu_transition(menu_play);
					break;
		case 'logout': login_out();
					break;
		case 'live':	menu_transition(menu_live_listing);
					break;
		case'settings':menu_transition(menu_settings);
					break;
		case 'stats':	abstract();
					break;
		case 'challengenew':menu_action='live';
					menu_challenge_form();
					break;
		case 'livegame':if(GLOBAL['currentpage']=='live'){
						menu_transition(menu_load_game);
					}else{
						menu_transition(menu_live_listing);
						menu_action='live';
					}
					break;
		default:		menu_transition(menu_logged_in);
					menu_action='';
					break;
		}
	}
	GLOBAL['currentpage']=menu_action;
	updateURL(menu_action);
}
function menu_init(){
	var hash = window.location.hash.substring(1);
	menu_load_page(hash);
}
function abstract(){
	
}
function updateURL(hash){
	CURRENTPAGE=hash;
	location.hash = hash;
}
function menu_play(){
	$('#main').html(GLOBAL['page']['gamechat']);
	$('#save').css('display','none');
	$('#quit').css('display','none');
	game_play_local();
	canvas_init('nochat');
	game_loop();
}
function menu_login(){
	$('#main').html(GLOBAL['page']['login']);
}
function menu_new_user(){
	$('#main').html(GLOBAL['page']['newuser']);
}
function menu_settings(){
	$('#main').html(GLOBAL['page']['settings']);
}
function menu_logged_out(){
	$('#main').html(GLOBAL['page']['loggedout']);
}
function menu_logged_in(){
	$('#main').html(GLOBAL['page']['fullmenu']);
}
function menu_live_listing(){
	$('#main').html(GLOBAL['page']['live']);
	lobby_init();
}
function menu_load_game(){
	$('#main').html(GLOBAL['page']['gamechat']);
	chat_init();
	canvas_init();
	game_get_data();
}
function menu_challenge_form(){
	$('#challengealt').fadeOut(100);
	$('#challenge').delay(100).fadeIn(100);
}
function menu_transition(action){
	transitionOut();
	setTimeout(function(){
		action();
		transitionIn();
	},200);
}
function transitionOut(){
	$('#main').fadeOut(200);
}
function transitionIn(){
	$('#main').fadeIn(200);
}
