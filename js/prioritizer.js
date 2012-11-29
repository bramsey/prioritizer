function Comparison(g, l, gIndex, lIndex, clicked) {
    this.greater = g;
    this.lesser = l;
    this.greaterIndex = gIndex;
    this.lesserIndex = lIndex;
    this.clicked = clicked;
}

function Ranker(jqObjects) {
    // assign jquery object properties.
    for (var prop in jqObjects) {
        if (jqObjects.hasOwnProperty(prop)) {
            this[prop] = $(jqObjects[prop]);
        }
    }

    this.bindListeners();
}

Ranker.prototype.init = function() {
    this.items = this.$unrankedArea.attr('value').replace( /^\s+|\s+$/g, "").split('\n');
    this.ranked = [];
    this.comparisons = [];
    this.highestIndex = 0;
    this.currentIndex = 1;
    this.length = this.items.length;
};

// TODO: create a new object to manage the presentation layer.
Ranker.prototype.display = function() {
    if (this.comparisons[0] === undefined) {
        this.hideUndo();
    } else if (this.comparisons[1] === undefined) {
        this.showUndo();
    }
    this.$itemA.html(this.items[this.highestIndex]);
    this.$itemB.html(this.items[this.currentIndex]);
};

Ranker.prototype.bindListeners = function() {
    var that = this,
        A_KEY = 65,
        B_KEY = 66,
        UNDO_KEY = 85;

    // shortcut listener
    $(document).bind('keyup', function(e) {
        if (that.$ranker.css('display') === 'none') return true;

        switch(e.keyCode) {
            case A_KEY:
                that.$aAction.trigger('click');
                break;
            case B_KEY:
                that.$bAction.trigger('click');
                break;
            case UNDO_KEY:
                if(that.$undo.css('display') !== 'none') that.$undo.trigger('click');
                break;
        }
    });

    that.$aAction.bind('click', function(e) {
        that.compare(that.highestIndex, that.currentIndex, true);
    });

    that.$bAction.bind('click', function(e) {
        that.compare(that.currentIndex, that.highestIndex, true);
    });

    that.$undo.bind('click', function(e) {
        that.undo();
    });

    // prioritize button
    that.$rankAction.bind('click', function(e) {
        if (that.$unrankedArea.attr('value') === '') {
            // should use a flash notice instead.
            alert('please enter some items');
            return false;
        }

        that.init();
        that.show();
    });
};

Ranker.prototype.show = function() {

    this.$ranker.show();
    this.$unrankedTitle.html('Unranked');
    this.$rankedDiv.show();
    this.$rankAction.hide();

    this.displayNext();
};

Ranker.prototype.hide = function() {
    this.$ranker.hide();
    this.$unrankedDiv.hide();
    this.$rankedTitle.html('Ranking done!');
};

Ranker.prototype.updateAreas = function() {
    this.$rankedArea.val(this.ranked.join('\n'));
    this.$unrankedArea.val(this.items.join('\n'));
};

Ranker.prototype.showUndo = function() {
    this.$undo.show();
};

Ranker.prototype.hideUndo = function() {
    this.$undo.hide();
};

Ranker.prototype.greaterSearch = function(comps, curr, target, i) {
    var comp, found = false;

    while (!found && i >= 0) {
        comp = comps[i];
        if (comp.greater === curr) {
            found = comp.lesser === target ||
                    this.greaterSearch(comps, comp.lesser, target, i);
        } 
        i--;
    }

    return found;
};

Ranker.prototype.greaterThan = function(aIndex, bIndex) {
    return this.greaterSearch(this.comparisons, 
                              this.items[aIndex],
                              this.items[bIndex],
                              this.comparisons.length-1);
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
    if (this.length < 1) {
        this.hide();
    } else if (this.currentIndex < this.length) {
        // check if a comparison can be inferred
        if (this.greaterThan(this.currentIndex, this.highestIndex)) {
            this.compare(this.currentIndex, this.highestIndex);
        } else if (this.greaterThan(this.highestIndex, this.currentIndex)) {
            this.compare(this.highestIndex, this.currentIndex);
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
    var ranker = new Ranker({
        '$unrankedArea': '#unranked_area',
        '$rankedArea': '#ranked_area',
        '$itemA': '#item_a',
        '$itemB': '#item_b',
        '$aAction': '#a_action',
        '$bAction': '#b_action',
        '$undo': '#undo',
        '$ranker': '#ranker',
        '$rankAction': '#rank_action',
        '$unrankedTitle': '#unranked h3',
        '$rankedDiv': '#ranked',
        '$unrankedDiv': '#unranked',
        '$rankedTitle': '#ranked h3'
    });
});
