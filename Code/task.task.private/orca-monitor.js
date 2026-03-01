var orcaUtils = use(`${process.cwd()}/telos/util.private/orca-utils.js`);

let interval = 1;
let timestamp = null;

function checkInterval() {

	timestamp = timestamp != null ? timestamp : (new Date()).getTime();

	if((new Date()).getTime() >= timestamp + (interval * 1000)) {

		timestamp = (new Date()).getTime();

		onInterval();
	}
}

function onInterval() {
	// STUB
}

module.exports = () => {
	checkInterval();
};