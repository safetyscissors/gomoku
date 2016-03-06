<?php
	$uid=($_COOKIE['uid']!='')?$_COOKIE['uid']:-1;
	$name=($uid>=0)?$_COOKIE['n']:-1;
	$loggedIn="{'uid':{$uid},'user':'{$name}'}";
?>
<!DOCTYPE html>
<html>
<head>
	<title>Gomoku</title>
	<link href='http://fonts.googleapis.com/css?family=Source+Sans+Pro:300' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" type="text/css" href="src/structure.css">
	<link rel="stylesheet" type="text/css" href="src/structure_chat.css">

</head>
<body>
	<div id="disclaimer">v3.1.0a</div>
	<div class="fullpage" id="load"><br><br><br>Thinking...</div>
	<div class="fullpage" id="transition"></div>	
	<div class="fullpage" id="main"></div>

<script>var GLOBAL=<?php echo $loggedIn;?>;</script>
<script src="http://js.pusher.com/2.1/pusher.min.js" type="text/javascript"></script>
<script src="src/jquery10.2.js"></script>
<script src="src/loader.js"></script>

</body>
</html>
