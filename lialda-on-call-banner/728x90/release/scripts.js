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
	dupLegalScroll.update();
	
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
		.set('#isi-container',{y:90})
		.fromTo('#isi-duplicate',.3,{autoAlpha:1,y:90},{y:0},'f0')
		.fromTo('#tophalf,#oncall',.3,{autoAlpha:1,y:-90},{y:0},'f0')
			// isi
		.call(function(){expandIsi();beginAutoScroll();},null,null,'isi')
		.to('#oncall',.25,{autoAlpha:0,x:-100},'res')
			// f1
		.fromTo('#f1',.5,{opacity:1,x:728},{x:30},'f1')
		.to('#f1',.5,{opacity:0},'f5-=0.5','f3-=.5')
		.fromTo('#f2',.5,{opacity:1,x:728},{x:30},'f1')
		.to('#f2',.5,{x:-100,opacity:0},'f3-=0.5')
			// f3
		.fromTo('#f3',.5,{autoAlpha:1,x:728},{x:30},'f3')
		.to('#f3',.25,{x:-100,autoAlpha:0},'f4-=0.25')
			// f4
		.fromTo('#f4',.5,{autoAlpha:1,x:728},{x:30},'f4')
		.to('#f4',.25,{x:-100,autoAlpha:0},'f5-=0.25')
			// f5
		.fromTo('#f5',.5,{autoAlpha:1,x:728,immediateRender:false},{x:0},'f5')
		.fromTo('#learn_more',.5,{autoAlpha:1,x:-200,immediateRender:false},{autoAlpha:1,x:0},'f5')
	;

	document.getElementById('duplicate-legal').addEventListener('click',toggleIsi);
	document.getElementById('learn_more').addEventListener('mouseover',ctaExt);
	document.getElementById('learn_more').addEventListener('mouseover',ctaExt);
	document.getElementById('learn_more').addEventListener('mouseout',ctaRet);	
}
// after page loaded...
function pageLoadedHandler() {
	document.getElementById('isi-header').addEventListener('click',toggleIsi);
	document.getElementById('isi-duplicate-header').addEventListener('click',toggleIsi);

	if (Enabler.isVisible()) {
		adVisibilityHandler();
	}
	else {
		Enabler.addEventListener(studio.events.StudioEvent.VISIBLE, adVisibilityHandler);
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
						
	legalScroll  = tinyscrollbar(
		document.getElementById('legal')
		,	{
				axis:'y',
				trackSize:72,
				thumbSize:16,
				arrows:true,
				autoWrap:true
			}
		);			
	dupLegalScroll  = tinyscrollbar(
		document.getElementById('duplicate-legal')
		,	{
				axis:'y',
				trackSize:73,
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

	// CTA button
	
function ctaExt(){
	TweenLite.to('#overlay-end',.5,{x:90});
}
function ctaRet(){
	TweenLite.to('#overlay-end',.5,{x:0});
}

	// isi toggling			
var isiIsExpanded = false;

var expandIsi = function(){
	animationTimeline.pause();
	TweenLite.to('#isi-container',.5,{y:0});
	
	//var t0 = +new Date();
	
	//setTimeout(function(){
		//alert((+new Date()) - t0);
		legalScroll.update();
		//var t1 = +new Date();
		//setTimeout(function(){
			//alert((+new Date()) - t1);
		//},0);
	//},1000);
	
	isiIsExpanded = true;
}

var collapseIsi = function(){
	animationTimeline.play();
	TweenLite.to('#isi-container',.5,{y:90});
	dupLegalScroll.update();
	legalScroll.autoKill();
	isiIsExpanded = false;
}

var toggleIsi = function(){
	isiIsExpanded ? collapseIsi() : expandIsi();
};

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

	// "Scroll for More" button
var showScrollMore = function(event){
	document.getElementById('scroll-more').className = 'visible';
}
var hideScrollMore = function (){
	document.getElementById('scroll-more').className = '';
}