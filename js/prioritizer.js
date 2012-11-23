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
    UNDO_KEY = 85,
    ranker;

function Comparison(a, b, selection) {
    this.a = a;
    this.b = b;
    this.result = selection;
}

Comparison.prototype.includes = function(item) {
    return this.a === item || this.b === item;
}

function Ranker(items) {
    this.items = items;
    this.ranked = [];
    this.comparisons = [];
    this.highest = 0;
    this.current = 1;
    this.length = items.length;
    $('#ranker').show();
}

Ranker.prototype.findComparison = function(a, b) {
    for (var i=0, l=this.comparisons.length; i < l; i++) {
        if (this.comparisons[i].includes(a) && this.comparisons[i].includes(b)) {
            return this.comparisons[i];
        }
    }
    return undefined;
}

Ranker.prototype.displayNext = function() {
    var comp;
    if (this.current + 1 < this.length) {
        this.current += 1;
        comp = ranker.findComparison(this.items[this.highest], this.items[this.current]);
        if (comp) {
            this.displayNext();
        } else {
            $('#item_a').html(this.items[this.highest]);
            $('#item_b').html(this.items[this.current]);
        }
    } else if(this.length === 1) {
        // done
        $('#ranked_area').append(this.items[0] + '\n');
        this.items = this.items.splice(0, 0);
        $('#unranked_area').val(this.items.join('\n'));
        $('#ranker').hide();
    } else {
        $('#ranked_area').append(this.items[this.highest] + '\n');
        this.ranked.push(this.items[this.highest]);
        this.items.splice(this.highest, 1);
        this.highest = 0;
        this.current = 1;
        this.length = this.items.length;
        $('#unranked_area').val(this.items.join('\n'));
        this.displayNext();
    }
    
}

Ranker.prototype.compare = function(indexA, indexB, selection) {
    var comp = new Comparison(this.items[indexA], this.items[indexB], this.items[selection]); 
    this.comparisons.push(comp);
    if (selection === indexB) {
        this.highest = indexB;
    }
    this.displayNext();   
}


$(document).ready(function() {
    // shortcut listener
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
        ranker.compare(ranker.highest, ranker.current, ranker.highest);
    });

    $('#b_action').bind('click', function(e) {
        ranker.compare(ranker.highest, ranker.current, ranker.current);
    });

    // prioritize button
    $('#rank_action').bind('click', function(e) {
        // TODO: add validations

        var items = $('#unranked_area').attr('value').replace( /^\s+|\s+$/g, "").split('\n');

        if (items[0] === '') {
            alert('please enter some items');
            return false;
        } else if (items.length === 1) {
            $('#ranked_area').append(items[0] + '\n');
            items.splice(0, 1);
            $('#unranked_area').val(items.join('\n'));
            $('#ranker').hide();
        } else {
            ranker = new Ranker(items);
            $('#item_a').html(ranker.items[ranker.highest]);
            $('#item_b').html(ranker.items[ranker.current]);
        }
        $('#ranked').show();
        $('#rank_action').hide();
    });
});

