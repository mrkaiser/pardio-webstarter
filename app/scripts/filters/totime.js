/**
* partybox Module
*
* Description
*/
angular.module('partybox', []).filter('totime',function(){
	return function(input){
		var mins = input/60000;
		var seconds = Math.floor((mins *10 % 10 /10) * 60));
		mins = Math.floor(mins);
		var ret = (mins+":"+seconds).toString();
	}
});