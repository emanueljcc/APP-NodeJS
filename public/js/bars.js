$(function($){
	var query = !{query};
	newObj = function(Obj,key,val){
	    if(Obj[key]){
	        Obj[key][Obj[key].length] = val;
	    }else{
	        Obj[key] = [val];
	    }
	}
	var meses=['Ene','Feb','Mar','Abr', 'May','Jun','Jul','Ago','Sep', 'Oct','Nov','Dic'];
	var series={}
	var brut_salario=[]
	var mes=[]
	seriesPush=[]

	for(row in query){
		var mes2=meses[parseInt(query[row].mes)-1];
		if(mes.indexOf(mes2)==-1){
			var brut_s=parseFloat(query[row].brut_salario)
			brut_salario.push(brut_s);
			mes.push(mes2)
		}
		newObj(series,query[row].co_usuario,query[row].liquida)
	}
	//console.log(brut_salario);
	for(var valor in series){
		seriesPush.push({type:'column',name:valor,data:series[valor]})
	}
	seriesPush.push(  {type: 'spline',name: 'Costo Fijo Medio',data: brut_salario,marker: {lineWidth: 2,lineColor: Highcharts.getOptions().colors[3],fillColor: 'white'} })
	Highcharts.chart('grafica', {
        title: {
            text: 'Grafica de Consultores Agence'
        },
        tooltip: {
		  valueDecimals: 2
		},
        xAxis: {
            categories: mes
        },
        series: seriesPush
    });
});