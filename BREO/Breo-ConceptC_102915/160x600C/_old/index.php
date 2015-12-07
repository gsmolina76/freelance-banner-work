<?php
$html = file_get_contents('index.html');
$controls = file_get_contents('controls/js/controls.js');

$html = str_replace('<script src="script.js" type="text/javascript"></script>', '', $html);

$html = str_replace('TimelineLite();', 'TimelineLite({onUpdate:updateSlider});', $html);

$html = str_replace('//begincontrols', '$(document).ready(function () {', $html);
$html = str_replace('//endcontrols', $controls, $html);




$head = '<head>
   <!-- jQuery for testing -->
    <script src="controls/js/jquery-1.10.1.min.js"></script>
    <script src="controls/js/jquery-ui.min.js"></script>
    <script src="controls/js/jquery.ui.touch-punch.min.js"></script>
    <script src="controls/js/html2canvas.js"></script>
    <script src="controls/js/jquery.reveal.js"></script>

    <link rel="stylesheet" HREF="controls/css/jquery-ui.css" type="text/css">
    <link rel="stylesheet" HREF="controls/css/reveal.css" type="text/css">
    <link rel="stylesheet" HREF="controls/css/controls.css" type="text/css">
';

$playercontrols = '
<body onLoad="init()">
    <div class="player-controls">
        <div>
          <button id="burger"><span class="glyphicon glyphicon-align-justify"></span></button>
          <button id="play"><span class="glyphicon glyphicon-play"></span></button>
          <button id="pause"><span class="glyphicon glyphicon-pause"></span></button>
          <button id="reverse"><span class="glyphicon glyphicon-backward"></span></button>
          <button id="restart"><span class="glyphicon glyphicon-retweet"></span></button>
		  <button id="addKeyframe"><span class="glyphicon glyphicon-map-marker"></span></button>
        </div>

        <div id="sliderWrapper">
            <div id="slider"></div>
        </div>
        <div id="keyframes"></div>

    </div>
';

$scripts = '    <div id="myModal" class="reveal-modal"></div>';	
$scripts .= '</body>';
	
$html = str_replace('<body onLoad="init()">', $playercontrols, $html);

$html = str_replace('<head>', $head, $html);

$html = str_replace('</body>', $scripts, $html);

echo $html;















?>