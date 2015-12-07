var animationTimeline;

function bgExitHandler() {
	Enabler.exit('bgExit');
}
function ctaExitHandler() {
	Enabler.exit('ctaExit','http://www.lialda.com/hcp/support-resources.aspx');
}
function fpiExitHandler() {
	Enabler.exit('fpiExit','http://www.lialda.com/hcp/lialda-prescribing-information.aspx');
}

// after ad is visible...
function adVisibilityHandler() {
	document.body.style.display = 'block';
	legalScroll.update();
	
	exitEr.applyExits([
		{	selector:'#exit-handler',
			listener:'click',
			on:bgExitHandler
		},
		{	selector:'.ctaLink',
			listener:'click',
			on:ctaExitHandler
		},
		{	selector:'.fpiLink',
			listener:'click',
			on:fpiExitHandler
		}
	]);

	navigator.sayswho = function(){
		var ua= navigator.userAgent, tem,
		M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
		if(/trident/i.test(M[1])){
			tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
		}
		if(M[1]=== 'Chrome'){
			tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
			if(tem!= null) console.log(tem.slice(1).join(' ').replace('OPR', 'Opera'));
		}
		M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
		if(M[0]=== 'Safari'){
			document.getElementById('isi-header').childNodes[1].style.fontSize = '11px';
			document.getElementById('isi-header').childNodes[1].style.letterSpacing = '-0.65px';
		}
	};
	
		// ANIMATIONS
		
	animationTimeline = new TimelineLite({delay:.5});
	animationTimeline
			// frames
		.add('f0',0)
		.add('isi','f0+=2.5')
		.add('res','isi+=.75')
		.add('f1','res+=.25')
		.add('f3','f1+=3')
		.add('f4','f3+=3')
		.add('f5','f4+=3')
		
			// f0
		.fromTo('#isi-container',.3,{autoAlpha:1,y:250},{y:0},'f0')
		.fromTo('#tophalf',.3,{autoAlpha:1,y:-450},{y:0},'f0')
		.fromTo('#oncall',.3,{autoAlpha:1,y:-450},{y:0},'f0')
			// isi
		.call(function(){expandIsi();beginAutoScroll();},null,null,'isi')
		.to('#oncall',.25,{autoAlpha:0,x:-100},'res')
			// f1
		.fromTo('#f1',.5,{autoAlpha:1,x:400},{x:30},'f1')
		.to('#f1',.5,{autoAlpha:0},'f5-=0.5','f3-=.5')
		.fromTo('#f2',.5,{autoAlpha:1,x:400},{x:30},'f1')
		.to('#f2',.5,{x:-100,autoAlpha:0},'f3-=0.5')
			// f3
		.fromTo('#f3',.5,{autoAlpha:1,x:400},{x:30},'f3')
		.to('#f3',.5,{x:-100,autoAlpha:0},'f4-=0.5')
			// f4
		.fromTo('#f4',.5,{autoAlpha:1,x:400},{x:30},'f4')
		.to('#f4',.5,{x:-100,autoAlpha:0},'f5-=0.5')
			// f5
		.fromTo('#f5',.5,{autoAlpha:1,x:400},{x:10},'f5')
		.fromTo('#learn_more',.5,{autoAlpha:1,x:400},{x:10},'f5')
	;
	
		// toggle isi listeners (see header script)
	document.getElementById('isi-header').addEventListener('click',toggleIsi);
	document.getElementById('legal').addEventListener('click',toggleIsi);
	document.getElementById('learn_more').addEventListener('mouseover',ctaExt);
	document.getElementById('learn_more').addEventListener('mouseout',ctaRet);
		// ***	
}

function ctaExt(){
	TweenLite.to('#overlay-end',.5,{x:90});
}

function ctaRet(){
	TweenLite.to('#overlay-end',.5,{x:0});
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

	// Auto-scrolling

function beginAutoScroll() {
	
	var allowCollapse = true;
	
	var disableCollapse = function(){
		allowCollapse = false;
	}
	
	var conditionalCollapse = function(){
		allowCollapse? collapseIsi() : void(0);
	}
	
	setTimeout(function(){
		legalScroll.autoScroll({
			from:0,
			to:document.getElementById('stop'),
			t:15,
			onAutoKill:disableCollapse,
			onComplete:function(){
				setTimeout(conditionalCollapse,1000);
			}
		});
	},500);
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
						
	legalScroll  = tinyscrollbar(
		document.getElementById('legal')
		,	{
				axis:'y',
				trackSize:70,
				thumbSize:16,
				arrows:true,
				autoWrap:true
			}
		);
					
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
	document.getElementById('bg-exit').className = 'expanded';
	document.getElementById('legal').removeEventListener('click',toggleIsi);
	animationTimeline.pause();
	legalScroll.set({trackSize:235});
	isiIsExpanded = true;
}
var collapseIsi = function(){
	document.getElementById('bg-exit').className = '';
	document.getElementById('legal').addEventListener('click',toggleIsi);
	animationTimeline.play();
	legalScroll.set({trackSize:70}).autoKill();
	isiIsExpanded = false;
}
var toggleIsi = function(){
	isiIsExpanded? collapseIsi() : expandIsi();
};

	// "Scroll for More" button
var showScrollMore = function(event){
	document.getElementById('scroll-more').className = 'visible';
}
var hideScrollMore = function (){
	document.getElementById('scroll-more').className = '';
}