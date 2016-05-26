<?php ob_start();
	
	$pbid = (string)filter_input(INPUT_POST, 'pbid');

	if (preg_match("/[^\w]/", $pbid)) die('{error:"Invalid ID!"}');

	$c = curl_init('http://pastebin.com/raw/'.$pbid);
		 curl_setopt($c, CURLOPT_RETURNTRANSFER, true);

	$html = curl_exec($c);

	if (curl_error($c)) die('{error:`'.curl_error($c).'`}');
	if ($html == 'Error with this ID!') die('{error:"Invalid ID!"}');
	if (json_decode(trim($html)) == null) die('{error:"Invalid JSON"}');

	ob_clean();
	echo $html;

	curl_close($c);