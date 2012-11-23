var _ = {
    includes: function(arr, e) {
        for (var i=0, l = arr.length; i < l; i++) {
            if (arr[i] === e) return true;
        }
        return false;
    }
}

var A_KEY = 65,
    B_KEY = 66,
    UNDO_KEY = 85;

function Comparison(a, b) {
    this.a = a;
    this.b = b;
    this.result = undefined;
}

Comparison.prototype.includes = function(item) {
    return this.a === item || this.b === item;
}

$(document).ready(function() {
    $(document).bind('keyup', function(e) {
        if ($('#ranker').css('display') === 'none') return true;

        switch(e.keyCode) {
            case A_KEY:
                $('#a_action').trigger('click');
                break;
            case B_KEY:
                $('#b_action').trigger('click');
                break;
            case UNDO_KEY:
                if($('#undo').css('display') !== 'none') $('#undo').trigger('click');
                break;
        }
    });

    $('#a_action').bind('click', function(e) {
        alert('howdy');
    });

    // prioritize button
    $('#rank_action').bind('click', function(e) {
        $('#ranker').show();
        $('#ranked').show();
        $('#rank_action').hide();
    });
});

