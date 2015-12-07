	console.log( "duration:"+tl.duration() );

	var keyFrames = new Array();
	var nextKeyframeCounter = 0;

	var jqxhr = $.ajax({

			url: "controls/handler.php",
			data: { action: "retrieve" }
		})
	  .done(function( data ) {
		console.log( "data:" + data );
		if ( $.parseJSON(data) != "empty" ) {
			keyFrames = $.parseJSON(data);
			console.dir(data);
			setUpKeyframes();
		}
	  })
	  .fail(function() {
		//alert( "error" );
	  })
	  .always(function() {
		//alert( "complete" );
	  });

	/* Player Controls for Editing */
	$(document).on('click touchstart', '#play' , function(e) {
		e.preventDefault();
	  //play() only plays forward from current position. If timeline has finished, play() has nowhere to go.
	  //if the timeline is not done then play() or else restart() (restart always restarts from the beginning).

	  if(tl.progress() != 1){
	    //carl just changed this again
			tl.play();
	  } else {
	    tl.restart();
	  }
	});

	$(document).on('click touchstart', '#pause' , function(e) {
		e.preventDefault();
		tl.pause();
	});

	$(document).on('click touchstart', '#reverse' , function(e) {
		e.preventDefault();	
		tl.reverse();
	});

	$(document).on('click touchstart', '#restart' , function(e) {
		e.preventDefault();		
		tl.restart();
	});

	$("#slider").slider({
	  range: false,
	  min: 0,
	  max: 100,
	  step:.1,
	  slide: function ( event, ui ) {
	    tl.pause();
	    //adjust the timeline's progress() based on slider value
	    tl.progress( ui.value/100 );

	   }


	});

	$(document).on('click touchstart', '#burger' , function(e) {
		e.preventDefault();
		tl.stop();
		$('#myModal').html('');

		var hamburgerMenu = '<div class="hamburger-controls"><div><div id="myContent">';
		hamburgerMenu += '<button id="showISI">Show ISI</button><br />';
		hamburgerMenu += '<button id="captureScreen">Capture ISI</button><br />';
		hamburgerMenu += '<button id="getSlides">Capture Slides</button><br />';
		hamburgerMenu += '<button id="saveKeyframes">Save Keyframes</button>';
		hamburgerMenu += '<textarea class="textbox" id="keyframeValues"></textarea>';
		hamburgerMenu += '<button id="applyKeyframes">Apply</button>';
		hamburgerMenu += '</div></div></div>';

		$(hamburgerMenu).appendTo('#myModal');

		$('#keyframeValues').val(keyFrames);

		showSlides();
	});

	$(document).on('click touchstart', '#applyKeyframes' , function() {
		var tempArry = $('#keyframeValues').val().split(",");
		keyFrames = [];

		for(var i=0; i<tempArry.length; i++) { keyFrames[i] = tempArry[i]; }

		setUpKeyframes();
	});


	$(document).on('click touchstart', '.keyframeRemove' , function() {
		var arrayLoc = keyFrames.indexOf( Number( $(this).data("attrib") ) );

		if ( arrayLoc > -1 ) {
			keyFrames.splice( arrayLoc, 1);
			keyFrames.sort(function(a,b){return a-b});
		}

		$(this).remove();


	});

	function setUpKeyframes() {

		$('.keyframeRemove').empty();

		for (var i=0; i < keyFrames.length; i++) {
			console.log(keyFrames[i]);

			$('<div class="keyframeRemove" data-attrib="'+$("#slider").slider("option", "value")+'" id="keyframe'+i+'" style="position:absolute;width:21px;height:33px;top:-1px;left:'+keyFrames[i]+'%; margin-left:-10px;"><img src="controls/images/marker.png" /></div>').appendTo("#keyframes");
		}
	}

	$(document).on('click touchstart', '#addKeyframe' , function(e) {
		e.preventDefault();	
		//console.log( $("#slider").slider("option", "value") + ' : ' + tl.progress()*100);

		keyFrames.push($("#slider").slider("option", "value"));
		keyFrames.sort(function(a,b){return a-b});

		$('<div class="keyframeRemove" data-attrib="'+$("#slider").slider("option", "value")+'" id="keyframe'+keyFrames.length+'" style="position:absolute;width:21px;height:33px;top:-1px;left:'+$("#slider").slider("option", "value")+'%;margin-left:-10px;"><img src="controls/images/marker.png" /></div>').appendTo("#keyframes");
	});



	function updateSlider() {
	  $("#slider").slider("value", tl.progress() *100);
	}

	$(document).on('click touchstart', '#nextKeyframe' , function(e) {
		e.preventDefault();
		tl.stop();

		if ( nextKeyframeCounter == keyFrames.length ) {
			nextKeyframeCounter = 0;
		}

		if ( nextKeyframeCounter < keyFrames.length ) {
			tl.time( keyFrames[nextKeyframeCounter] );
			$("#slider").slider("value", keyFrames[nextKeyframeCounter]);
		}

		nextKeyframeCounter++;

	});


	$(document).on('click touchstart', '#getSlides' , function() {
		$('#myModal').trigger('reveal:close');

		$('#myModal').html('');
		$('<div id="myContent"></div>').prependTo('body');
		if ( keyFrames.length > 0 ) {
			getSlide( -1 );
		}
	});

	function getSlide( frames ) {
		frames++;
		if ( frames < keyFrames.length ) {
			tl.time( keyFrames[frames] );
			$("#slider").slider("value", keyFrames[frames]);

			html2canvas($('#gsk_content_dc'), {
			    onrendered: function(canvas){
			        var imgString = canvas.toDataURL('image/png');
			        var html = '<img src="' + imgString + '" style="width: auto;height: auto;margin-left:10px;" />';

			        $(html).appendTo('#myContent');

	        		getSlide( frames );
			    }
			});
		}

		if ( frames == keyFrames.length ) {
			html2canvas($('#myContent'), {
			    onrendered: function(canvas){
			        var imgString = canvas.toDataURL('image/png');
			        var html = '<img src="' + imgString + '" style="width: 100%;height: auto;" />';

			        $('#myModal').html('');
			        $('#myContent').empty();

			        $(html).appendTo('#myModal');

	        		showSlides();
			    }
			});

		}
	}


	function showSlides() {
			$('<a class="close-reveal-modal">&#215;</a>').appendTo('#myModal');
			$('#myModal').reveal({
			     animation: 'fadeAndPop',
			     animationspeed: 300,
			     closeonbackgroundclick: true,
			     dismissmodalclass: 'close-reveal-modal'
			});
		}





	$(document).on('click', '#showISI' , function() {
		$('#myModal').trigger('reveal:close');

		$("#gsk_content_dc").children().css({opacity:0});
		$("#isi").css({zIndex:9000, opacity: "1", maxHeight: "none"});

		$("#gsk_content_dc").css({overflow: "visible", height: "auto"});

		$("#bottom").css({display: "block",  bottom: "auto", opacity: "1", height: "auto", overflow: "visible", background: "#ffffff", border: "1px solid #000000"});
		$("#isi").css({display: "block",  bottom: "auto", opacity: "1", height: "auto", overflow: "visible", background: "#ffffff"});	
		$("#cta1").css({opacity:0,display:'none'});
	});

	$(document).on('click', '#captureScreen' , function(e) {
		e.preventDefault();
		$('#myModal').trigger('reveal:close');
		$('#myModal').children().remove();

		$("#gsk_content_dc").children().css({opacity:0});
		$("#isi").css({zIndex:9000, opacity: "1", maxHeight: "none"});

		$("#gsk_content_dc").css({overflow: "visible", height: "auto"});

		$("#isi").css({display: "block",  bottom: "auto", opacity: "1", height: "auto", overflow: "visible", background: "#ffffff", border: "1px solid #000000"});


		var html ="";

		html2canvas($('#isi'), {
		    onrendered: function(canvas){
		        var imgString = canvas.toDataURL('image/png');
		        html = '<img src="' + imgString + '" style="width: auto;height: auto;float: left;" />';

				makeModal( html );

		    }
		});


	});

	$(document).on('click', '#saveKeyframes' , function(e) {
		$('#myModal').html('');

		var jqxhr = $.ajax({
				dataType: "json",
				url: "controls/handler.php",
				data: { action: "save", keyframes: keyFrames }
			})
		  .done(function( data ) {
			$('#myModal').html('Save Successful.');
		  })
		  .fail(function( error ) {
			$('#myModal').html('<strong>A Failure Occured.</strong><br />' + error);
		  })
		  .always(function() {

		  });
	});


	function makeModal( imgString ) {
		$('<a class="close-reveal-modal">&#215;</a>').appendTo('#myModal');
        $(imgString).appendTo('#myModal');

		$('#myModal').reveal({
		     animation: 'fadeAndPop',                   //fade, fadeAndPop, none
		     animationspeed: 300,                       //how fast animtions are
		     closeonbackgroundclick: true,              //if you click background will modal close?
		     dismissmodalclass: 'close-reveal-modal'    //the class of a button or element that will close an open modal
		});
	}

});