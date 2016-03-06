/* ********************* GLOBALS ********************* *\
	int		uid
	string	name
\* *************************************************** */

$(document).on('change','#user',function(){
	login_validate_user();
});
$(document).on('change','#pass',function(){
	login_validate_pass();
});
$(document).on('change','#captcha',function(){
	login_validate_captcha();
});
$(window).bind("beforeunload", function() { 
	if(GLOBAL['uid']>0){
		login_offline_flag();
	}
})


//form submissions
$(document).on('submit','form',function(e){
	var form_action=$(this).attr('id');
	if(form_action=='newform'){
		if( login_test()){login_create_new()};
	}else if(form_action=='loginform'){
		if( login_test()){login_salt()};
	}else if(form_action=='settingsform'){
		settings_submit();
	}
	e.preventDefault();
});
function login_validate_user(){	//check user input field
	var username=$('#user').val();
	var cleaned=username.replace(/[^a-zA-Z0-9]+/g,"");
	if(cleaned!==username){
		login_feedback('#userfeedback','whoa, too much awesome. a-z,0-9 pls','bad');
		return;
	}
	if(cleaned==""){
		login_feedback('#userfeedback','gotta give me something','bad');
		return;
	}
	if(GLOBAL['currentpage']=='new'){	//if new, check name isnt taken
		var usernamebus=new Bus()
		usernamebus.load('request','namecheck');
		usernamebus.load('user',username=$('#user').val());
		usernamebus.load('callback','login_username_exists');
		usernamebus.depart();
	}else{
		login_feedback('#userfeedback','looks ok','good');
		login_test();
	}
}
function login_validate_pass(){	//check password input field
	var username=$('#pass').val();GLOBAL
	var cleaned=username.replace(/[^a-zA-Z0-9]+/g,"");

	if(cleaned!==username){
		login_feedback('#passfeedback','whoa, too much awesome. a-z,0-9 pls','bad');
		return;
	}
	if(cleaned==""){
		login_feedback('#passfeedback','lol. you wish','bad');
		return;
	}else{
		login_feedback('#passfeedback','cool','good');
		return;
	}
	login_test();
}
function login_validate_captcha(){
	if(GLOBAL['currentpage']!='new'){
		return true;
	}else{
		var captcha=$('#captcha').val();
		var cleaned=captcha.replace(/[^a-zA-Z0-9]+/g,"");
		if(cleaned!==captcha){
			login_feedback('#captchafeedback','whoa, too much awesome. a-z,0-9 pls','bad');
			return false;
		}else if(cleaned==""){
			login_feedback('#captchafeedback','thats what a robot would say..','bad');
			return false;
		}else{
			return true;
		}
	}
}
function login_username_exists(available){
	var msg=(available==1)?'a bodacious name':'oops. that name is taken';
	var status=(available==1)?'good':'bad';
	login_feedback('#userfeedback',msg,status);
}
function login_feedback(element,message,status){
	if(status==''){
		$(element).html(message);
		$(element).removeClass('good bad');
	}else{
		$(element).html(message);
		$(element).removeClass('good bad');
		$(element).addClass(status);
	}
}
function login_test(){
	if($('#passfeedback').hasClass('good')
		&&$('#userfeedback').hasClass('good')
		&&login_validate_captcha()){
			return true;
	}
	return false;
}
function login_salt(){
	var saltybus=new Bus();
	saltybus.load('request','loginsalt');
	saltybus.load('callback','login_submit');
	saltybus.depart();
}
function login_submit(salt){
	username=$('#user').val();
	password=$('#pass').val();
	password=translate(salt+password);

	var loginbus=new Bus();
	loginbus.load('request','login');
	loginbus.load('user',username);
	loginbus.load('pass',password);
	loginbus.load('callback','login_response')
	loginbus.depart();
}
function login_create_new(){
	username=$('#user').val();
	password=$('#pass').val();
	password=translate(password);

	var loginbus=new Bus();
	loginbus.load('request','createlogin');
	loginbus.load('user',username);
	loginbus.load('pass',password);
	loginbus.load('callback','login_response')
	loginbus.depart();
}
function translate(str) {
	var output='';
	if(str.length>0){
		for(var i=0;i<str.length;i++) {
			temp=str.charCodeAt(i).toString(16);
			output+=(temp.length==1)?('0'+temp):temp;
		}
	}
	return output;
}
function login_response(data){
	if(data.indexOf('error')>=0){
		login_feedback('#loginfeedback',data.substring(5),'bad');
		console.log('error'+data);
	}else{
		GLOBAL['uid']=data;
		menu_load_page('index');
	}
}
function login_in(){	//is logged in
	return GLOBAL['uid']>=0;
}
function login_out(){	//log out
	document.cookie ='uid=;path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	document.cookie ='n=;path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	document.cookie ='p=;path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	
	login_offline_flag();
	updateURL('');
	location.reload();
}
function login_offline_flag(){
	var logoutbus=new Bus();
	logoutbus.load('request','flagOffline');
	logoutbus.load('uid',GLOBAL['uid']);
	logoutbus.depart();
}

/*function getSalt(){
	$.post('server/ajax.php',
		{action:'getSalt'},
		function(data,status){
			submitLogin(data);
		});
}
	$.post('server/ajax.php',
		{action:'validateUser',user:$('#newName').val()},
		function(data,status){
			var header=data.substring(0,7);
			readHeader('#newNameMsg',header);
			$('#newNameMsg').html(data.substring(8));
			$('#newNameMsg').fadeIn(100);
		});
function createNewUser(){
	username=$('#newName').val();
	password=$('#newPass').val();
	password=translate(password);
	console.log(username);
	$.post('server/ajax.php',
		{action:'createUser',user:username,pass:password},
		function(data,status){
			if(data.indexOf('error')>=0){
				console.log(data);
			}else{
				updateURL("");
				location.reload();
			}
		});
}
function submitLogin(salt){
	username=$('#username').val();
	password=$('#password').val();
	password=translate(salt+password);
	$.post('server/ajax.php',
		{action:'login',user:username,pass:password},
		function(data,status){
			if(data.indexOf('error')>=0){
				$('#nameMsg').html(data.substring(5));
				readHeader('#nameMsg','bad');
			}else{
				MYID=data;
				loadCoolMenu("fullUserMenu()");
			}
		});
}*/

