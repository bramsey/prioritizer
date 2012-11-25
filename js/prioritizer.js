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

function Ranker() {
    this.items = $('#unranked_area').attr('value').replace( /^\s+|\s+$/g, "").split('\n');
    this.ranked = [];
    this.comparisons = [];
    this.highest = 0;
    this.current = 1;
    this.length = this.items.length;
}

Ranker.prototype.display = function() {
    if (this.comparisons[0] === undefined) {
        this.hideUndo();
    } else if (this.comparisons[1] === undefined) {
        this.showUndo();
    }
    $('#item_a').html(this.items[this.highest]);
    $('#item_b').html(this.items[this.current]);
};

Ranker.prototype.start = function() {
    $('#ranker').show();
    $('#unranked h3').html('Unranked');
    $('#ranked').show();
    $('#rank_action').hide();
    this.displayNext();
};

Ranker.prototype.finish = function() {
    $('#ranker').hide();
    $('#unranked').hide();
    $('#ranked h3').html('Ranking done!');
};

Ranker.prototype.updateAreas = function() {
    $('#ranked_area').val(this.ranked.join('\n'));
    $('#unranked_area').val(this.items.join('\n'));
};

Ranker.prototype.showUndo = function() {
    console.log('showing undo');
    $('#undo').show();
};

Ranker.prototype.hideUndo = function() {
    console.log('hiding undo');
    $('#undo').hide();
};

Ranker.prototype.findComparison = function(a, b) {
    for (i=0, l=this.comparisons.length; i < l; i++) {
        if (this.comparisons[i].greater === a && this.comparisons[i].lesser === b) {
            return this.comparisons[i];
        }
    }

    return undefined;
};

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
    
    this.updateAreas();
};

Ranker.prototype.displayNext = function() {
    if (this.current < this.length) {
        if (this.greaterThan(this.items[this.highest], this.items[this.current])) {
            this.compare(this.highest, this.current);
        } else if (this.greaterThan(this.items[this.current], this.items[this.highest])) {
            this.compare(this.current, this.highest);
        } else {
            this.display()
        }
    } else if (this.length <= 1) {
        this.rank(0);
        this.finish();
    } else {
        this.rank(this.highest);
        this.displayNext();
    }
};

Ranker.prototype.compare = function(iHighest, iLowest) {
    var comp = this.findComparison(this.items[iHighest], this.items[iLowest]);

    if (comp === undefined) {
        comp = new Comparison(this.items[iHighest], this.items[iLowest], iHighest, iLowest); 
        this.comparisons.push(comp);
    }
    
    if (iHighest !== this.highest) {
        this.highest = iHighest;
    }
    
    this.current += 1;
    this.displayNext();   
};

Ranker.prototype.undo = function() {
    var comp = this.comparisons.pop(),
        lastRanked = this.ranked[this.ranked.length-1];

    if (comp === undefined) return;

    if (comp.greaterIndex < comp.lesserIndex) {
        this.highest = comp.greaterIndex;
        this.current = comp.lesserIndex;
    } else {
        this.highest = comp.lesserIndex;
        this.current = comp.greaterIndex;
    }

    if (comp.greater === lastRanked) {
        // undo ranking
        this.items.splice(comp.greaterIndex, 0, this.ranked.pop());
        this.length = this.items.length;
        this.updateAreas();
    }

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
        if ($('#unranked_area').attr('value') === '') {
            // should use a flash notice instead.
            alert('please enter some items');
            return false;
        }

        ranker = new Ranker();
        ranker.start();
    });
});
