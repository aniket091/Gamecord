
module.exports = {
    reverseText(content) {
        return content.split('').reverse().join('');
    },

    shuffle(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    },

    disableButtons(components) {
        for (let x = 0; x < components.length; x++) {
			for (let y = 0; y < components[x].components.length; y++) {
			  components[x].components[y].disabled = true;
			}
		}

        return components;
    },

    randomRange(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

    move(pos, dir) {
        switch (dir) {
            case 'up':
                return { x: pos.x, y: pos.y - 1 }
            case 'down':
                return { x: pos.x, y: pos.y + 1 }
            case 'left':
                return { x: pos.x - 1, y: pos.y }
            case 'right':
                return { x: pos.x + 1, y: pos.y }
        }
    },

    isInsideBlock(pos, width, height) {
        return pos.x >= 0 && pos.y >= 0 && pos.x < width && pos.y < height;
    },

    posEqual(pos1, pos2) {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    },
    
    oppDirection (dir) {
        switch (dir) {
            case 'up':
                return 'down'
            case 'down':
                return 'up'
            case 'left':
                return 'right'
            case 'right':
                return 'left'
        }
    }
}
