$(function() {
    $('#mesUno').change(function() {
        sessionStorage.setItem('mesUno', this.value);
    });
    if(sessionStorage.getItem('mesUno')){
        $('#mesUno').val(sessionStorage.getItem('mesUno'));
    }

    $('#mesDos').change(function() {
        sessionStorage.setItem('mesDos', this.value);
    });
    if(sessionStorage.getItem('mesDos')){
        $('#mesDos').val(sessionStorage.getItem('mesDos'));
    }

    $('#yearUno').change(function() {
        sessionStorage.setItem('yearUno', this.value);
    });
    if(sessionStorage.getItem('yearUno')){
        $('#yearUno').val(sessionStorage.getItem('yearUno'));
    }

    $('#yearDos').change(function() {
        sessionStorage.setItem('yearDos', this.value);
    });
    if(sessionStorage.getItem('yearDos')){
        $('#yearDos').val(sessionStorage.getItem('yearDos'));
    }

    $('#multiple').change(function() {
      var selected = [];
        $('#multiple option').each(function() {
          if (this.selected) {
            selected.push(this.value);
          }
        });
        sessionStorage.setItem('multiple', JSON.stringify(selected));
    });
    var stored_motivations = JSON.parse(sessionStorage.getItem('multiple'));
    $('#multiple').val(stored_motivations);

});