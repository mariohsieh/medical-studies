<?php

	// declare address for proxy server
	define ('HOSTNAME', 'http://clinicaltrial.gov/');
	
	// get pathname from ajax call
	$path = $_GET['path'];
	$url = HOSTNAME.$path;

	//var_dump($url);
	//die();
	
	// open cUR session
	$curl = curl_init($url);
	
	// don't return http headers but do return contents of the call
	curl_setopt ($curl, CURLOPT_HEADER, FALSE);
	curl_setopt ($curl, CURLOPT_RETURNTRANSFER, true);
	
	// execute cURL command
	$xml = curl_exec($curl);

	// set content-type
	header("Content-Type: text/xml");
	
	curl_close($curl);
	
	//echo $xml;
	//var_dump($xml);
	//die();
	
	$xmlString = simplexml_load_string($xml);
	$json = json_encode($xml);
	$data = json_decode($json, TRUE);
	
	//echo $xml;

?>
