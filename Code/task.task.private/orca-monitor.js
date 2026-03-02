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

function getNodes(log) {

	return log.filter(item => {

		if(item.properties == null)
			return false;

		if(!Array.isArray(item.properties.tags))
			return false;

		return item.properties.tags[0] == "orca-node";
	}).map(item => ({
		id: item._id.toString(),
		content: item.content != null ?
			item.content :
			autoCORS.read(
				Array.isArray(item.source) ? item.source[0] : item.source
			),
		count: item.properties != null ? item.properties.count : null
	})).filter(item => item.content != null && cache[item.id] == null);
}

function loadNodes(log) {

	getNodes(log).forEach(item => {

		let path = `${process.cwd()}/telos/${item.id}.vso`.
			split(":\\").join("://").split("\\").join("/")

		cache[item.id] = item;

		virtualSystem.setResource(path, item.content);
	});

	if(log.length > 0)
		busNet.call(`{"tags":["telos-engine-refresh"]}`);
}

function onInterval() {
	
	orcaUtils.loadLog(log => {
		loadNodes(log);
	});
}

module.exports = () => {
	checkInterval();
};