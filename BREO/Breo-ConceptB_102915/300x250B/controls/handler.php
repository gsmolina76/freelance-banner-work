<?php

$keyframeFile = 'keyframes.txt';

function save_keyframes($keyframes)
{
	global $keyframeFile;
	$status = "complete";

	file_put_contents($keyframeFile, serialize($keyframes));

  return $status;
}

function retrieve_keyframes()
{
	global $keyframeFile;
	
	$keyframes = unserialize(file_get_contents($keyframeFile));
	
	if ( $keyframes == FALSE ) { 	$keyframes = 'empty'; }

  return $keyframes;
}

$possible_url = array("retrieve", "save");

$value = "An error has occurred";

if (isset($_GET["action"]) && in_array($_GET["action"], $possible_url))
{
  switch ($_GET["action"])
    {
      case "retrieve":
        $value = retrieve_keyframes();
        break;
      case "save":
        if (isset($_GET["keyframes"]))
          $value = save_keyframes($_GET["keyframes"]);
        else
          $value = "Missing argument";
        break;
    }
}

exit(json_encode($value));

?>