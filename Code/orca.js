var aiUtils = require("./aiUtils.js");
var apint = require("apint");
var autoCORS = require("telos-autocors");
var fs = require("fs");
var orcaUtils = require("./orcaUtils.js");
var path = require("path");
var telosUtils = require("telos-origin/telosUtils.js");
var virtualSystem = require("virtual-system");

let template = fs.readFileSync(
	`${__dirname}${path.sep}orca-prompt.txt`, "utf-8"
);

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
}

function processTasks(tasks, options) {

	tasks.forEach(item => {

		aiUtils.ping(processTaskPrompt(item), (response) => {

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
		}, options);
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

module.exports = [
	telosUtils.createCommand("orca", (package, args) => {
		telosUtils.initiateEngine();
	}),
	telosUtils.createCommand("log-object", (package, args) => {

		orcaUtils.logObjects(
			telosUtils.getArguments(package).options.pool,
			{
				content: args[0],
				properties: {
					tags: args.slice(2)
				}
			}
		);
	}),
	telosUtils.createCommand("log-order", (package, args) => {

		orcaUtils.logObjects(
			telosUtils.getArguments(package).options.pool,
			apint.queryUtilities(
				apint.buildAPInt(
					JSON.parse(fs.readFileSync(args[0])),
					{
						packages: ["orders"],
						utilities: ["logs"]
					}
				),
				null,
				(item) => {
					return item.properties.tags.includes("orca");
				}
			)
		);
	}),
	telosUtils.createCommand("load-order", (package, args) => {

		orcaUtils.loadLog(
			telosUtils.getArguments(package).options.pool,
			data => {

				data = orcaUtils.queryToOrder(data);

				if(telosUtils.getArguments(package).options.file == null)
					console.log(JSON.stringify(data, null, "\t"));

				else {

					fs.writeFileSync(
						telosUtils.getArguments(package).options.file,
						JSON.stringify(data, null, "\t")
					);
				}
			}
		);
	}),
	telosUtils.createTask(1, false, (package) => {

		orcaUtils.loadLog(log => {

			let items = getItems(log);

			loadNodes(items.nodes);

			processTasks(
				items.tasks, telosUtils.getArguments(package).options
			);
		});
	})
];