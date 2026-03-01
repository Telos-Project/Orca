var apint = use("apint");
var busNet = use("bus-net");
var fusionLISP = use("fusion-lisp/fusionLISP.js");

let orcaUtils = {
	jsonToDynamic: (item) => {

		return typeof item == "object" ?
			`(list ${
				Array.isArray(item) ?
					item.map(
						value => orcaUtils.jsonToDynamic(value)
					).join(" ") :
					Object.keys(item).map(
						key => `(: ${
							JSON.stringify(key)
						} ${
							orcaUtils.jsonToDynamic(item[key])
						})`
					).join(" ")
			})` :
			JSON.stringify(item);
	},
	loadLog: (callback) => {

		fusionLISP.run(`
			(use "fusion-lisp" "telos-oql")
			(return
				(query
					${orcaUtils.loadQuery()}
				)
			)
		`).then(callback);
	},
	loadQuery: () => {

		if(orcaUtils.query != null)
			return orcaUtils.query;

		orcaUtils.query = apint.queryUtilities(
			busNet.call(
				JSON.stringify({ tags: ["telos-configuration"] })
			)[0].APInt,
			null,
			{
				type: "orca-log"
			}
		)[0].content;

		return orcaUtils.query;
	},
	logObjects: (items, callback) => {

		fusionLISP.run(`
			(use "fusion-lisp" "telos-oql")
			(return
				(query
					(append
						${orcaUtils.loadQuery()}
						${
							(Array.isArray(items) ? items : [items]).map(
								item => orcaUtils.jsonToDynamic(item)
							).join(" ")
						}
					)
				)
			)
		`).then(callback);
	},
	query: null
};

module.exports = orcaUtils;