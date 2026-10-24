When you embed Strands Shell as a sandbox inside a larger framework, you often hold a constructed shell without the arguments it was built from. A read-only configuration snapshot lets you read those settings back: to build tool descriptions, surface the network allowlist, or report the active resource caps from a shell object you were handed. The snapshot never carries a credential’s secret value.

## Read the snapshot

In Python the snapshot is a property; in Node.js it is an async method. Both return a frozen view of the shell’s configuration.

(( tab "Python" ))
```python
import strands_shell

shell = strands_shell.Shell(
    allowed_urls=["https://api.example.com/"],
    credentials=[
        strands_shell.Cred("https://api.example.com/", env_var="API_TOKEN"),
    ],
    timeout=30.0,
)

cfg = shell.config                  # a frozen ShellConfig snapshot
print(cfg.allowed_urls)             # ('https://api.example.com/',)
print(cfg.timeout)                  # 30.0
print(cfg.credentials[0].url)       # 'https://api.example.com/'
print(cfg.credentials[0].env_var)   # 'API_TOKEN' (the secret is never exposed)
```
(( /tab "Python" ))

(( tab "TypeScript" ))
```typescript
import { Shell } from '@strands-agents/shell'

const shell = await Shell.create({
  allowedUrls: ['https://api.example.com/'],
  credentials: [{ url: 'https://api.example.com/', envVar: 'API_TOKEN' }],
  timeout: 30,
})

const cfg = await shell.config()      // a deep-frozen snapshot object
console.log(cfg.allowedUrls)          // ['https://api.example.com/']
console.log(cfg.timeout)              // 30
console.log(cfg.credentials[0].url)   // 'https://api.example.com/'
console.log(cfg.credentials[0].envVar) // 'API_TOKEN' (the secret is never exposed)
```
(( /tab "TypeScript" ))

## What the snapshot reports

Each field reflects the effective configuration after any TOML config file and constructor arguments were merged.

| Field (Python)(TypeScript) | Reports |
| --- | --- |
| `binds``binds` | Bind mounts, in declaration order. Each entry carries `source`, `destination`, `mode` (`"copy"` or `"direct"`), and `readonly`. |
| `credentials``credentials` | Credential rules, in declaration order. See the credential fields below. |
| `allowed_urls``allowedUrls` | The SSRF allowlist: the URL prefixes `curl` may reach. |
| `env``env` | Environment variables seeded into the shell. |
| `umask``umask` | The file-creation mask. |
| `timeout``timeout` | The per-command timeout in seconds, or `None`/`null` when the shell has no timeout. |
| `limits``limits` | The active resource caps: `max_depth`, `max_output`, `max_fds`, `max_bg_jobs`, `max_pipeline`, `max_input`, `max_file_size`, and `max_inodes`. |

Each credential entry reports its source without ever exposing the secret itself:

| Field (Python)(TypeScript) | Reports |
| --- | --- |
| `url``url` | The URL pattern the credential applies to. |
| `kind``kind` | `"bearer"` or `"query"`. |
| `methods``methods` | HTTP methods the credential is scoped to (empty means all methods). |
| `param``param` | The query-parameter name, set only for a `"query"` credential. |
| `env_var``envVar` | The name of the environment variable the secret is read from, or `None`/`null` when a literal token was supplied. |
| `from_literal``fromLiteral` | `True`/`true` when a literal token was supplied directly. The token value itself is never included. |

The snapshot is a grant-time record, so reading it is safe to expose to the tooling that builds an agent’s context: it describes what the shell can reach without revealing any secret it was given. For the settings themselves, see [Configure the sandbox](/docs/user-guide/shell/configuration/index.md).