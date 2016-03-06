<?php
function unloadBus($pusher,$db,$bus){
	if(strlen($bus)>0){
		$bus=str_replace("\\","",$bus);
		$data=json_decode($bus,true);
		processPair($pusher,$db,'request',bus_getVal('request',$data),$data);
	}else{
		echo 'error'.'too short';
	}
}

function processPair($pusher,$db,$key,$val,$data){
	switch($val){
		case 'loginsalt':	include 'module_login.php';
						reloadBus($data,makeTimeSalt());
						break;
		case 'login':		include 'module_login.php';
						reloadBus($data,login($pusher,$db,$data));
						break;
		case 'namecheck':	include 'module_login.php';
						reloadBus($data,checkUser($db,$data));
						break;
		case 'createlogin':	include 'module_login.php';
						reloadBus($data,newlogin($pusher,$db,$data));
						break;
		case 'flagOnline':	include 'module_login.php';
						setOnlineFlag($db,bus_getVal('uid',$data));
						notificationOnline($pusher,$db,bus_getVal('uid',$data),'online');
						break;
		case 'flagOffline':	include 'module_login.php';
						setOfflineFlag($db,bus_getVal('uid',$data));
						notificationOnline($pusher,$db,bus_getVal('uid',$data),'offline');
						break;
		case 'leavelobby':	include 'module_multiplayer.php';
						rmLobbyFlag($db);
						break;
		case 'activegames':	include 'module_multiplayer.php';
						setLobbyFlag($db);
						reloadBus($data,listActive($db));
						break;
		case 'newgame':	include 'module_multiplayer.php';
						$targetkey=getUserKey($db,bus_getVal('target',$data));
						reloadBus($data,initGameRecord($pusher,$db,$targetkey));
						break;
		case 'startgame':	include 'module_multiplayer.php';
						reloadBus($data,getGameInitData($db,bus_getVal('gid',$data)));
						break;
		case 'newmsg':		include 'module_multiplayer.php';
						reloadBus($data,addMsg($pusher,$db,$data));
						break;
		case 'chatinit':	include 'module_multiplayer.php';
						reloadBus($data,loadConversation($db,$data));
						break;
		case 'getmovelist': include 'module_multiplayer.php';
						reloadBus($data,getMoveList($db,$data));
						break;
		case 'updateBoard': include 'module_multiplayer.php';
						updateBoard($pusher,$db, $data);
 						break;
		case 'undo':		include 'module_multiplayer.php';
						reloadBus($data,undoFlag($pusher,$db,$data));
 						break;
		case 'endgame':	include 'module_multiplayer.php';
 						endFlag($pusher,$db,$data);
						finalizeGame($db,$data);
 						break;
		case 'forfeit':	include 'module_multiplayer.php';
 						forfeitFlag($pusher,$db,$data);
 						break;
		case 'confirmEnd':	include 'module_multiplayer.php';
 						confirmFinalized($db,$data);
 						break;
		case 'notify':		include 'module_multiplayer.php';
						reloadBus($data,setNotification($db,$data));
						break;
		default:			echo $val;
	}
}
function bus_getVal($key,$input){
if( is_array( $input ) && count( $input ) > 0 ) {
	foreach($input as $pairs){
		if($pairs['key']==$key){
			return $pairs['value'];
		}
	}
	return '';
}
}
function reloadBus($input,$data){
	echo bus_getVal('callback',$input).'+'.$data;
	return;
}
?>
