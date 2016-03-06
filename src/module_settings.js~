$(document).on('change','#ph',function(){
	settings_valid_ph();
});
function settings_valid_ph(){
	var ph=$('#ph').val();
	ph=ph.replace(new RegExp('-','g'),'');
	if(ph.length<10){
		$('.feedback').html('oops, can I have more numbers please?');
		$('.feedback').removeClass('good');
		$('.feedback').addClass('bad');	
		return;
	}
	if(!(/^-?[\d.]+(?:e-?\d+)?$/.test(ph))){
		$('.feedback').html('is this a number?');
		$('.feedback').removeClass('good');
		$('.feedback').addClass('bad');	
		return;
	}
	$('.feedback').html('looks ok');
	$('.feedback').removeClass('bad');
	$('.feedback').addClass('good');	
}
function settings_submit(){
	if($('.feedback').hasClass('good')){
		var ph=$('#ph').val();
		var carrier=$('#carrier').val();
		ph=ph.replace(new RegExp('-','g'),'');
console.log(carrier);
		var settingsbus=new Bus();
		settingsbus.load('request','notify');
		settingsbus.load('ph',ph);
		settingsbus.load('uid',GLOBAL['uid']);
		settingsbus.load('carrier',carrier);
		settingsbus.load('callback','settings_confirm');
		settingsbus.depart();
	}
}
function settings_confirm(data){
	$('.feedback').html(data);
}
