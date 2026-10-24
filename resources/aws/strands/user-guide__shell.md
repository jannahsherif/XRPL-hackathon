Agents run shell commands in tight loops: install dependencies, run tests, grep for errors, iterate. Those loops need to be fast, and they need to be contained. An agent that can run `curl` can also read your cloud credentials, reach your internal network, and overwrite files you didn’t intend to expose.

Strands Shell is a Bourne-compatible shell that runs inside your own process. It ships `grep`, `sed`, `jq`, `curl`, `find`, and dozens of other commands without calling `fork`, `exec`, or a raw syscall. You declare which host files, internal URLs, and credentials the shell can reach, and everything else doesn’t exist to the agent. It runs from Python, Node.js, or a built-in MCP server. The source is on [GitHub](https://github.com/strands-agents/shell).

[Quickstart](quickstart/index.md)Install the shell and run your first sandboxed command.

[How it works](how-it-works/index.md)Why the shell isolates at the process, and how the Kernel boundary fits together.

[Configure the sandbox](configuration/index.md)Bind directories, inject credentials, and set the network allowlist.

[Run the MCP server](mcp-server/index.md)Expose the shell to any MCP-compatible agent framework.

[Security model](security/index.md)The Kernel boundary, the SSRF guard, and credential handling.

[Reference](reference/index.md)The CLI, the API, the command inventory, and the TOML schema in one place.

## Run a command

Create a shell, bind a directory into it, and run a command. Only bound directories are visible inside the sandbox, so `/my/project` on your host appears as `/workspace` and the agent can’t see anything else.

(( tab "Python" ))
```python
import strands_shell

shell = strands_shell.Shell(
    binds=[strands_shell.Bind("/my/project", "/workspace", mode="copy")],
)

result = shell.run("grep -rn TODO /workspace")
print(result.stdout)
```
(( /tab "Python" ))

(( tab "TypeScript" ))
```typescript
import { Shell } from '@strands-agents/shell'

const shell = await Shell.create({
  binds: [{ source: '/my/project', destination: '/workspace', mode: 'copy' }],
})

const result = await shell.run('grep -rn TODO /workspace')
console.log(result.stdout)
```
(( /tab "TypeScript" ))

## Where to go next

New to Strands Shell? Start with the [quickstart](/docs/user-guide/shell/quickstart/index.md), which runs the same command through all three surfaces, then [configure the sandbox](/docs/user-guide/shell/configuration/index.md) to grant the binds, credentials, and network access your agent needs. To understand the tradeoff the shell makes and where its boundary holds, read [how it works](/docs/user-guide/shell/how-it-works/index.md) and the [security model](/docs/user-guide/shell/security/index.md). When you need to look something up, the [reference](/docs/user-guide/shell/reference/index.md) collects the CLI, the API, the command inventory, and the TOML schema in one place.