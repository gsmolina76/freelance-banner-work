var animationDone = false;
var interruptScroll = false;
//see css for animating  id's
var activeAnimations = ["one","f1_1","f1_2","f1_3","f1_4","f1_5","two","f2_1","f2_2","f2_3","f2_4","three","f3_1","f3_2","f3_3","f3_4","four","f4_1","f4_2","f4_3","f4_4","five","f5_1","f5_2","f5_3","f5_4","f5_5"];

	// exit handlers

function bgExitHandler() {
	Enabler.exit('bgExit','http://www.complera.com');
}
function ctaExitHandler() {
	Enabler.exit('ctaExit','http://www.complera.com');
}
function ctaExitHandler() {
	Enabler.exit('ctaExit','http://services.gileadhiv.com/complera/pdf/patient-info');
}
function piExitHandler() {
	Enabler.exit('piExit','http://services.gileadhiv.com/complera/pdf/patient-info');
}
function fpiExitHandler() {
	Enabler.exit('fpiExit','http://services.gileadhiv.com/complera/pdf/pi');
}
function fdaExitHandler() {
	Enabler.exit('fdaExit','http://www.fda.gov/medwatch');
}

// after ad is visible...
function adVisibilityHandler() {
	//document.getElementById('bg-exit').style.display = 'block';
	document.getElementById('legal').scrollTop = 0;
	
		// exits
		
	exitEr.applyExits([
		{
			selector: '.bgExit',
			listener: 'click',
			on: bgExitHandler
		},
		{
			selector: '.ctaLink',
			listener: 'click',
			on: ctaExitHandler
		},
		{
			selector: '.piLink',
			listener: 'click',
			on: piExitHandler
		},
		{
			selector: '.fpiLink',
			listener: 'click',
			on: fpiExitHandler
		},
		{
			selector: '.fdaLink',
			listener: 'click',
			on: fdaExitHandler
		}
	]);
	
		// auto-scroll
		
	var scrollInterrupt = function(){
		interruptScroll = true;
	}
	var tl = new TimelineLite({delay:18, onComplete:showScrollMore});
	tl	.call(expandIsi)
		.to('#legal',33.5,{
				scrollTo:{y:731,
				onAutoKill:scrollInterrupt},
				ease:Power0.easeNone
			},'+=.5');
			
		// scroll bar fix
	var scrollThumb = CSSRulePlugin.getRule("#legal:-webkit-scrollbar-thumb");
	if(scrollThumb) {
		var $legal = document.getElementById('legal');
		$legal.addEventListener('scroll',function(){
			var scrollRatio = $legal.scrollTop/($legal.scrollHeight - $legal.clientHeight);
			TweenLite.set(scrollThumb,{cssRule:{backgroundPosition:'50% '+(scrollRatio*100)+'%'}});
		});
	}
	
		// toggle isi listeners (see header script)
	document.getElementById('isi-header').addEventListener('click',toggleIsi);
	document.getElementById('legal').addEventListener('click',toggleIsi);
	document.getElementById("bottom").addEventListener('click', toggleIsi);	

	//set up psudo underlined text links for text images
	setUnderline("bottom", "under1");
	setUnderline("pi", "under2");
	setUnderline("fpi", "under3");
	setUnderline("six", "under4");
	setUnderline("f7_1", "seven_ul");
	
}

function setUnderline(idName, underlineName){
	document.getElementById(idName).addEventListener('mouseover', function(){ fadeIn(underlineName)});
	document.getElementById(idName).addEventListener('mouseout', function(){ fadeOut(underlineName)});
}

function fadeIn(){
	for(var i=0; i < arguments.length; i++){
		document.getElementById(arguments[i]).style.animation = 'fade-in .5s forwards 0s 1';
		document.getElementById(arguments[i]).style.WebkitAnimation = 'fade-in .5s forwards 0s 1';
	}
}

function fadeOut(){
	for(var i=0; i < arguments.length; i++){
		document.getElementById(arguments[i]).style.animation = 'fade-out .5s forwards 0s 1';
		document.getElementById(arguments[i]).style.WebkitAnimation = 'fade-out .5s forwards 0s 1';
	}
}


// after page loaded...
function pageLoadedHandler() {
	if (Enabler.isVisible()) {
		adVisibilityHandler();
	}
	else {
		Enabler.addEventListener(studio.events.StudioEvent.VISIBLE, adVisibilityHandler);
	}
}

function pauseAnimation(animations){
	for(var i=0; i < animations.length; i++){
		document.getElementById(animations[i]).style.animationPlayState = 'paused';
		document.getElementById(animations[i]).style.WebkitAnimationPlayState = 'paused';
	}
}



function resumeAnimation(animations){
		for(var i=0; i < animations.length; i++){
		document.getElementById(animations[i]).style.animationPlayState = 'running';
		document.getElementById(animations[i]).style.WebkitAnimationPlayState = 'running';
		}
}

// after enabler initialized...
function enablerInitHandler() {
	// polite load...
	if (Enabler.isPageLoaded()) {
		pageLoadedHandler();
	}
	else {
		Enabler.addEventListener(studio.events.StudioEvent.PAGE_LOADED, pageLoadedHandler);
	}
}

// wait for enabler initialization...
window.onload = function() {
	if (Enabler.isInitialized()) {
		enablerInitHandler();
	}
	else {
		Enabler.addEventListener(studio.events.StudioEvent.INIT, enablerInitHandler);
	}
}
	// isi toggling			
var isiIsExpanded = false;
var expandIsi = function(){
	Enabler.counter('isiExpand');
	fadeIn("isi-container", "six");
	document.getElementById("bottom").style.zIndex = '-1';
	document.getElementById("bottom").style.animation = 'fade-up .5s forwards 0s 1';
	document.getElementById("bottom").style.WebkitAnimation = 'fade-up .5s forwards 0s 1';
	document.getElementById("bottom2").style.animation = 'fade-up .5s forwards 0s 1';
	document.getElementById("bottom2").style.WebkitAnimation = 'fade-up .5s forwards 0s 1';
	document.getElementById('bg-exit').className = 'expanded';
	document.getElementById('legal').removeEventListener('click',toggleIsi);
	document.getElementById('six').style.zIndex = "4";
	document.getElementById('seven').style.zIndex = "-1";
	if(animationDone == false){
		TweenLite.killTweensOf(expandIsi);
		pauseAnimation(activeAnimations);
		//fadeOut("seven")
		document.getElementById('bg').style.zIndex = "2";
		document.getElementById('six').style.zIndex = "5";
		}else{
			fadeOut("five","seven","seven_ul");
		}
	isiIsExpanded = true;
}
var toggleIsi = function(){
	hideScrollMore();
	if((window.getComputedStyle(document.getElementById('five')).getPropertyValue('opacity') == '1') || (window.getComputedStyle(document.getElementById('seven')).getPropertyValue('opacity') == '1')){
		animationDone = true;
	}
	if(isiIsExpanded) {
		Enabler.counter('isiCollapse');
		TweenLite.to('#legal',.250,{scrollTo:{y:0}});
		fadeOut('isi-container', 'six');
		document.getElementById("bottom").style.zIndex = '5';
		document.getElementById("bottom").style.animation = 'fade-down .5s forwards 0s 1';
		document.getElementById("bottom").style.WebkitAnimation = 'fade-down .5s forwards 0s 1';
		document.getElementById("bottom2").style.animation = 'fade-down .5s forwards 0s 1';
		document.getElementById("bottom2").style.WebkitAnimation = 'fade-down .5s forwards 0s 1';
		document.getElementById('six').style.zIndex = "-1";	
		document.getElementById('bg-exit').className = '';
		document.getElementById('legal').scrollTop = 0;
		document.getElementById('legal').addEventListener('click',toggleIsi);
		if(animationDone == false){
			resumeAnimation(activeAnimations);
			document.getElementById('bg').style.zIndex = "0";
		}else{
			fadeIn("seven");
			document.getElementById('seven').style.zIndex = 5;
			document.getElementById('seven_ul').style.zIndex = 4;
		}
		isiIsExpanded = false;
	} else {
		expandIsi();
		isiIsExpanded = true;
	}
};

	// "Scroll for More" button
var showScrollMore = function(event){
	setTimeout(function(){
		if(isiIsExpanded && !interruptScroll){
			document.getElementById('scroll-more').style.opacity = "1";
			document.getElementById('scroll-more').style.zIndex = "4";
			}},100);
}
var hideScrollMore = function (){
	//TweenLite.killTweensOf(document.getElementById('legal'));
	document.getElementById('scroll-more').style.opacity = "0";
	document.getElementById('scroll-more').style.zIndex = "-1";
}