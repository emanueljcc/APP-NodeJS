var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cons = require('consolidate');
var pug = require('pug');
var pg = require('pg');
var app = express();

var conexion = new pg.Client();
/******Conexion base de datos PRODUCCION******/
var config = {
  user: 'vozxyzhccjhauc', 
  database: 'dd1nuv5leev1di', 
  password: '80706800c2771894ac9f6bf510276366d55a52330b951cc84491b986e75d13b6', 
  host: 'ec2-107-21-248-129.compute-1.amazonaws.com',
  port: 5432,
  max: 10, 
  idleTimeoutMillis: 30000, 
};
/******Conexion base de datos LOCALHOST******/
/*var config = {
  user: 'postgres', 
  database: 'agence', 
  password: 'root', 
  host: 'localhost',
  port: 5433,
  max: 10, 
  idleTimeoutMillis: 30000, 
};*/
var pool = new pg.Pool(config);

/*Definiendo el template*/
app.engine('pug', cons.pug);
app.set('view engine', 'pug');
/*Definiendo el puerto*/
var port = process.env.PORT || 3000
/*Definiendo ruta de las vistas pug*/
app.set('views', __dirname + '/views');
/*Definiendo el ruta de archivos publicos*/
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
var meses = [
    {"mes" : "Ene", "val" : 1},
    {"mes" : "Feb", "val" : 2},
    {"mes" : "Mar", "val" : 3},
    {"mes" : "Abr", "val" : 4},
    {"mes" : "May", "val" : 5},
    {"mes" : "Jun", "val" : 6},
    {"mes" : "Jul", "val" : 7},
    {"mes" : "Ago", "val" : 8},
    {"mes" : "Sep", "val" : 9},
    {"mes" : "Oct", "val" : 10},
    {"mes" : "Nov", "val" : 11},
    {"mes" : "Dic", "val" : 12},
];
//yearUno-yearDos
var anios = [];
for (i = 2003; i < 2008; i++) {
	anios.push({"anio": i});
};

/*Rutas*/
app.get('/', function(req, res){
	pool.connect(function(err, conexion, done) {
	  if(err) {
	    return console.error('Error en la consulta', err);
	  }
	  conexion.query("SELECT b.no_usuario,b.co_usuario FROM permissao_sistema a INNER JOIN cao_usuario b on a.co_usuario = b.co_usuario WHERE (a.co_sistema = 1 AND a.in_ativo = 'S') AND a.co_tipo_usuario in (0, 1, 2) ORDER BY a.co_usuario ASC", function(err, result) {
	    if(err) {
	      return console.error('error ejecutando la consulta', err);
	    }
	    res.render('index',{consultores: result.rows, meses: meses, anios: anios})
	    done();
	  })
	});

	pool.on('error', function (err, conexion) {
	  console.error('conexion error', err.message, err.stack)
	})
});
app.post('/consulta',function(req,res){
	var mesUno = req.body.mesUno;
	var mesDos = req.body.mesDos;
	var yearUno = req.body.yearUno;
	var yearDos = req.body.yearDos;
	var select_cons = req.body.select_cons;
	pool.connect(function(err,conexion,done) {
		if(Array.isArray(select_cons))
			var problem_one = "b.co_usuario = ANY($5::text[])";
		else
			var problem_one = "b.co_usuario = ($5)";
		if(req.body.relatorio){
			if (err) {
				return console.error('Error en la consulta', err);
			}
			conexion.query("SELECT c.brut_salario, d.co_usuario, d.no_usuario, date_part('month', data_emissao) AS mes, date_part('year', data_emissao) AS year, sum(a.valor - ((a.valor * a.total_imp_inc)) / 100) as liquida, sum((a.valor - ((a.valor * a.total_imp_inc)) / 100) * (a.comissao_cn / 100)) as comision, sum(a.valor - ((a.valor * a.total_imp_inc)) / 100) - (c.brut_salario+sum((a.valor - ((a.valor * a.total_imp_inc)) / 100) * (a.comissao_cn / 100))) as lucro FROM cao_fatura a INNER JOIN cao_os b ON b.co_os = a.co_os INNER JOIN cao_salario c ON c.co_usuario = b.co_usuario RIGHT JOIN cao_usuario d ON d.co_usuario = b.co_usuario WHERE "+problem_one+" AND EXTRACT(month FROM data_emissao) BETWEEN $1 AND $2 AND EXTRACT(year FROM data_emissao) BETWEEN $3 AND $4 GROUP BY c.brut_salario, d.co_usuario, d.no_usuario, b.co_usuario, mes, year ORDER BY mes ASC",[mesUno,mesDos,yearUno,yearDos,select_cons],function(err,result) {
				conexion.query("SELECT d.co_usuario FROM cao_fatura a INNER JOIN cao_os b ON b.co_os = a.co_os INNER JOIN cao_salario c ON c.co_usuario = b.co_usuario INNER JOIN cao_usuario d ON d.co_usuario = b.co_usuario WHERE "+problem_one+" AND EXTRACT(month FROM data_emissao) BETWEEN $1 AND $2 AND EXTRACT(year FROM data_emissao) BETWEEN $3 AND $4 GROUP BY d.co_usuario ORDER BY d.co_usuario ASC",[mesUno,mesDos,yearUno,yearDos,select_cons],function(err, resultado){
					conexion.query("SELECT b.no_usuario,b.co_usuario FROM permissao_sistema a INNER JOIN cao_usuario b on a.co_usuario = b.co_usuario WHERE (a.co_sistema = 1 AND a.in_ativo = 'S') AND a.co_tipo_usuario in (0, 1, 2) ORDER BY a.co_usuario ASC", function(err, resultado2) {
						if (err) {
							console.error('error ejecutando la consulta', err);
						}
						res.render('consultas/relatorio',{query: result.rows,query2: resultado.rows,consultores: resultado2.rows});
						done();
						});
					});
			});
		}else if(req.body.grafico){
			conexion.query("SELECT c.brut_salario, d.co_usuario, d.no_usuario, date_part('month',data_emissao) AS mes, date_part('year',data_emissao) AS year, sum(a.valor - ((a.valor * a.total_imp_inc)) / 100) AS liquida FROM cao_fatura a INNER JOIN cao_os b ON b.co_os = a.co_os INNER JOIN cao_salario c ON c.co_usuario = b.co_usuario RIGHT JOIN cao_usuario d ON d.co_usuario = b.co_usuario WHERE "+problem_one+" AND EXTRACT(month FROM data_emissao) BETWEEN $1 AND $2 AND EXTRACT(year FROM data_emissao) BETWEEN $3 AND $4 GROUP BY c.brut_salario,d.co_usuario,b.co_usuario,d.no_usuario, mes,year ORDER BY mes ASC",[mesUno,mesDos,yearUno,yearDos,select_cons],function(err,result) {
				conexion.query("SELECT d.co_usuario FROM cao_fatura a INNER JOIN cao_os b ON b.co_os = a.co_os INNER JOIN cao_salario c ON c.co_usuario = b.co_usuario INNER JOIN cao_usuario d ON d.co_usuario = b.co_usuario WHERE "+problem_one+" AND EXTRACT(month FROM data_emissao) BETWEEN $1 AND $2 AND EXTRACT(year FROM data_emissao) BETWEEN $3 AND $4 GROUP BY d.co_usuario ORDER BY d.co_usuario ASC",[mesUno,mesDos,yearUno,yearDos,select_cons],function(err, resultado){
					conexion.query("SELECT b.no_usuario,b.co_usuario FROM permissao_sistema a INNER JOIN cao_usuario b on a.co_usuario = b.co_usuario WHERE (a.co_sistema = 1 AND a.in_ativo = 'S') AND a.co_tipo_usuario in (0, 1, 2) ORDER BY a.co_usuario ASC", function(err, resultado2) {
						if (err) {
							console.error('error ejecutando la consulta', err);
						}
						res.render('consultas/grafico',{query: JSON.stringify(result.rows),query_each: resultado.rows,query2: JSON.stringify(resultado.rows),consultores: resultado2.rows});
						done();
					});
				});
			});
		}else if(req.body.pizza){
			conexion.query("SELECT d.co_usuario, sum(a.valor - ((a.valor * a.total_imp_inc)) / 100) AS liquida FROM cao_fatura a INNER JOIN cao_os b ON b.co_os = a.co_os INNER JOIN cao_salario c ON c.co_usuario = b.co_usuario RIGHT JOIN cao_usuario d ON d.co_usuario = b.co_usuario WHERE "+problem_one+" AND EXTRACT(month FROM data_emissao) BETWEEN $1 AND $2 AND EXTRACT(year FROM data_emissao) BETWEEN $3 AND $4  GROUP BY d.co_usuario,b.co_usuario",[mesUno,mesDos,yearUno,yearDos,select_cons],function(err,result) {
				conexion.query("SELECT b.no_usuario,b.co_usuario FROM permissao_sistema a INNER JOIN cao_usuario b on a.co_usuario = b.co_usuario WHERE (a.co_sistema = 1 AND a.in_ativo = 'S') AND a.co_tipo_usuario in (0, 1, 2) ORDER BY a.co_usuario ASC", function(err, resultado) {
					if (err) {
						console.error('error ejecutando la consulta', err);
					}
					res.render('consultas/pizza',{query: result.rows,consultores: resultado.rows});
					done();
				});
			});
		}
	});
});
/*Rutas*/

// server
app.listen(process.env.PORT || 3000, function(){
  console.log("App iniciada...", this.address().port, app.settings.env);
});