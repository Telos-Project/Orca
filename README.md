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

Orca objects may have the fields "id", "source", "tags", "links" "properties", and "content". The
ID field contains a string, or list thereof, specifying unique identifiers for the Orca object,
which may be used alongside its index to identify the Orca object.

The source field contains an object which may have the fields "author", containing a string
specifying the entity which published the Orca object, and "time", specifying the time (ideally in
milliseconds and in UNIX time) at which the Orca object was published.

The tags field contains a string, or list thereof, specifying tags which denote the type of the
Orca object, listed in order of their priority, with the highest priority tag denoting the primary
type of the Orca object.

The links field contains a list of Orca link objects, representing unidirectional connections from
the Orca object to other Orca objects in the Orca log. An Orca link object has the field "target",
containing a value, or list thereof, being numbers specifying the index, or strings specifying an
ID, of a single target Orca object to which the connection points (where if multiple targets are
identified, only the first to be indentified will be selected). An Orca link object may also have
the field "properties", which contains a miscelleneous value specifying miscellaneous information
about the Orca link object.

The properties field contains a miscelleneous value specifying miscellaneous information about the
Orca object.

The content field contains a miscelleneous value specifying the primary content of the Orca object.

##### 2.1.1.2 - Orca Protocols

A standardized convention for interpreting Orca objects, and lists thereof, is referred to as an
Orca protocol.

#### 2.1.2 - Management

Orca logs should be stored in a database accessible by a set of independent client processes which
have permissions to append Orca objects and to read the Orca log.

The standard practice is to have one shared Orca log (Orca pool) for a network (Orca pod) of client
agents (Orca node), and optionally, for each agent to have a private Orca log (Orca beach) to
persist information to. The Orca pool of an Orca pod should be the primary, if not exclusive, means
of communication between the Orca nodes thereof. One Orca node may be a member of multiple Orca
pods simultaneiously.

An Orca gate is an Orca node, and usually a server, which serves as an interface to the logs of its
pods to external agents and users, allowing them the recieve some or all of the Orca logs as JSON,
and to upload Orca objects as JSON to be appended to said logs.

#### 2.1.3 - Task Protocol

The task protocol is a convention for task and note Orca objects.

##### 2.1.3.1 - Objects

###### 2.1.3.1.1 - Orca Tasks

A task Orca object has the primary type tag "task", and its content is a string containing a
command, specified in natural language, to be carried out collectively by the Orca pod.

###### 2.1.3.1.2 - Orca Notes

A note Orca object has the primary type tag "note", and its content is a string containing a note,
specified in natural language, specifying miscellaneous information about the state of the
processes of the Orca pod.

Codified conventions for interpeting any additional properties of Orca notes are referred to as
Orca note convenitons.

##### 2.1.3.2 - Execution

Tasks and notes are to be interpreted and executed by AI agents embedded in Orca nodes which map
the content thereof to discrete tasks, according to codified conventions called Orca task
conventions.