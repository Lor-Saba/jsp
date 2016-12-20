<?php ob_start();
	
	$pbid = (string)filter_input(INPUT_GET, 'pbid');

	if (preg_match("/[^\w]/", $pbid)) die('{"error":"Given an invalid ID!"}');

	$html = stream_get_contents(fopen('http://pastebin.com/raw/'.$pbid, "rb")); 

	if ($html == 'Error with this ID!') die('{"error":"Invalid ID!"}');
	if (json_decode(trim($html)) == null) die('{"error":"Invalid JSON"}');

	ob_clean();
	echo $html;