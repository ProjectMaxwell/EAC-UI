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


    	function buildAccessTokenForm(){

   		 	echo "<br /><br /><br />";
			?>
			<form action="UWNetIDAssertionGrant.php" method="POST">
				<label for="uwnetidToken">uwnetidToken to convert</label>
				<input name="uwnetidToken" id="uwnetidToken" value="<?php echo $_GET['token']; ?>" size="35"/>
				<input type="submit" value="Convert to accessToken"/>
			</form>
			<?php
    	}

    ?>
    </div>
    <div>
    	<?php
		if(isset($_GET['token']) && $_GET['token'] != null && $_GET['token'] != ""){
			buildAccessTokenForm();
		}
    	?>
    </div>
    <div style="text-align: center; color: red;">
    	<?php

		if(isset($_GET['accessToken']) && isset($_GET['userId']) && isset($_GET['ttl'])){
			 echo "Found accessToken '" . $_GET['accessToken'] . "' for user '" . $_GET['userId']
			. "' with ttl '" . $_GET['ttl'] . "'.";
		}else if(isset($_GET['accessTokenErrorCode'])){
			echo "Found accessTokenErrorCode '" . $_GET['accessTokenErrorCode'] . "'.";
    	}
    	?>
    </div>
  </body>
</html>