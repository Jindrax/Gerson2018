var fs = require('fs');
var csv = require("fast-csv");

function conservar() {
    var colombia = JSON.parse(fs.readFileSync('conservados.json'));
    var depts = ['BOYACA', 'CALDAS', 'CUNDINAMARCA'];
    var muns = ['LA DORADA', 'PUERTO BOYACA', 'FUSAGASUGA', 'FACATATIVA', 'MADRID', 'TOCAIMA', 'LA MESA', 'VIOTA'];
    var municipios = colombia.objects.mpios.geometries;
    var conservados = [];
    municipios.forEach(function (current) {
        var dpt = current.properties.dpt;
        if (depts.indexOf(dpt) != -1) {
            var mun = current.properties.name;
            if (muns.indexOf(mun) != -1) {
                conservados.push(current);
            }
        } else {
            conservados.push(current);
        }
    });
    colombia.objects.mpios.geometries = conservados;
    fs.writeFileSync('conservados2.json', JSON.stringify(colombia));
}

function getCities() {
    var colombia = JSON.parse(fs.readFileSync('conservados2.json'));
    var municipios = colombia.objects.mpios.geometries;
    var muns = [];
    municipios.forEach(function (current) {
        muns.push(current.properties.name);
    });
    muns.sort();
    res = '';
    muns.forEach(function (current) {
        res = res.concat(current + '\n');
    });
    fs.writeFileSync('municipios.txt', res);
}

function csvJSON() {
    var colombia = JSON.parse(fs.readFileSync('conservados2.json'));
    var munsData = {};
    csv
        .fromPath("data.csv", { headers: true, delimiter: ';' })
        .on("data", function (data) {
            munsData[data.name] = data;
        })
        .on("end", function () {
            var municipios = colombia.objects.mpios.geometries;
            municipios.forEach(function (current) {
                var munName = current.properties.name;
                var munObj = munsData[munName];
                munObj.dpt = current.properties.dpt;
                current.properties = munObj;
            });
            fs.writeFileSync('consolidado.json', JSON.stringify(colombia));
        });
}

csvJSON();