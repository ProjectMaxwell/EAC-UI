<?php

$uwnetid;

$properties = parse_ini_file("../../UWNetID.ini");

$accessToken = "";

$jsonBody = '{"grantType":"CLIENT_CREDENTIALS",
"clientId":"' . $properties['PhiAuthClientId'] . '",
"clientSecret":"' . $properties['PhiAuthClientSecret'] . '"}';

$url = 'http://evergreenalumniclub.com:7080/PhiAuth/rest/token';
$ch = curl_init($url);

curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonBody);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json'
    ));

$response = curl_exec($ch);
curl_close($ch);

$jsonResponse = json_decode($response);
$accessToken = $jsonResponse->accessToken;


if($_POST['uwnetid'] == null){
	echo "do error stuff";
}else{
	$uwnetid = $_POST['uwnetid'];
}

$jsonBody = '{"uwnetid":"' . $uwnetid . '"}';

$url = 'http://evergreenalumniclub.com:7080/PhiAuth/rest/uwnetid_token';
$ch = curl_init($url);

curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonBody);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'Authorization: '  . $accessToken
    ));

$response = curl_exec($ch);

echo $response;

curl_close($ch);

$jsonResponse = json_decode($response);

$data;

$ref=getenv("HTTP_REFERER");
if($ref == null){
	$ref = "http://www.evergreenalumniclub.com/UWNetIDTest/index.php";
}else if(strpos($ref, "?") > 0){
	$ref = substr($ref, 0, strpos($ref, "?"));
}

if(isset($jsonResponse->token)){

	$data = array("token" => $jsonResponse->token,
				  "uwnetid" => $jsonResponse->uwnetid,
				  "expiration" => $jsonResponse->expiration);
	$ref .= "?token=" . $jsonResponse->token . "&uwnetid=" . $jsonResponse->uwnetid . "&expiration=" . $jsonResponse->expiration;


}else if(isset($jsonResponse->errorCode)){
	$data = array("errorCode" => $jsonResponse->errorCode);
	$ref .= "?errorCode=" . $jsonResponse->errorCode;
}else{
	$data = array("errorCode" => "UNKNOWN.ERROR");
	$ref .= "?errorCode=UNKNOWN.ERROR";
}

header("Location: " . $ref);


?>