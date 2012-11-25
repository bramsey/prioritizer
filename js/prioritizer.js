var A_KEY = 65,
    B_KEY = 66,
    UNDO_KEY = 85,
    ranker;

function Comparison(g, l, gIndex, lIndex, clicked) {
    this.greater = g;
    this.lesser = l;
    this.greaterIndex = gIndex;
    this.lesserIndex = lIndex;
    this.clicked = clicked;
}

function Ranker() {
    // TODO: decouple from jquery calls.
    this.items = $('#unranked_area').attr('value').replace( /^\s+|\s+$/g, "").split('\n');
    this.ranked = [];
    this.comparisons = [];
    this.highestIndex = 0;
    this.currentIndex = 1;
    this.length = this.items.length;
}

// TODO: create a new object to manage the presentation layer.
Ranker.prototype.display = function() {
    if (this.comparisons[0] === undefined) {
        this.hideUndo();
    } else if (this.comparisons[1] === undefined) {
        this.showUndo();
    }
    $('#item_a').html(this.items[this.highestIndex]);
    $('#item_b').html(this.items[this.currentIndex]);
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
    $('#undo').show();
};

Ranker.prototype.hideUndo = function() {
    $('#undo').hide();
};

Ranker.prototype.greaterThan = function(aIndex, bIndex) {
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

    return greaterSearch(comparisons.slice(0), this.items[aIndex], this.items[bIndex]);
};

Ranker.prototype.rank = function(index) {
    if (this.length <= 0) return;

    this.ranked.push(this.items[index]);
    this.items.splice(index, 1);
    this.highestIndex = 0;
    this.currentIndex = 1;
    this.length = this.items.length;
    
    this.updateAreas();
};

Ranker.prototype.displayNext = function() {
    //console.log('current: ' + this.currentIndex + ', highest: ' + this.highestIndex + ', length: ' + this.length);
    if (this.length < 1) {
        this.finish();
    } else if (this.currentIndex < this.length) {
        // check if a comparison can be inferred
        if (this.greaterThan(this.highestIndex, this.currentIndex)) {
            this.compare(this.highestIndex, this.currentIndex);
        } else if (this.greaterThan(this.currentIndex, this.highestIndex)) {
            this.compare(this.currentIndex, this.highestIndex);
        } else {
            this.display()
        }
    } else {
        this.rank(this.highestIndex);
        this.displayNext();
    }
};

Ranker.prototype.compare = function(hIndex, lIndex, clicked) {
    var comp = new Comparison(this.items[hIndex], this.items[lIndex], hIndex, lIndex, clicked); 
    this.comparisons.push(comp);
    
    if (hIndex !== this.highestIndex) {
        this.highestIndex = hIndex;
    }
    
    this.currentIndex += 1;
    this.displayNext();   
};

Ranker.prototype.undo = function() {
    var comp, found = false, lastRanked;

    while (!found && (comp = this.comparisons.pop())) {
        if (comp === undefined) break;

        if (comp.greaterIndex < comp.lesserIndex) {
            this.highestIndex = comp.greaterIndex;
            this.currentIndex = comp.lesserIndex;
        } else {
            this.highestIndex = comp.lesserIndex;
            this.currentIndex = comp.greaterIndex;
        }
        
        lastRanked = this.ranked[this.ranked.length-1];

        if (comp.greater === lastRanked) {
            // undo ranking
            this.items.splice(comp.greaterIndex, 0, this.ranked.pop());
            this.length = this.items.length;
            this.updateAreas();
        }

        found = comp.clicked;
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
        ranker.compare(ranker.highestIndex, ranker.currentIndex, true);
    });

    $('#b_action').bind('click', function(e) {
        ranker.compare(ranker.currentIndex, ranker.highestIndex, true);
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
