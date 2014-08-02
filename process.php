<?php

	// declare address for proxy server
	define ('HOSTNAME', 'http://clinicaltrial.gov/');
	
	// get pathname from ajax call
	$path = $_GET['path'];
	$url = HOSTNAME.$path;

	//var_dump($path);
	//die();

	// open cURL session
	$curl = curl_init($url);
	
	// don't return http headers but do return contents of the call
	curl_setopt ($curl, CURLOPT_HEADER, FALSE);
	curl_setopt ($curl, CURLOPT_RETURNTRANSFER, true);
	
	// execute cURL command
	$xml = curl_exec($curl);

	// set content-type
	header("Content-Type: text/xml");
	
	// close cURL session
	curl_close($curl);

	// convert xml to json format
	$xmlString = simplexml_load_string($xml);
	$json = json_encode($xmlString);
	
	//var_dump($json);
	//die();
	
	// send to front end
	echo $json;
?>
