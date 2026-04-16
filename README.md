# Orca

## 1 - Abstract

***Play the Orchestra.***

Orca, or Telos Orca, is an event streaming and logging convention for coordinating task and data
management between automated, independent, and intelligent agents.

## 2 - Contents

### 2.1 - Conventions

#### 2.1.1 - Format

##### 2.1.1.1 - Orca Log

An Orca log is a list, which is append-only by default, of Orca objects, listed in order of their
insertion.

Orca objects follow the format of [APInt](https://github.com/Telos-Project/APInt) utility objects.

An Orca log may be represented as an APInt where each Orca object therein is a utility with the tag
"orca". The order of said objects shall be derived first from their index in their parent package,
and then from the order that their parent packages are reached in a depth first traversal of the
APInt they exist within.

For this purpose, an APInt mask which allows "orders" to be used in place of "packages", and "logs"
to be used in place of "utilities", may be used.

The alias of an Orca object should be the stringified index of its position in the list that the
APInt it exists within represents. Orca objects may use the ID, links, and tags property protocols.

The source or content field of the Orca object shall specify the primary content of said object.

##### 2.1.1.2 - Orca Properties

###### 2.1.1.2.1 - Metadata

Orca objects may have the property field "metadata", which contains an object that may have the
fields "author", containing a string specifying the entity which published the Orca object, and
"time", specifying the time (ideally in milliseconds and in UNIX time) at which the Orca object was
published.

###### 2.1.1.2.1 - Ephemeral

Orca objects may have the property field "ephemeral", which if present indicates that the object
may be removed from the an Orca log to which it is appended, with the contents of said field
detailing the conditions under which it may be removed. Orca objects with the ephemeral property
are referred to as ephemeral.

A standardized convention for interpreting the contents of said field with the conditions specified
in said interpretation, is referred to as an Orca ephemeral protocol.

The default Orca ephemeral protocol interprets the conditions for removal as arbitrary if the
content of the ephemeral field is the boolean true, and, if the content of said field is a number,
holding that said number specifies a millisecond timestamp in UNIX time, where removal is
acceptable after said timestamp has been passed.

##### 2.1.1.3 - Orca Protocols

A standardized convention for interpreting Orca objects, and logs thereof, is referred to as an
Orca protocol.

###### 2.1.1.3.1 - Orca Ontology

An Orca protocol for rendering information derived from an Orca log into a concise report,
generally in APInt format, is referred to as an Orca ontology.

Orca ontologies may be used to represent entity-relationship graphs.

###### 2.1.1.3.2 - Orca Topology

A relationship established between separate Orca logs via references between them, specifically
references established by the usage of the links property protocol, may be referred to as an Orca
topology.

The Orca topology consisting of all Orca logs may be called the Orca Net.

##### 2.1.1.4 - Orca Order

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

The Orca nodes in an Orca formation may be specified in Orca objects with the primary type tag
"orca-node".

Such objects may have the property "count", containing an integer number specifying how many of the
specified node should be deployed into the pod. If the number is to represent a minimum instead of
an exact count, it shall be encoded as a string instead of a number.

Codified conventions for interpreting the properties of node objects are referred to as Orca
formation conventions. Nodes may be deployed as separate processes or as subprocesses of singular
processes.

The cron jobs in an Orca formation may be specified in Orca objects with the primary type tag
"orca-job".

The content of such objects represent cron jobs shall contain an HTTP request as an HTTP
string or a stringified [HTTP JSON](https://github.com/Telos-Project/AutoCORS?tab=readme-ov-file#211---http-json)
object.

Such objects may also have the property "interval", containing null if the request is only to be
sent once at startup, or a number specifying the time in seconds to wait before each repetition of
the call.

If there is a conflict between any of the aforementioned Orca objects in an Orca log, priority
shall be determined by the recency of their upload.

##### 2.1.4.2 - Standard Formation Convention

The standard formation convention interprets the content of a node object as being a VSO file to
overlay atop the telos folder of a [Telos Origin](https://github.com/Telos-Project/Telos-Origin)
instance.