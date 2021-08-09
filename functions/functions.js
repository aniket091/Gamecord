const converter = ['ᴀ', 'ʙ', 'ᴄ', 'ᴅ', 'ᴇ', 'ꜰ', 'ɢ', 'ʜ', 'ɪ', 'ᴊ', 
'ᴋ', 'ʟ', 'ᴍ', 'ɴ', 'ᴏ', 'ᴘ', 'ǫ', 'ʀ', 'ꜱ', 'ᴛ', 'ᴜ', 'ᴠ', 'ᴡ', 'x', 'ʏ', 'ᴢ'];
const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

module.exports = {
    i(length) {
        var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var result = '';
        for (var i = 0; i < length; i++) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length))
        }
        return result;
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

    smallCaps(text) {
        const content = text.toLowerCase().split('').map(letter => {
            if (/[a-z]/g.test(letter)) {
                var index = letters.indexOf(letter)
                return converter[index];
            } else {
                return letter
            }
        }).join('');
        return content;
    },

    reverseText(content) {
        return content.split('').reverse().join('');
    }
}
