var busNet = use("bus-net");
var fusionLISP = use("fusion-lisp/fusionLISP.js");
var orcaUtils = use(`${process.cwd()}/telos/util.private/orca-utils.js`);

let flag = false;

function onCommand(args) {

	if(args[0] == "set-log") {
		
		let path = process.cwd() + use("path").sep + "APInt.json";
		let apint = JSON.parse(use("fs").readFileSync(path));

		let current = apint;

		["packages", "orca", "utilities"].forEach(item => {

			if(current[item] == null)
				current[item] = { };

			current = current[item];
		});

		current["orca-log"] = {
			content: args[1],
			properties: {
				type: "orca-log"
			}
		};

		use("fs").writeFileSync(path, JSON.stringify(apint, null, "\t"));
		
		process.exit(0);
	}

	if(args[0] == "log-object") {

		fusionLISP.run(`
			(use "fusion-lisp" "telos-oql")
			(return
				(query
					(append
						${orcaUtils.loadQuery()}
						(list
							(: "content" ${JSON.stringify(args[1])})
							(:
								"properties"
								(list
									(: "tags" (list ${
										args.slice(2).map(
											item => JSON.stringify(item)
										).join(" ")
									}))
								)
							)
						)
					)
				)
			)
		`).then(data => {
			process.exit(0);
		});
	}

	if(args[0] == "log-order") {
		// STUB
	}

	if(args[0] == "load-log") {

		orcaUtils.loadLog(data => {

			use("fs").writeFileSync(args[1], JSON.stringify(data, null, "\t"));
		
			process.exit(0);
		});
	}
}

module.exports = () => {

	if(flag)
		return;

	let args = busNet.call(
		JSON.stringify({ tags: ["telos-configuration"] })
	)[0].options.args;

	if(args[0] == "orca") {

		try {
			onCommand(args.slice(1));
		}

		catch(error) {
			console.log(error);
		}
	}

	flag = true;
};