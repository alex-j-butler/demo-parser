var Demo = require('tf2-demo');
var fs = require('fs');
var chokidar = require('chokidar');

var watcher = chokidar.watch('*.dem', {
	ignored: /(^|[\/\\])\../,
	persistent: true
});

watcher.on('add', path => {
	var infoPath = path.replace(/\.[^/.]+$/, "")
	infoPath = `${infoPath}.json`

	if (!fs.existsSync(infoPath)) {
		fs.readFile(path, function (err, data) {
			if (err) {
				console.log(`Demo error: ${err}`)
				return
			}

			console.log(`Parsing demo: ${path}`)

			var demo = Demo.Demo.fromNodeBuffer(data);
			var parser = demo.getParser();
			var head = parser.readHeader();
			var body = parser.parseBody();
			var state = body.getState();

			var players = [];
			for (var user in state.users) {
				if (state.users[user].steamId == "BOT") {
					continue;
				}

				players.push({
					'name': state.users[user].name,
					'steam_id': state.users[user].steamId
				})
			}

			var info = {
				'map': head.map,
				'players': players
			}

			fs.writeFileSync(infoPath, JSON.stringify(info))
		});
	}
})
