# Orca

## 1 - Abstract

***Play the Orchestra.***

Orca, or Telos Orca, is an event streaming and logging convention for coordinating task and data
management between automated, independent, and intelligent agents.

## 2 - Contents

### 2.1 - Conventions

#### 2.1.1 - Format

##### 2.1.1.1 - Orca Log

An Orca log is an append-only JSON-style list of Orca objects, listed in order of their insertion.

Orca objects follow the format of [APInt](https://github.com/Telos-Project/APInt) utility objects.

The properties object of an Orca object may have the fields "misc", which if present shall contain
a value specifying miscellaneous information, "tags", operating in the manner specified by the
APInt tags property protocol, and "meta", containing an object which may have the fields "id",
"links", and "source".

The ID field contains a string, or list thereof, specifying unique identifiers for the Orca object,
which may be used alongside its index to identify the Orca object.

The links field contains a list of Orca link objects, representing unidirectional connections from
the Orca object to other Orca objects in the Orca log. An Orca link object has the field "target",
containing a value, or list thereof, being numbers specifying the index, or strings specifying an
ID, of a single target Orca object to which the connection points (where if multiple targets are
identified, only the first to be identified will be selected). An Orca link object may also have
the field "properties", which contains a miscellaneous value specifying miscellaneous information
about the Orca link object.

The source field contains an object which may have the fields "author", containing a string
specifying the entity which published the Orca object, and "time", specifying the time (ideally in
milliseconds and in UNIX time) at which the Orca object was published.

The source of content field of the Orca object shall specify the primary content of said object.

Rather than a list, an Orca log may be represented as an APInt where each Orca object therein is a
utility with the tag "orca". The order of said objects shall be derived first from their index in
their parent package, and then from the order that their parent packages are reached in a depth
first traversal of the APInt they exist within. For this purpose, an APInt mask which allows
"orders" to be used in place of "packages", and "logs" to be used in place of "utilities", may be
used.

##### 2.1.1.2 - Orca Protocols

A standardized convention for interpreting Orca objects, and lists thereof, is referred to as an
Orca protocol.

##### 2.1.1.3 - Orca Order

An Orca order is a standardized ordered sequence of Orca objects to be appended to a new or
existing Orca log.

#### 2.1.2 - Management

Orca logs should be stored in a database accessible by a set of independent client processes which
have permissions to append Orca objects and to read the Orca log.

The standard practice is to have one shared Orca log (Orca pool) for a network (Orca pod) of client
agents (Orca node), and optionally, for each agent to have a private Orca log (Orca beach) to
persist information to. The Orca pool of an Orca pod should be the primary, if not exclusive, means
of communication between the Orca nodes thereof. One Orca node may be a member of multiple Orca
pods simultaneously.

An Orca gate is an Orca node, and usually a server, which serves as an interface to the logs of its
pods to external agents and users, allowing them the receive some or all of the Orca logs as JSON,
and to upload Orca objects as JSON to be appended to said logs.

#### 2.1.3 - Task Protocol

The task protocol is a convention for task and note Orca objects.

##### 2.1.3.1 - Objects

###### 2.1.3.1.1 - Orca Tasks

A task Orca object has the primary type tag "orca-task", and its content is a string containing a
command, specified in natural language, to be carried out collectively by the Orca pod.

###### 2.1.3.1.2 - Orca Notes

A note Orca object has the primary type tag "orca-note", and its content is a string containing a
note, specified in natural language, specifying miscellaneous information about the state of the
processes of the Orca pod.

Codified conventions for interpreting any additional properties of Orca notes are referred to as
Orca note conventions.

##### 2.1.3.2 - Execution

Tasks and notes are to be interpreted and executed by AI agents embedded in Orca nodes which map
the content thereof to discrete tasks, according to codified conventions called Orca task
conventions.

#### 2.1.4 - Orca Formations

An orca formation is a specification for an Orca pod's composition and supporting cron jobs.

Orca formations may be appended as Orca objects to Orca logs to configure and reconfigure pod
structure at runtime.

##### 2.1.4.1 - Format

An Orca formation may be specified in a JSON object, encoded in stringified form as the content of
an Orca object with the primary type tag "orca-formation".

Said object may have the fields "nodes", containing a list of node objects, and jobs, containing a
list of job objects.

Node objects represent Orca nodes within the pod, and have the field "node", containing an object
which may have the fields "tags", containing a string, or list thereof, specifying tags which
denote the type of the node, listed in order of their priority, with the highest priority tag
denoting the primary type of the Orca object, and "source", containing a string, or list thereof,
specifying paths to source content of the node.

Node objects may also have the field "count", containing an integer number specifying how many of
the specified node should be deployed into the pod. If the number is to represent a minimum instead
of an exact count, it shall be encoded as a string instead of a number. Nodes may be deployed as
separate processes or as subprocesses of singular processes.

Codified conventions for interpreting the properties of node objects are referred to as Orca
formation conventions.

Job objects represent cron jobs, and have the field "call", containing an HTTP request as an HTTP
string or [HTTP JSON](https://github.com/Telos-Project/AutoCORS?tab=readme-ov-file#211---http-json)
object, and the field "interval", containing null if the request is only to be sent once at
startup, or a number specifying the time in seconds to wait before each repetition of the call.

##### 2.1.4.2 - Telos Agent

A Telos agent is a [Telos Origin](https://github.com/Telos-Project/Telos-Origin) based application
which integrates [Telos Server](https://github.com/Telos-Project/Telos-Server) and may act as an
Orca node and gate.

To specify a Telos Agent using a node object, assign it the primary type tag "telos-agent", and use
links to [VSF](https://github.com/Telos-Project/Virtual-System?tab=readme-ov-file#212---format)
JSON files as its sources, which will be overlaid into a virtual system running within it.