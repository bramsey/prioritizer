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

function Comparison(g, l) {
    this.greater = g;
    this.lesser = l;
}

function Ranker(items) {
    this.items = items;
    this.ranked = [];
    this.comparisons = [];
    this.highest = 0;
    this.current = 0;
    this.length = items.length;
    $('#ranker').show();
}

Ranker.prototype.greaterThan = function(comps, curr, target) {
    var comp, found = false, edges = [], tempComp;

    while (!found && (comp = comps.pop())) {
        if (comp.greater === curr) {
            found = comp.lesser === target ||
                    this.greaterThan(comps.slice(0), comp.lesser, target);
        } 
    }

    return found;
};

Ranker.prototype.displayNext = function() {
    var comp;
    if (this.current + 1 < this.length) {
        this.current += 1;
        if (this.greaterThan(this.comparisons.slice(0), this.items[this.highest], this.items[this.current])) {
            this.displayNext();
        } else if (this.greaterThan(this.comparisons.slice(0), this.items[this.current], this.items[this.highest])) {
            this.highest = this.current;
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
        $('#unranked').hide();
        $('#ranked h3').html('Ranking done!');
    } else {
        $('#ranked_area').append(this.items[this.highest] + '\n');
        this.ranked.push(this.items[this.highest]);
        this.items.splice(this.highest, 1);
        this.highest = 0;
        this.current = 0;
        this.length = this.items.length;
        $('#unranked_area').val(this.items.join('\n'));
        this.displayNext();
    }
}

Ranker.prototype.compare = function(iHighest, iLowest) {
    var comp = new Comparison(this.items[iHighest], this.items[iLowest]); 
    this.comparisons.push(comp);
    if (iHighest !== this.highest) {
        this.highest = iHighest;
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
        ranker.compare(ranker.highest, ranker.current);
    });

    $('#b_action').bind('click', function(e) {
        ranker.compare(ranker.current, ranker.highest);
    });

    // prioritize button
    $('#rank_action').bind('click', function(e) {
        var items = $('#unranked_area').attr('value').replace( /^\s+|\s+$/g, "").split('\n');

        if (items[0] === '') {
            // should use a flash notice instead.
            alert('please enter some items');
            return false;
        }

        ranker = new Ranker(items);
        ranker.displayNext();

        $('#unranked h3').html('Unranked');
        $('#ranked').show();
        $('#rank_action').hide();
    });
});
