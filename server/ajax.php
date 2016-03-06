<?php
require 'pusher-php-server-master/lib/Pusher.php';
require 'pusher-php-server-master/config.php';
include 'module_db.php';
include 'module_bus.php';
	$pusher = new Pusher($p_key,$p_secret,$app_id);
	$db = new mysqli($DBPATH,$DBUSER,$DBPASS,$DBNAME);
	if($db->connect_errno > 0){
	    die('Unable to connect to database [' . $db->connect_error . ']');
	}	

	$bus=$_POST['bus'];
	unloadBus($pusher,$db,$bus);
	$db->close();

/*
function directory($action,$db){
	switch($action){
		case 'validateUser':include 'login_module.php';
						checkUser($db);
						break;
		case 'getSalt':	include 'login_module.php';
						echo makeTimeSalt();
						break;
		case 'login':		include 'login_module.php';
						login($db);
						break;
		case 'createUser':	include 'login_module.php';
						newlogin($db);
						break;
/*		case 'startGame':	include 'multiplayer_module.php';
						$uid=getUserKey($db);
						echo initGameRecord($db,$uid);
						break;
		case 'continueGame':include 'multiplayer_module.php';
						echo continueGame($db);
						break;
		case 'getMoveList': include 'multiplayer_module.php';
						echo getMoveList($db);
						break;
		case 'listActive': 	include 'multiplayer_module.php';
						updateOffline($db);
						echo listActive($db);
						break;
		case 'updateBoard': include 'multiplayer_module.php';
						echo updateBoard($db);
						break;
		case 'checkNewMove':include 'multiplayer_module.php';
						updateOffline($db);
						echo checkNewMove($db);
						break;
		case 'finalizeGame':include 'multiplayer_module.php';
						echo finalizeGame($db);
						break;
		case 'checkin':	include 'multiplayer_module.php';
						echo checkin($db);
						break;
	}
}*/
?>
