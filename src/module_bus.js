/* ********************* GLOBALS ********************* *\
	Bus 	bus
\* *************************************************** */

function Bus(){
	this.pairs=[];
	this.add=function(type,data){
		this.pairs.push({key:type,value:data});
	}
	this.hasPair=function(key){
		if(this.pairs.length==0) return -1;
		for(var i=0;i<this.pairs.length;++i){
			if(this.pairs[i].key==key){
				return i;
			}
		}
		return -1;
	}
	this.load=function(type,data){
		if((id=this.hasPair(type))>=0){ 
			this.pairs[id].value=data;
		}else{
			this.add(type,data);
		}
	}
	this.depart=function(){
		var encoded=JSON.stringify(this.pairs);
		$.post('server/ajax.php',
			{bus:encoded},
			function(data,status){
				if(status=='success'){
					data=data.split('+');
					if(data[0]!=''){
						window[data[0]](data[1]);
					}
				}else{
					console.log(status+': '+data);
				}
			});
	}
	return this;
}
//request bus
function bus_depart(){
	var bus=GLOBAL['bus'];
	var encoded=JSON.stringify(bus);

	$.post('server/ajax.php',
		{bus:encoded},
		function(data,status){
			if(status=='success'){
				bus_unpack(data);
			}
		});
	bus_init();
}
function bus_unpack(data){
	data=data.split('+');
	switch(data[0]){
		case 'chatinit':	chat_load_bulk(JSON.parse(data[1]));
	}
}
function bus_init(){
	GLOBAL['bus']=new Bus();
	GLOBAL['bus'].add('uid',GLOBAL['uid'],false);
}
