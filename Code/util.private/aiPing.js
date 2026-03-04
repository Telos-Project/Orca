var autoCORS = require("telos-autocors");

var aiPing = {
	default: "hugging-face",
	middleware: {
		"hugging-face": {
			default: "meta-llama/Meta-Llama-3-8B-Instruct",
			ping: (log, callback, options) => {

				return autoCORS.send({
					request: {
						method: "POST",
						uri:
							"https://router.huggingface.co/v1/chat/completions"
					},
					headers: {
						"Authorization": `Bearer ${options.credentials.token}`,
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						model: options.model != null ?
							options.model :
							aiPing.middleware["hugging-face"].default,
						messages: [
							{
								role: "system",
								content: "You are a helpful assistant."
							}
						].concat(
							log.map(
								(item, index) => ({
									role: index % 2 == 0 ?
										"user" : "assistant",
									content: item
								})
							)
						),
						max_tokens: options.max_tokens,
						temperature: options.temperature != null ?
							options.temperature : 0.7
					})
				}, callback != null ?
					response => {

						callback(
							JSON.parse(response.body).
								choices[0].message.content
						);
					} :
					null
				);
			}
		}
	},
	ping(log, callback, options) {

		log = Array.isArray(log) ? log : [log];
		options = options != null ? options : { };

		try {
			
			return aiPing.middleware[
				options.service != null ? options.service : aiPing.default
			].ping(log, callback, options);
		}

		catch(error) {

			console.log(error);

			if(callback != null)
				callback(null);

			return null;
		}
	}
};

module.exports = aiPing;