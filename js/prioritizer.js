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

Ranker.prototype.display = function(a, b) {
    $('#item_a').html(a);
    $('#item_b').html(b);
}

Ranker.prototype.greaterThan = function(a, b) {
    var comparisons = this.comparisons.slice(0),
        greaterSearch = function(comps, curr, target) {
            var comp, found = false;

            while (!found && (comp = comps.pop())) {
                if (comp.greater === curr) {
                    found = comp.lesser === target ||
                            greaterSearch(comps.slice(0), comp.lesser, target);
                } 
            }

            return found;
        };

    return greaterSearch(comparisons.slice(0), a, b);
};

Ranker.prototype.rank = function(index) {
    if (this.length <= 0) return;

    $('#ranked_area').append(this.items[index] + '\n');
    this.ranked.push(this.items[index]);
    this.items.splice(index, 1);
    this.highest = 0;
    this.current = 0;
    this.length = this.items.length;
    $('#unranked_area').val(this.items.join('\n'));
};

Ranker.prototype.displayNext = function() {
    if (this.current + 1 < this.length) {
        this.current += 1;
        if (this.greaterThan(this.items[this.highest], this.items[this.current])) {
            this.displayNext();
        } else if (this.greaterThan(this.items[this.current], this.items[this.highest])) {
            this.highest = this.current;
            this.displayNext();
        } else {
            this.display(this.items[this.highest], this.items[this.current])
        }
    } else if (this.length <= 1) {
        this.rank(0);
        $('#ranker').hide();
        $('#unranked').hide();
        $('#ranked h3').html('Ranking done!');
    } else {
        this.rank(this.highest);
        this.displayNext();
    }
};

Ranker.prototype.compare = function(iHighest, iLowest) {
    var comp = new Comparison(this.items[iHighest], this.items[iLowest]); 
    this.comparisons.push(comp);
    if (iHighest !== this.highest) {
        this.highest = iHighest;
    }
    this.displayNext();   
};

Ranker.prototype.undo = function() {
    // TODO: reflect the comparison changes in the unranked/ranked areas.
    var comp = this.comparisons.pop(),
        prevComp = this.comparisons[this.comparisons.length-1];

    // TODO: account for edge cases:
    //  last comparison resulted in a ranking

    if (prevComp === undefined) {
        this.display(this.items[0], this.items[1]);
    } else if (comp.greater === prevComp.greater) {
        this.display(comp.greater, comp.lesser);
    } else {
        this.display(comp.lesser, comp.greater);
    }
};

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
    
    $('#undo').bind('click', function(e) {
        ranker.undo();
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
