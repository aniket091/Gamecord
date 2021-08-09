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
