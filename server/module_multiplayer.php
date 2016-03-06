<?php
	function getId(){
		return $_COOKIE['uid'];
	}
	function listActive($db){
		$uid=getId();
		$gamesList=array();
		$listsql="SELECT uids.id,USER.name,uids.firstuid,CHAR_LENGTH(uids.moves),uids.lastmovetime, USER.online FROM USER
			JOIN (SELECT `id`,`moves`, `lastmovetime` ,`firstuid`,`firstuid` AS `uid` 
				FROM `GAMES` where `active`=1 
					AND ((`winner`='{$uid}' AND `forfeit`='1') OR (`winner`<>'{$uid}' AND `forfeit`='0'))
					AND `seconduid`='{$uid}'
					UNION
				SELECT `id`,`moves` , `lastmovetime` ,`firstuid`,`seconduid` AS `uid` 
				FROM `GAMES` where `active`=1 
					AND ((`winner`='{$uid}' AND `forfeit`='1') OR (`winner`<>'{$uid}' AND `forfeit`='0'))
					AND `firstuid`='{$uid}') 
					AS uids
			ON USER.uid=uids.uid";
		if ($stmt = $db->prepare($listsql)){
			$stmt->execute();
			$stmt->bind_result($gid,$name,$first,$turn,$lastTime,$online);
			while ($stmt->fetch()) {
				if($turn==0){
					$turn++;
				}
				if($first!=$uid){
					$turn++;
				}
				$gamesList[]=$gid.'-'.$name.'-'.($turn%2).'-'.since($lastTime).'-'.$online;
			}
			$stmt->close();
		}
		return implode('|',$gamesList);
	}
		function since($time){
			$deltat=strtotime('now')-strtotime($time);
			if(($days=floor($deltat/86400))>0){
				return ($days==1?'1 day ago':$days.' days ago');
			}else if(($hours=floor($deltat/3600)%24)>0){
				return ($hours==1?'1 hour ago':$hours.' hours ago');
			}else if(($min=floor($deltat/60)%60)>0){
				return ($min==1?'1 minute ago':$min.' minutes ago');
			}
			return '< 1 min';
		}
	function setLobbyFlag($db){
		if ($stmt = $db->prepare('UPDATE `USER` SET `lobby`=1 WHERE `uid`=?')){
			$stmt->bind_param('s',getId());
			$stmt->execute();
			$stmt->close();
		}	
	}
	function rmLobbyFlag($db){
		if ($stmt = $db->prepare('UPDATE `USER` SET `lobby`=0 WHERE `uid`=?')){
			$stmt->bind_param('s',getId());
			$stmt->execute();
			$stmt->close();
		}	
	}
	function getUserKey($db,$target){
		$user=$db->real_escape_string($target);
		$sqlcheck='SELECT `uid` FROM `USER` 
				 WHERE `name` = "'.$user.'"'; 
		$uid='';
		if ($stmt = $db->prepare($sqlcheck)) {
			$stmt->execute();
			$stmt->bind_result($uid);
			$stmt->fetch();
			$stmt->close();
			if($uid>0){
				return $uid;
			}
		}
		return 'error'.'sorry. imaginary friends are not valid';
	}
	function initGameRecord($pusher,$db,$key){
		if (strpos($key,'error')!==FALSE){
			return $key;
		}else{
			$gameId=0;
			$p1=getId();
			$p2=$key;
			if($p1==$p2){
				return 'error'.'why you do this?';
			}
			$newGame='INSERT INTO `GAMES` (`firstuid`, `seconduid`) VALUES ("'.$p1.'", "'.$p2.'")';
			if ($stmt = $db->prepare($newGame)) {
				$stmt->execute();
				$gameId=$stmt->insert_id;
				$stmt->close();
			}
			if($gameId>0){
				if($stmt2 = $db->prepare("SELECT lobby FROM USER WHERE uid = ?")){
					$stmt2->bind_param('s',$p2);
					$stmt2->execute();
					$stmt2->bind_result($online);
					$stmt2->fetch();
					$stmt2->close();
					if($online==1){
						$channel='notification_'.$p2;
						$pusher->trigger($channel, 'online', array('action'=>'newgame'));
					}
				}

				return getGameInitData($db,$gameId);
			}
			return 'error'.'sorry. didnt work out this time';
		}
	}
	function getGameInitData($db,$gid){
		$players=array();
		$gameData="SELECT USER.uid,USER.name,gameuids.player FROM USER
				JOIN
				(SELECT firstuid as uid,1 as player FROM `GAMES` WHERE id={$gid}
				UNION
				SELECT seconduid as uid,2 as player FROM `GAMES` WHERE id={$gid}) as gameuids
				ON USER.uid=gameuids.uid";
		if ($stmt = $db->prepare($gameData)) {
			$stmt->execute();
			$stmt->bind_result($pid,$pname,$playerKey);
			while ($stmt->fetch()) {
				$players[$playerKey]=$pid.'-'.$pname;
			}
			$stmt->close();
		}
		return $gid.'-'.$players[1].'-'.$players[2];
	}
/* ********************************************************** *\
chat stuff
\* ********************************************************** */
function addMsg($pusher,$db,$data){
	$dbData=array();
	foreach($data as $val){
		if($val['key']=='gid'){ $dbData['gid']=$val['value'];}
		else if($val['key']=='msg'){ $dbData['msg']=$db->real_escape_string($val['value']);}
		else if($val['key']=='uid'){ $dbData['uid']=$db->real_escape_string($val['value']);}
		else if($val['key']=='opponent'){ $dbData['opponent']=$db->real_escape_string($val['value']);}
	}

	$chatInsert='INSERT INTO `CHAT`( `gid`, `uid`, `msg`) VALUES (?,?,?)';
	if($stmt = $db->prepare($chatInsert)){
		$stmt->bind_param('sss',$dbData['gid'],$dbData['uid'],$dbData['msg']);
		$stmt->execute();
		$stmt->close();
	}

	$room='gameroom_'.$dbData['gid'];
	$pusher->trigger($room, 'chat', array('msg' => $dbData['msg'],'id'=>$dbData['uid']) );
}
function loadConversation($db,$data){	
	$gid=bus_getVal('gid',$data);
	$result=array();
	$chatHistory='SELECT msg,uid FROM `CHAT` WHERE gid=? ORDER BY rid ASC';
	if($stmt = $db->prepare($chatHistory)){
		$stmt->bind_param('s',$gid);
		$stmt->execute();
		$stmt->bind_result($msg,$uid);
		while ($stmt->fetch()){
			$result[]=array($uid,$msg);
		}
		$stmt->close();
	}
	if(count($result)==0){
		return '';
	}else{
		return json_encode($result);
	}
}
function endConversation($db,$data){
	$gid=bus_getVal('gid',$data);
	$clearChat='REMOVE FROM `CHAT` WHERE gid=?';
	if($stmt = $db->prepare($clearChat)){
		$stmt->bind_param('s',$gid);
		$stmt->execute();
		$stmt->close();
	}
}
	function getMoveList($db,$data){
		$gid=$db->real_escape_string(bus_getVal('gid',$data));
		$movesSql="SELECT `moves`,`winner`,`forfeit` FROM `GAMES` WHERE `id`='{$gid}'";
		$moves='';
		if ($stmt = $db->prepare($movesSql)) {
			$stmt->execute();
			$stmt->bind_result($moves,$winner,$forfeit);
			$stmt->fetch();
			$stmt->close();
			if($gid>0){
				return $moves.'*'.$winner.'*'.$forfeit;
			}
		}
		return 'error'.'sorry. didnt work out this time';	
	}
	function updateBoard($pusher,$db,$data){
		$boardString=$db->real_escape_string(bus_getVal('board',$data));
		$p2=$db->real_escape_string(bus_getVal('p2',$data));
		$gid=$db->real_escape_string(bus_getVal('gid',$data));
		if($stmt = $db->prepare("UPDATE GAMES SET moves = ? WHERE id = ?")){
			$stmt->bind_param('ss',$boardString,$gid);
			$stmt->execute();
			$stmt->close();
		}
		if(strlen($boardString)>0){
			$moves=explode('|',$boardString);
			$turn=count($moves)-1;
			$room='gameroom_'.$gid;
		$pusher->trigger($room, 'game', array('type'=>'move','move'=>$moves[$turn],'turn'=>$turn));
			
			if($stmt2 = $db->prepare("SELECT lobby FROM USER WHERE uid = {$p2}")){
				$stmt2->execute();
				$stmt2->bind_result($online);
				$stmt2->fetch();
				$stmt2->close();
				if($online==1){
					$channel='notification_'.$p2;
					$pusher->trigger($channel, 'online', array('action'=>'newmove'));
				}
			}
		}
	}
	function undoFlag($pusher,$db,$data){
		$turn=$db->real_escape_string(bus_getVal('turn',$data));
		$gid=$db->real_escape_string(bus_getVal('gid',$data));
		$room='gameroom_'.$gid;
		$pusher->trigger($room, 'game', array('type'=>'undo','turn'=>$turn));		
	}
	function forfeitFlag($pusher,$db,$data){
		$gid=$db->real_escape_string(bus_getVal('gid',$data));
		$uid=getId();
		$winner=$db->real_escape_string(bus_getVal('winner',$data));
		if($stmt = $db->prepare("UPDATE GAMES SET forfeit=1,winner=? WHERE id=?")){
			$stmt->bind_param('ss',$winner,$gid);
			$stmt->execute();
			$stmt->close();
		}
		$room='gameroom_'.$gid;
		$pusher->trigger($room, 'game', array('type'=>'forfeit','requestor'=>$uid));		
	}
	function endFlag($pusher,$db,$data){
		$gid=$db->real_escape_string(bus_getVal('gid',$data));
		$winner=$db->real_escape_string(bus_getVal('winner',$data));
		$room='gameroom_'.$gid;
		$pusher->trigger($room, 'game', array('type'=>'lose','winner'=>$winner));		
	}
	function finalizeGame($db,$data){
		$gid=$db->real_escape_string(bus_getVal('gid',$data));
		$winner=$db->real_escape_string(bus_getVal('winner',$data));
		if($stmt = $db->prepare("UPDATE GAMES SET winner=? WHERE id=?")){
			$stmt->bind_param('ss',$winner,$gid);
			$stmt->execute();
			$stmt->close();
		}
	}
	function confirmFinalized($db,$data){
		$gid=$db->real_escape_string(bus_getVal('gid',$data));
		if($stmt = $db->prepare("UPDATE GAMES SET active=0 WHERE id=?")){
			$stmt->bind_param('s',$gid);
			$stmt->execute();
			$stmt->close();
		}
	}
	function setNotification($db,$data){
		$ph=$db->real_escape_string(bus_getVal('ph',$data));
		$carrier=$db->real_escape_string(bus_getVal('carrier',$data));
		$uid=getId();
		$carriertypes=array('tm'=>'tmomail.net','vz'=>'vtext.com','sp'=>'messaging.sprintpcs.com');
		$ph=$ph.'@'.$carriertypes[$carrier];
		if($stmt = $db->prepare("UPDATE USER SET ph=? WHERE uid=?")){
			$stmt->bind_param('ss',$ph,$uid);
			$stmt->execute();
			$stmt->close();
		}		
		return 'updated your information';
	}
?>
