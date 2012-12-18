<html>
  <head>
    <title>UWNetID Assertion Test Page</title>
  </head>
  <body>
    <form action="UWNetIDBounce.php" method="POST">
      <select name="uwnetid" id="uwnetid">
        <option disabled="disabled" selected="selected">Select a user</option>
        <option value="olsone2">olsone2</option>
        <option value="nivex">nivex</option>
        <option value="unknownUWNetID">unknownUWNetID</option>
    </select>
    <input type="submit" value="SUBMIT"/>
    </form>
    <br />
    <br />
    <br />
    <div style="text-align: center; color: red;">
    <?php
    	if(isset($_GET['uwnetid']) && isset($_GET['token']) && isset($_GET['expiration'])){
    		echo "Found token '" . $_GET['token'] . "' for user '" . $_GET['uwnetid']
    		. "' with expiration '" . $_GET['expiration'] . "'.";
    	}else if(isset($_GET['errorCode'])){
    		echo "Found errorCode '" . $_GET['errorCode'] . "'.";
    	}

    ?>
    </div>
  </body>
</html>