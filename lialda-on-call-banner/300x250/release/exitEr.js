/**	SYNTAX
	Both functions require an array of js objects:
		selector:String - the queryselector
		listener:String - the event listener
		on:function - executes when fired
**/

var exitEr = {

	applyExits : function(exitArgs){
		
		//var exits = (exitArgs !== 'undefined') ? exitArgs : arguments;
		var exits = exitArgs;

			// apply exits			
		for(var i = 0; i < exits.length; i++){
			var selected = document.querySelectorAll(exits[i].selector);
			for(var j = 0; j < selected.length; j++){
				selected[j].addEventListener(
					exits[i].listener,
					(	function(i){
							return function() {
								if(exits.on !== 'undefined'){
									exits[i].on();
								}
							};
						}
					)(i),
					false
				);
			}
		}
	}
};