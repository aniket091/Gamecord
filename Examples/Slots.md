# 🎰 Slots

```js
const { Slots } = require('discord-gamecord')

new Slots({
	message: message,
	slash_command: false,
	embed: {
		title: '🎰 Slot Machine',
		color: '#5865F2'
	}
}).startGame();
```