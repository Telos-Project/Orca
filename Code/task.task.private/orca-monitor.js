var aiPing = use(`${process.cwd()}/telos/util.private/aiPing.js`);
var autoCORS = use("telos-autocors");
var busNet = use("bus-net");
var orcaUtils = use(`${process.cwd()}/telos/util.private/orca-utils.js`);
var virtualSystem = use("virtual-system");

let interval = 1;
let timestamp = null;

let cache = { };

function checkInterval() {

	timestamp = timestamp != null ? timestamp : (new Date()).getTime();

	if((new Date()).getTime() >= timestamp + (interval * 1000)) {

		timestamp = (new Date()).getTime();

		onInterval();
	}
}

function getItems(log) {

	let notes = getItemsByType(log, "orca-note");

	return {
		nodes: getItemsByType(log, "orca-node").map(item => Object.assign(
			getItemProperties(item),
			{
				count: item.properties?.count
			}
		)).filter(item => item.content != null && cache[item.id] == null),
		tasks: getItemsByType(log, "orca-task").map(item => Object.assign(
			getItemProperties(item),
			{
				notes: notes.filter(note =>
					Array.isArray(note.properties?.meta?.links) ?
						note.properties?.meta?.links.includes(item.id) :
						false
				)
			}
		)).filter(item =>
			item.notes.filter(note => note.content != "COMPLETE").length == 0
		)
	};
}

function getItemsByType(log, type) {

	return log.filter(item =>
		Array.isArray(item.properties?.tags) ?
			item.properties.tags[0] == type :
			false
	);
}

function getItemProperties(item) {

	return {
		id: item._id.toString(),
		content: item.content != null ?
			item.content :
			autoCORS.read(
				Array.isArray(item.source) ? item.source[0] : item.source
			)
	};
}

function loadNodes(nodes) {

	nodes.forEach(item => {

		let path = `${process.cwd()}/telos/${item.id}.vso`.
			split(":\\").join("://").split("\\").join("/")

		cache[item.id] = item;

		virtualSystem.setResource(path, item.content);
	});

	if(nodes.length > 0)
		busNet.call(`{"tags":["telos-engine-refresh"]}`);
}

function onInterval() {
	
	orcaUtils.loadLog(log => {

		let items = getItems(log);

		loadNodes(items.nodes);
		processTasks(items.tasks);
	});
}

function processTasks(tasks) {
	// STUB
}

module.exports = () => {
	checkInterval();
};