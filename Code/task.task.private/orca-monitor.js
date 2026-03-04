var aiPing = use(`${process.cwd()}/telos/util.private/aiPing.js`);
var autoCORS = use("telos-autocors");
var busNet = use("bus-net");
var orcaUtils = use(`${process.cwd()}/telos/util.private/orca-utils.js`);
var virtualSystem = use("virtual-system");

let template = autoCORS.read(
	`${process.cwd()}/telos/util.private/orca-prompt.txt`
);

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

	log = log.map((item, index) => getItemProperties(item, index));

	return {
		nodes: getItemsByType(log, "orca-node").filter(
			item => item.content != null && cache[item.id] == null
		),
		tasks: getItemsByType(log, "orca-task").map(item => Object.assign(
			item,
			{
				notes: getItemsByType(getItemChildren(log, item), "orca-note")
			}
		)).filter(item =>
			item.notes.filter(
				note => note?.properties?.misc?.status == "complete"
			).length == 0
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

function getItemChildren(log, item) {

	return log.filter(child => {
		return child.links.filter(link => item.ids.includes(link)).length > 0;
	});
}

function getItemProperties(item, index) {

	return {
		id: item._id.toString(),
		content: item.content != null ?
			item.content :
			autoCORS.read(
				Array.isArray(item.source) ? item.source[0] : item.source
			),
		properties: item.properties,
		ids: [`${index}`, item._id.toString()].concat(
			item.properties?.meta?.id != null ?
				(Array.isArray(item.properties?.meta?.id) ?
					item.properties?.meta?.id :
					[item.properties?.meta?.id]
				) :
				[]
		),
		links: item.properties?.meta?.links != null ?
			item.properties?.meta?.links : []
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

	tasks.forEach(item => {

		aiPing.ping(processTaskPrompt(item), (response) => {

			try {

				response = response.substring(
					response.indexOf("{"), response.lastIndexOf("}") + 1
				);

				let data = JSON.parse(response);

				orcaUtils.logObjects({
					content: response,
					properties: {
						tags: ["orca-note"],
						meta: {
							links: [item.id]
						},
						misc: {
							status: data.complete ? "complete" : "active"
						}
					}
				});
			}

			catch(error) {
				
			}
		}, orcaUtils.loadAI());
	});
}

function processTaskPrompt(task) {

	let prompt = template.split("~");

	prompt[1] = task.content.split("\n").join("\n\t");

	if(task.notes.length > 0) {

		prompt[2] = task.notes.map((item, index) => `- NOTE #${index} -\n\n${
			item.content
		}`).join("\n\n").split("\n").join("\n\t");
	}

	else {
		prompt[2] = "";
		prompt[3] = "";
	}

	return prompt.join("");
}

module.exports = () => {
	checkInterval();
};