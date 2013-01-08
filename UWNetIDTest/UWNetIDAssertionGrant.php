<?php

$uwnetidToken = "";

if(!isset($_POST['uwnetidToken']) || $_POST['uwnetidToken']  == null){
	echo "do error stuff <br />";
}else{
	$uwnetidToken = $_POST['uwnetidToken'];
}

$jsonBody = '{"grantType":"ASSERTION",
"assertionType":"UWNETID",
"assertion":{"assertionValue":"' . $uwnetidToken . '"},
"clientId":"MAXWELL_WEB_CLIENT"
}';

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

echo $response;
$jsonResponse = json_decode($response);

$ref=getenv("HTTP_REFERER");
if($ref == null){
	$ref = "http://www.evergreenalumniclub.com/UWNetIDTest/index.php";
}else if(strpos($ref, "?") >= 0){
	$ref = substr($ref, 0, strpos($ref, "?"));
}


if(isset($jsonResponse->accessToken)){
	$ref .= "?accessToken=" . $jsonResponse->accessToken . "&userId=" . $jsonResponse->userId . "&ttl=" . $jsonResponse->ttl;
}else if(isset($jsonResponse->errorCode)){
	$ref .= "?accessTokenErrorCode=" . $jsonResponse->errorCode;
}else{
	$ref .= "?accessTokenErrorCode=UNKNOWN.ERROR";
}

header("Location: " . $ref);



?>