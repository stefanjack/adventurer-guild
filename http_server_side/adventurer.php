<?php
if(isset($_POST['data'])){
	$myfile = fopen("adventurer.txt", "w") or die("Unable to open file!");
	$txt = $_POST['data'];
	fwrite($myfile, $txt);
	fclose($myfile);
	echo "ok";
}
else echo "no data";
?>