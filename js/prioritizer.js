var A_KEY = 65,
    B_KEY = 66,
    UNDO_KEY = 85,
    ranker;

function Comparison(g, l, gIndex, lIndex) {
    this.greater = g;
    this.lesser = l;
    this.greaterIndex = gIndex;
    this.lesserIndex = lIndex;
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

Ranker.prototype.display = function() {
    $('#item_a').html(this.items[this.highest]);
    $('#item_b').html(this.items[this.current]);
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

    this.ranked.push(this.items[index]);
    this.items.splice(index, 1);
    this.highest = 0;
    this.current = 1;
    this.length = this.items.length;
    
    $('#ranked_area').val(this.ranked.join('\n'));
    $('#unranked_area').val(this.items.join('\n'));
};

Ranker.prototype.displayNext = function() {
    if (this.current < this.length) {
        if (this.greaterThan(this.items[this.highest], this.items[this.current])) {
            this.current += 1;
            this.displayNext();
        } else if (this.greaterThan(this.items[this.current], this.items[this.highest])) {
            this.highest = this.current;
            this.current += 1;
            this.displayNext();
        } else {
            this.display()
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
    var comp = new Comparison(this.items[iHighest], this.items[iLowest], iHighest, iLowest); 
    this.comparisons.push(comp);
    if (iHighest !== this.highest) {
        this.highest = iHighest;
    }
    this.current += 1;
    this.displayNext();   
};

Ranker.prototype.undo = function() {
    var comp = this.comparisons.pop(),
        highest,
        current,
        highestIndex,
        currentIndex,
        lastRanked = this.ranked[this.ranked.length-1];

    if (comp === undefined) return;

    if (comp.greaterIndex < comp.lesserIndex) {
        highestIndex = comp.greaterIndex;
        currentIndex = comp.lesserIndex;
    } else {
        highestIndex = comp.lesserIndex;
        currentIndex = comp.greaterIndex;
    }

    if (comp.greater === lastRanked) {
        // undo ranking
        this.items.splice(comp.greaterIndex, 0, this.ranked.pop());
        this.length = this.items.length;
        $('#ranked_area').val(this.ranked.join('\n'));
        $('#unranked_area').val(this.items.join('\n'));
    }

    this.highest = highestIndex;
    this.current = currentIndex;
    this.display();
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
