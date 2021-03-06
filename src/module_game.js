$(document).on('click tap','#canvas',function(e){canvasClick(e);});
$(document).on('touchstart','#canvas',function(e){canvasClick(e);});

$(document).on('click tap','.endgame',function(){game_exit(this);});
$(document).on('touchstart','.endgame',function(){game_exit(this);});

function Game(gid,p1,p2,p1name,p2name){
	this.gid=gid;

	this.p1=p1;
	this.p2=p2;

	this.p1name=p1name;
	this.p2name=p2name;

	this.opponentid=(p1==GLOBAL['uid'])?p2:p1;
	this.opponentname=(p1==GLOBAL['uid'])?p2name:p1name;

	this.state='init';
	this.board=[];
	this.moves=[];
	
	return this;
}
function game_init(gid,p1,p2,p1name,p2name){
	GLOBAL['game']=new Game(gid,p1,p2,p1name,p2name);
}
function game_get_data(){
	var movesbus=new Bus();
	movesbus.load('request','getmovelist');
	movesbus.load('gid',GLOBAL['game'].gid);
	movesbus.load('callback','game_load_data');
	movesbus.depart();
}
function game_load_data(serverraw){
		serverraw=serverraw.split('*');
		var forfeit=serverraw[2];
		var winid=serverraw[1];
		var data=serverraw[0];
		if(data==''){
			GLOBAL['game'].moves=[];
		}else{
			var coords=data.split('|');
			for(var i=0;i<coords.length;i++){
				var coordx=parseInt(coords[i].substring(0,1),16);
				var coordy=parseInt(coords[i].substring(1),16);
				var player=(i%2==0)?GLOBAL['game'].p1:GLOBAL['game'].p2;
				var mycolor=(GLOBAL['uid']==player)?'white':'black';
				game_log_piece({x:coordx,y:coordy,color:mycolor},player);
			}
		}

		game_loop();
		if(winid!=0&&winid!=GLOBAL['uid']){
			winner=-1;					
			game_over('oh noes. you lose.');
			game_confirm_end();
		}else if(forfeit==1){
			winner=-1;
			game_over('you win. they gave up.');
			game_confirm_end();	
		}
}
function game_play_local(){
	 game_init(0,GLOBAL['uid'],GLOBAL['uid']+1,'p1','p2');
}
function game_exit(button){
	var action=$(button).attr('id');
	if(action=='close'){
		$('#endgamePopup').fadeOut(200);
	}
	if(action=='undo'){
		game_undo();
	}
	if(action=='hidechat'){
		if($('#hidechat').html()=='hide chat'){
			$('#hidechat').html('show chat');
			$('#chatPane').animate({left:-$('#chatPane').width()},function(){$('#chatPane').hide();});
			$('#gameMenu').animate({left: '0'});
				canvas_init('nochat');
				canvas_draw_board();
		}else{
			$('#hidechat').html('hide chat');
			$('#chatPane').css('left',-$('#chatPane').width());
			$('#chatPane').show();
			$('#chatPane').animate({left: '0'});
			$('#gameMenu').animate({left: $('#chatPane').width()});
			GLOBAL['reference']=$('#chatPane').width();
				canvas_init();
				canvas_draw_board();
		}
	}
	if(action=='lobby'){
		canvas_clear();
		if(GLOBAL['currentpage']=='play'){
			updateURL('');
		}else{
			updateURL('live');
		}
	}
	if(action=='quit'){
		if(GLOBAL['game'].state=='game'){
			var quitbus=new Bus();
			quitbus.load('request','forfeit');
			quitbus.load('winner',GLOBAL['game'].opponentid);
			quitbus.load('gid',GLOBAL['game'].gid);
			quitbus.depart();
			winner=-1;
				game_next_state();
				game_over('you gave up');
		}

	}
}
function game_loop(){
	var state=GLOBAL['game'].state;
	if(state=='init'){
		canvas_draw_board();
		game_next_state();
	}else if(state=='game'){
		canvas_draw_board();
		if((winner=game_win_condition())>=0){
			game_next_state();
			game_loop();
		}
	}else if(state=='exit'){
		game_finish(winner);
	}
}
	function game_next_state(){
		var states=['init','game','exit'];
		var nextstate=states.indexOf(GLOBAL['game'].state);
		nextstate++;
		nextstate=(nextstate==(states.length))?0:nextstate;
		GLOBAL['game'].state=states[nextstate];
	}
	function game_my_turn(){
		var count=GLOBAL['game'].moves.length%2;
		if((GLOBAL['game'].p1==GLOBAL['uid'])&&count==0){
			return true;
		}
		if((GLOBAL['game'].p2==GLOBAL['uid'])&&count==1){
			return true;
		}
		return false;
	}
	function game_log_piece(o,pid){
		o.player=pid;
		if(!(GLOBAL['game'].board[o.x] instanceof Array)){
			GLOBAL['game'].board[o.x]=[];
		}
		o.absx=Math.floor((Math.random()*cw/7)-cw/14);
		o.absy=Math.floor(Math.random()*cw/7-cw/14);
		GLOBAL['game'].board[o.x][o.y]=o;

		o.index=GLOBAL['game'].moves.length;
		GLOBAL['game'].moves.push(o);
	}
	function game_update_move(){
		if(GLOBAL['game'].moves.length>0){
			var output=[];
			for(var i=0;i<GLOBAL['game'].moves.length;i++){
				var hexx=GLOBAL['game'].moves[i].x.toString(16);
				var hexy=GLOBAL['game'].moves[i].y.toString(16);
				output.push((hexx+hexy).toUpperCase());
			}
			var boardString=output.join('|');
			var update=new Bus();
			update.load('request','updateBoard');
			update.load('board',boardString);
			update.load('p2',GLOBAL['game'].opponentid);
			update.load('gid',GLOBAL['game'].gid);
			update.depart();
		}
	}
	function game_load_move(move,turn){
		if(move==''){
		}else if(turn==(GLOBAL['game'].moves.length-1)){
		}else{
			var p2=(GLOBAL['game'].p1==GLOBAL['uid'])?GLOBAL['game'].p2:GLOBAL['game'].p1;
			var coordx=parseInt(move.substring(0,1),16);
			var coordy=parseInt(move.substring(1),16);
			var mycolor='black';
			var o={x:coordx,y:coordy,color:mycolor};
			game_log_piece(o,p2);
			game_loop();
		}
	}
	function game_undo(){
		if(GLOBAL['game'].state=='game'&&GLOBAL['game'].moves.length>0){
			if(!game_my_turn()){ //i just moved
				var o=GLOBAL['game'].moves.pop();
				GLOBAL['game'].board[o.x][o.y]=undefined;
				canvas_draw_board();
				if(GLOBAL['currentpage']=='play'){
				}else{
					var undobus=new Bus();
					undobus.load('request','undo');
					undobus.load('gid',GLOBAL['game'].gid);
					undobus.load('turn',GLOBAL['game'].moves.length);
					undobus.depart();
				}				
			}
		}
	}
	function game_opponent_undid(turn){
	console.log(GLOBAL['game'].moves.length+' '+turn);
		if(GLOBAL['game'].moves.length!=turn){
			var o=GLOBAL['game'].moves.pop();
			GLOBAL['game'].board[o.x][o.y]=undefined;
			canvas_draw_board();
		}
	}
	function game_win_condition(){ //-1=no winner, 1=p1, 2=p2
		if(GLOBAL['currentpage']!='play'&&game_my_turn()){
			return -1;
		}
		if(GLOBAL['game'].moves.length>0){
			var p=GLOBAL['game'].moves[GLOBAL['game'].moves.length-1];
			var ylength=recursiveLineSearch(p.x,p.y,0,1,p.player,0)+recursiveLineSearch(p.x,p.y,0,-1,p.player,1);
			var xlength=recursiveLineSearch(p.x,p.y,1,0,p.player,0)+recursiveLineSearch(p.x,p.y,-1,0,p.player,1);

			var lrbu=recursiveLineSearch(p.x,p.y,1,1,p.player,0)+recursiveLineSearch(p.x,p.y,-1,-1,p.player,1);
			var rlbu=recursiveLineSearch(p.x,p.y,-1,1,p.player,0)+recursiveLineSearch(p.x,p.y,1,-1,p.player,1);
			if(ylength>4||xlength>4||lrbu>4||rlbu>4){
				return (p.player==GLOBAL['game'].p1)?1:2;
			}
		}
		return -1;
	}
		function recursiveLineSearch(xs,ys,xdir,ydir,player,ct){
			if(canvas_valid_move({x:xs+xdir,y:ys+ydir})==0){
				if(GLOBAL['game'].board[xs+xdir][ys+ydir].player==player){
					return recursiveLineSearch(xs+xdir,ys+ydir,xdir,ydir,player,ct+=1);
				}
			}
			return ct;
		}
	function game_finish(winner){
		if(typeof winner!=='undefined'&&winner>0){
			if(GLOBAL['currentpage']!='play'){
				var winbus=new Bus();
				winbus.load('request','endgame');
				winbus.load('winner',GLOBAL['uid']);
				winbus.load('gid',GLOBAL['game'].gid);
				setTimeout(function(){winbus.depart()},1000);
			}
			game_over('you won the round!');
		}
	}
	function game_over(message){
		$('#quit').addClass('disabled');
		GLOBAL['game'].state='exit';
		var name=(winner==GLOBAL['game'].p1)?GLOBAL['game'].p1name:GLOBAL['game'].p2name;
		$('#winmsg').html(message+'<br><br>');
		$('#endgamePopup').fadeIn(200);
	}
	function game_confirm_end(){
		var losebus=new Bus();
		losebus.load('request','confirmEnd');
		losebus.load('gid',GLOBAL['game'].gid);
		losebus.depart();
	}
/* ************************************************ *\
	canvas
\* ************************************************ */
var canvas, ctx, w, h, cw, x, y;
	function canvas_init(flag){
		var offset=(GLOBAL['currentpage']=='play')?0:$('#chatPane').width();
		offset=(flag=='nochat')?0:offset;
		offset=offset/1.6;
		canvas=$("#canvas")[0];
		ctx=canvas.getContext("2d");
		canvas.width=window.innerWidth;
		canvas.height=window.innerHeight;

		w=canvas.width-20;
		h=canvas.height-20;
		var orientation=(w>h)?'landscape':'portrait';		
		x=(orientation=='portrait')?10:((w-h)/2)-10;
		x+=offset;
		y=(orientation=='landscape')?10:((w-h)/2)-10;
		w=h=(orientation=='landscape')?h:w;
		cw=w/14;
	}
	function canvasClick(e){
		if(GLOBAL['game'].state=='game'){
			if(game_my_turn()){		
				var o=canvas_get_coord(e.clientX,e.clientY);
				if(canvas_valid_move(o)==1){
					game_log_piece(o,GLOBAL['uid']); 
					game_update_move();
					game_loop();
				}
			}
		}
		if(GLOBAL['currentpage']=='play'){ //if not multiplayer, swap uid
			GLOBAL['uid']=(GLOBAL['uid']==GLOBAL['game'].p1)?GLOBAL['game'].p2:GLOBAL['game'].p1;
		}
	}
	function canvas_get_coord(rawx,rawy){
		var mycolor=(game_my_turn())?'white':'black';
		if(GLOBAL['currentpage']=='play'){
			mycolor=(GLOBAL['game'].moves.length%2==0)?'white':'black';
		}
		return {x:Math.round((rawx-x)/cw),y:Math.round((rawy-y)/cw),color:mycolor};
	}
	function canvas_valid_move(o){// -1=out of bounds, 0=obstructed, 1=valid
		if(o.x>14||o.y>14||o.x<0||o.y<0){
			return -1; //out of bounds
		}
		if(GLOBAL['game'].board[o.x]!=undefined){
			if(GLOBAL['game'].board[o.x][o.y]!=undefined){
				return 0;
			}
		}
		return 1;
	}
/* ************************************************ *\
	draw board
\* ************************************************ */
	function canvas_clear(){
		ctx.clearRect (0,0,canvas.width,canvas.height);
	}
	function canvas_draw_board(){
		canvas_clear();
		for(var i=0;i<14;i++){
			ctx.beginPath();
			ctx.strokeStyle="lightgray";
			ctx.rect(x+i*cw,y,cw,h);
			ctx.stroke();
			ctx.beginPath();
			ctx.rect(x,y+i*cw,w,cw);
			ctx.stroke();
		}
		for(var i=0;i<GLOBAL['game'].moves.length;i++){
			drawPiece(GLOBAL['game'].moves[i]);
		}
	}
	function drawPiece(o){
		var c=cw/2;
		var gradient = ctx.createRadialGradient(pos(x,o.x,o.absx)-2, pos(y,o.y,o.absy)-2, 2, 
						pos(x,o.x,o.absx)+c, pos(y,o.y,o.absy)-(cw/4), cw);
		gradient.addColorStop(1, 'lightgray');
		gradient.addColorStop(0, o.color);
		if(o.index==GLOBAL['game'].moves.length-1){
			ctx.shadowBlur=14;
			ctx.shadowColor="black";
		}else{
			ctx.shadowBlur=1;
			ctx.shadowColor="black";
		}
		ctx.beginPath();
		ctx.fillStyle=gradient;
		ctx.arc(pos(x,o.x,o.absx), pos(y,o.y,o.absy), cw/2.5, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.shadowBlur=0;
	}	
	 	function pos(direction, coordinate, rand){
			return direction+rand+coordinate*cw;
		}
