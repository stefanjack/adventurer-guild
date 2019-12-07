<?php
$backup=date("d-m-Y");
if(!file_exists("./".$backup)){
	mkdir("./".$backup);
	copy("./adventurer.txt","./".$backup."/adventurer.txt");
	copy("./channel.txt",   "./".$backup."/channel.txt");
	copy("./prefix.txt",    "./".$backup."/prefix.txt");
	copy("./quest.txt",     "./".$backup."/quest.txt");
	echo "backed up ".$backup;
}
?>