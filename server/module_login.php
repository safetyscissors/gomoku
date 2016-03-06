<?php
function checkUser($db,$data){
	$user=$db->real_escape_string(bus_getVal('user',$data));
	if(userNameExists($db,$user)){
		return 1;
	}else{
		return 0;
	}
}
function newlogin($pusher,$db,$data){
	$pass=$db->real_escape_string(bus_getVal('pass',$data));
	$user=$db->real_escape_string(bus_getVal('user',$data));
	return newUserRecord($pusher,$db,$user,$data);
}
function makeTimeSalt(){
	$round_numerator=5;//5 seconds
	return (round(time()/$round_numerator)*$round_numerator);
}
function makeDaySalt(){
	$round_numerator=60*60*24;//day
	return (round(time()/$round_numerator)*$round_numerator);
}
function translateToServer($db,$data){
	$pass=$db->real_escape_string(bus_getVal('pass',$data));
	$string='';
	for ($i=0; $i < strlen($pass)-1; $i+=2){
	   $string .= chr(hexdec($pass[$i].$pass[$i+1]));
	}
	return $string;
}
function translateToClient($string){
    $hex = '';
    for ($i=0; $i<strlen($string); $i++){
        $ord = ord($string[$i]);
        $hexCode = dechex($ord);
        $hex .= substr('0'.$hexCode, -2);
    }
    return strToUpper($hex);
}

function login($pusher,$db,$data){
	$user=$db->real_escape_string(bus_getVal('user',$data));
	$pass=translateToServer($db,$data);
	$uid=0;

	$currentSalt=''.makeTimeSalt();
	if(strpos($pass,$currentSalt)===false){
		return 'error'.'you shall not pass! you seem suspect';
	}else{
		$pass=substr($pass,strlen($currentSalt));
		$pass=sha1($pass);
		if(($uid=userExists($db,$user,$pass))>0){
			$pass=makeDaySalt().$pass;
			setcookie('uid',$uid,time() + (86400 * 7),'/');
			setcookie('n',$user,time() + (86400 * 7),'/');
			setcookie('p',$pass,time() + (86400 * 7),'/');
			setOnlineFlag($db,$uid);

			notificationOnline($pusher,$db,$uid,'online');
			return $uid;
		}else{
			return 'error'.'hmm I dont see you in my database';
		}

	}
}


	function newUserRecord($pusher,$db,$user,$data){
		$pass=translateToServer($db,$data);
		$pass=sha1($pass);
		$newUser="INSERT INTO `USER`(`name`, `pass`) VALUES ('{$user}','{$pass}')";
		$uid=-1;
		if ($stmt = $db->prepare($newUser)) {
			$stmt->execute();
			$uid=$stmt->insert_id;
			$stmt->close();
		}
		if($uid>=0){
			$pass=makeDaySalt().$pass;
			setcookie('uid',$uid,time() + (86400 * 7),'/');
			setcookie('n',$user,time() + (86400 * 7),'/');
			setcookie('p',$pass,time() + (86400 * 7),'/');
			setOnlineFlag($db,$uid);

			notificationOnline($pusher,$db,$uid,'online');
			return $uid;
		}
		return 'error';
	}
	function userExists($db,$user,$pass){
		$sqlcheck='SELECT `uid` FROM `USER` 
				 WHERE `name` = "'.$user.'" AND `pass` = "'.$pass.'"'; 
		
		if ($stmt = $db->prepare($sqlcheck)) {
			$stmt->execute();
			$stmt->bind_result($uid);
			$stmt->fetch();
			$stmt->close();
			return $uid;
		}
		return -1;
	}
	function userNameExists($db,$user){ //to and from needs to be reversed cause the recipient calls this
		$sqlcheck='SELECT * FROM `USER` 
				 WHERE `name` = "'.$user.'"'; 
		if(!$result = $db->query($sqlcheck)){
		    die('There was an error running the query [' . $db->error . ']');
		}
		return ($result->num_rows==0);	

	}
	function setOnlineFlag($db,$uid){
		if($uid>0){
			if ($stmt = $db->prepare('UPDATE `USER` SET `online`=1 WHERE `uid`=?')){
				$stmt->bind_param('s',$uid);
				$stmt->execute();
				$stmt->close();
			}	
		}
	}
	function setOfflineFlag($db,$uid){
		if($uid>0){
			if ($stmt = $db->prepare('UPDATE `USER` SET `online`=0, `lobby`=0 WHERE `uid`=?')){
				$stmt->bind_param('s',$uid);
				$stmt->execute();
				$stmt->close();
			}	
		}
	}
	function notificationOnline($pusher,$db,$uid,$action){	
		if($uid>0){
			$onlinesql="SELECT USER.uid FROM USER
				JOIN (SELECT `firstuid` AS `uid` 
					FROM `GAMES` where `active`=1 AND(`seconduid`='{$uid}')
						UNION
					SELECT `seconduid` AS `uid` 
					FROM `GAMES` where `active`=1 AND(`firstuid`='{$uid}')) AS uids
				ON USER.uid=uids.uid
				WHERE USER.lobby=1";
			if ($stmt = $db->prepare($onlinesql)){
				$stmt->execute();
				$stmt->bind_result($friendid);
				while ($stmt->fetch()) {
					$channel='notification_'.$friendid;
					$pusher->trigger($channel, 'online', array('action'=>$action));
					return $channel;
				}
				$stmt->close();
			}	
		}
		
	}	
?>
