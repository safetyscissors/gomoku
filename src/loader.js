function load(){
	load_pages([
		{'pid':'loggedout','url':'page_logged_out.html'},
		{'pid':'login','url':'page_login.html'},
		{'pid':'newuser','url':'page_new_user.html'},
		{'pid':'live','url':'page_live_listing.html'},
		{'pid':'gamechat','url':'page_game.html'},
		{'pid':'settings','url':'page_settings.html'},
		{'pid':'fullmenu','url':'page_full_menu.html'}
	]);
	load_modules([
		'src/module_menus.js',
		'src/module_login.js',
		'src/module_lobby.js',
		'src/module_game.js',
		'src/module_chat.js',
		'src/module_settings.js',
		'src/module_bus.js'
	]);
}load();


function load_complete(){
	$('#load').delay(500).fadeOut(200,function(){
		$(this).remove();
	});
	menu_init();
	GLOBAL['pusher'] = new Pusher('8f1953e37a7c4944dfb4');

	if(login_in()){
		var onlinebus=new Bus();
		onlinebus.load('request','flagOnline');
		onlinebus.load('uid',GLOBAL['uid']);
		onlinebus.depart();
	}

console.debug(GLOBAL);
}
function load_pages(pages){
	if(pages.length>0){
		var page=pages.shift();
		$.get(page.url, function(content){
			page.content=content;
			if(typeof GLOBAL['page']==='undefined'){
				GLOBAL['page']=[];
			}
			GLOBAL['page'][page.pid]=page.content;
			load_pages(pages);
		});
	}else{
	}
}
function load_modules(scripts){
	if(scripts.length>0){
		var src=scripts.shift();
		$.getScript(src, function(){
			load_modules(scripts);
		});
	}else{
		load_complete();
	}
}
