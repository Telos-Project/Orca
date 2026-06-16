use("dotenv").config()

module.exports = (request) => {

	if(request.request.method != "POST")
		return null;

	use("fusion-lisp/fusionLISP.js").run(`
		(use "fusion-lisp" "telos-oql")
		(query
			(append
				${process.env.orca}
				(list
					(: "content" ${JSON.stringify(request.body)})
					(: "properties"
						(list
							(: "tags"
								(list
									"orca-task"
									"orca"
								)
							)
							(: "metadata"
								(list
									(: "author" ${
										JSON.stringify(
											process.env.author != null ?
												process.env.author : "user"
										)
									})
									(: "time" ${
										(new Date()).getTime()
									})
								)
							)
						)
					)
				)
			)
		)
	`);

	return null;
};