# 🎱 8Ball

```js
const { EightBall } = require('discord-gamecord')
const question = 'What\'s going on?'

new EightBall({
	message: message,
	question: question,
	slash_command: false,
	embed: {
		title: '🎱 8Ball',
		color: '#5865F2'
	}
}).startGame();
```