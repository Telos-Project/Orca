var apint = use("apint");
var busNet = use("bus-net");
var fusionLISP = use("fusion-lisp/fusionLISP.js");

let orcaUtils = {
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
	query: null
};

module.exports = orcaUtils;