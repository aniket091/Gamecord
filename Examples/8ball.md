# 🎱 8Ball

```js
const { EightBall } = require('discord-gamecord')
const question = 'What\'s going on?'

await EightBall({
  message: message,
	question: question,
	embed: {
		title: '🎱 8Ball',
		color: '#5865F2'
	}
});
```