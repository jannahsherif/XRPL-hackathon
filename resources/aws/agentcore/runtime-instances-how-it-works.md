

# Instances
<a name="runtime-instances-how-it-works"></a>

When you host an agent on the **Instances** compute type, Amazon Bedrock AgentCore Runtime runs your agent on [Amazon EC2 managed instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-ec2-managed-instances.html) that it provisions and operates inside your own AWS account — so you get the hardware selection and pricing benefits of Amazon EC2 without managing instance lifecycle, operating system and runtime patching, scaling, or teardown. A [capacity provider](#runtime-instances-capacity-provider) defines the infrastructure those instances use, and AgentCore handles provisioning, patching, scaling, and teardown on your behalf. Because the instances run in your account, your data stays in your account, your existing account controls apply, and you can use your EC2 pricing agreements such as Savings Plans, Reserved Instances, and On-Demand Capacity Reservations (ODCRs). With Instances, you get persistent compute and can run multiple collaborating agents on a single instance, while retaining visibility and control over the underlying infrastructure.

**Topics**
+ [When to use Instances](#runtime-instances-when-to-use)
+ [Core concepts](#runtime-instances-concepts)
+ [Compare compute types](#runtime-instances-compute-comparison)
+ [Use GPU instance types](#runtime-instances-gpu)
+ [Invocation flow](#runtime-instances-invocation-flow)
+ [Persistent storage across sessions](#runtime-instances-persistent-volumes)
+ [IAM roles](#runtime-instances-permissions)

## When to use Instances
<a name="runtime-instances-when-to-use"></a>

Choose the **Instances** compute type when your workload needs capabilities beyond what the serverless microVM model provides:
+  **Persistent, long-running sessions** – Sessions can run for up to 14 days, compared to a maximum of 8 hours for microVMs. This suits long-running automation, transformation jobs, and agents that pause and resume over extended periods.
+  **Specialized hardware** – Choose a supported GPU instance type for compute-intensive workloads such as 3D rendering, simulation, or model inference. AgentCore provisions the GPU drivers on the instance, so standard container images work without bundling drivers, and both compute (CUDA) and graphics workloads are supported. For the supported families, see [Use GPU instance types](#runtime-instances-gpu).
+  **Multi-agent collaboration** – Multiple agents can run on the same instance, share a filesystem, and coordinate on the same task.
+  **Your account, your controls** – Instances run in your account, so your data stays in your account and you can use existing cost mechanisms such as Savings Plans and On-Demand Capacity Reservations (ODCRs).

If your workload is a lightweight, API-driven interaction that completes quickly, the default **microVMs** compute type is usually the better fit. For more information, see [Compare compute types](#runtime-instances-compute-comparison).

## Core concepts
<a name="runtime-instances-concepts"></a>

Hosting an agent on Instances introduces a few resources in addition to the core AgentCore Runtime concepts described in [microVMs](runtime-how-it-works.md).

### Capacity provider
<a name="runtime-instances-capacity-provider"></a>

A **capacity provider** defines the EC2 infrastructure your agents run on: the operating system, the allowed instance types, networking (VPC and subnets), storage volumes, and the IAM roles used to provision and access the instances. A capacity provider is a reusable template — you can associate it with multiple agent runtimes, and AgentCore uses it to launch instances when those runtimes are invoked.

Key characteristics:
+ A capacity provider is created in a `CREATING` state and becomes `READY` after its configuration is validated. If validation fails, it enters `CREATE_FAILED`.
+ After a capacity provider is created, only its description can be edited. To change other configurations, duplicate the capacity provider and make your updates in the duplicate flow.
+ You can list the runtimes (and runtime versions) associated with a capacity provider, and you must disassociate them before the capacity provider can be deleted.
+ Deleting a capacity provider stops and deletes all of its associated sessions and their persistent storage.

### Agent runtime on Instances
<a name="runtime-instances-runtime"></a>

When you create an agent runtime, you choose its **compute type**. Selecting **Instances** associates the runtime with a capacity provider through the `capacityProviderConfiguration` parameter. The runtime still defines what agent runs (the code or container artifact) and how it’s configured (protocol, authentication, endpoints, versions); the capacity provider defines the compute it runs on.

You can’t change the compute type after a runtime is created.

### Session
<a name="runtime-instances-session"></a>

A **session** is an isolated EC2 instance instantiated from a runtime’s capacity provider. Each session has its own lifecycle and persistent state, and you identify it with a `runtimeSessionId` that you provide on invocation. AgentCore creates a session on the first invocation with a new session ID, and the session retains its state across stops.

A session runs for a maximum of 14 days. When a session reaches this maximum lifetime, AgentCore automatically stops it. It terminates the EC2 instance but retains the session’s persistent volumes. To resume work after a session is stopped, invoke the runtime again with the same `runtimeSessionId`. AgentCore provisions a new instance and re-attaches the persistent volumes, so your data is intact. Because the new instance can launch from an updated machine image, a restarted session might run on an instance with the latest patches. When you delete a session, AgentCore deprovisions everything, including the persistent volumes.

For the session isolation and multi-tenant security model, see [Security model and permissions for Runtime Instances](runtime-instances-security.md).

### Agent
<a name="runtime-instances-agent"></a>

An **agent** is a workload running within a session. Unlike the microVM model, where one runtime hosts one agent, a single Instances session can host multiple agents. When two agent runtimes share the same capacity provider, you can invoke them with the same `runtimeSessionId` to land both agents on the same EC2 instance. There, they share a filesystem and can collaborate on the same task.

### Understanding managed instances
<a name="runtime-instances-managed-instances"></a>

The EC2 instances that back your sessions are [Amazon EC2 managed instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-ec2-managed-instances.html) — AgentCore provisions and operates them in your account on your behalf, so you have restricted permissions on them compared with standard EC2 instances. You can identify them by the `Operator` field in EC2 `DescribeInstances` output and by the AgentCore capacity-provider tag on the instance.

You don’t perform standard EC2 lifecycle operations on these instances directly — for example, you don’t launch, patch, or terminate them yourself. AgentCore manages their lifecycle; to remove them, delete the associated capacity provider, which stops and deletes its sessions and their persistent storage. Managed instances are hidden from your EC2 console views and API list operations by default; you can change this with the [managed resource visibility setting](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-ec2-managed-instances.html#managed-resource-visibility-settings). They remain fully operational and billable in your account.

## Compare compute types
<a name="runtime-instances-compute-comparison"></a>

The following table compares the **microVMs** and **Instances** compute types to help you choose the right one for your workload.


| Characteristic | microVMs | Instances | 
| --- | --- | --- | 
| Best suited for | Lightweight, API-driven agents that start fast, scale on demand, and complete within hours | Long-running, stateful, or collaborative workloads needing GPUs or multi-agent sessions | 
| Management model | Fully AWS managed, serverless, scale on demand |  AWS managed EC2 in your account; AWS manages patching and updates, with persistent sessions | 
| Maximum session duration | Up to 8 hours | Up to 14 days | 
| Operating systems | Linux containers (`arm64`) | Linux (`x86_64` and `arm64`) | 
| Networking |  `PUBLIC` or VPC | VPC | 
| Agent modality | API, CLI | API, CLI | 
| Agents per session | One runtime hosts one agent (1:1) | One session can host multiple agents (1:N) | 
| Supported artifacts | Container image and Amazon S3 source | Container image and Amazon S3 source | 
| GPU access | Not supported | Choose a supported GPU instance type; drivers are provisioned for you | 
| Pricing | Consumption-based, billed by AgentCore | EC2 instances run in your account; use your Savings Plans and ODCRs | 
| Models and frameworks | Any | Any | 

## Use GPU instance types
<a name="runtime-instances-gpu"></a>

For compute-intensive workloads such as model inference, 3D rendering, and media processing, include a GPU instance type in the allowed instance types of your capacity provider. AgentCore provisions the GPU drivers on the instance, so you don’t configure device paths, GPU indices, or driver versions, and standard container images (for example, CUDA images) work without bundling drivers. Both compute (CUDA) and graphics (such as Vulkan, EGL, and GLX) workloads are supported. When more than one agent runs on the same instance, all agents share access to its GPUs.

The following GPU and accelerator instance families are supported:
+ NVIDIA GPU families – `g4dn`, `g5`, `g6`, `g6e`, `gr6`, `g6f`, `gr6f`, and `g7e`.
+  AWS accelerator families – `inf2` (powered by AWS Inferentia2).

If you include an accelerator instance type from a family that isn’t supported, `CreateCapacityProvider` fails with a `ValidationException` that names the instance type and lists the supported families. Non-accelerator instance types are unaffected.

## Invocation flow
<a name="runtime-instances-invocation-flow"></a>

Invoking an agent runtime backed by a capacity provider follows the same [InvokeAgentRuntime](https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_InvokeAgentRuntime.html) entry point as the microVM model. AgentCore resolves the capacity provider, ensures an instance and agent are running for your session, and proxies the request to the agent:

1. You call `InvokeAgentRuntime` with the runtime ARN and a `runtimeSessionId`.

1. If no session exists for that session ID, AgentCore provisions an EC2 instance from the runtime’s capacity provider in your account and launches the agent on it. The first invocation for a session takes longer because it includes instance provisioning.

1. If a session already exists, AgentCore reuses the running instance. Invoking a second runtime that shares the same capacity provider with the same session ID launches that agent alongside the first on the same instance.

1. AgentCore proxies the request to the agent and streams the response back to you. Each agent runs with its own IAM credentials derived from its runtime’s execution role.

Because the agent runs on an instance in your account, the EC2 instance, its network interfaces, and any persistent volumes are visible in your account’s EC2 console and billed to your account. These are [Amazon EC2 managed instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-ec2-managed-instances.html) — instances that AgentCore provisions and operates in your account on your behalf. You can control whether they appear in your EC2 console views and API list operations with [managed resource visibility settings](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-ec2-managed-instances.html#managed-resource-visibility-settings).

## Persistent storage across sessions
<a name="runtime-instances-persistent-volumes"></a>

A capacity provider can define one or more Amazon EBS volumes. When you save the capacity provider, AgentCore saves the volume configuration and creates the EBS volume on the session’s first launch. When an agent runtime mounts a volume through its storage configuration, the volume’s data survives session stops:

1. On the first invocation for a session, AgentCore creates the volume and attaches it to the EC2 instance.

1. When AgentCore stops the session, it terminates the EC2 instance but retains the volume.

1. On the next invocation with the same `runtimeSessionId`, AgentCore provisions a new instance and re-attaches the existing volume, so the agent sees its previous data intact.

This enables stateful agent workflows where workspace files, caches, and checkpoints persist across session restarts. Deleting the session deprovisions the EC2 resources — instance, network interface, and EBS volume — so you stop incurring costs for infrastructure you no longer need.

## IAM roles
<a name="runtime-instances-permissions"></a>

Hosting agents on Instances involves the following roles, in addition to the agent runtime execution role that grants your agent code its runtime permissions:
+  **Instance profile** – An IAM role attached to the EC2 instance. AgentCore uses it to collect system logs from the instance; it does not grant permissions to your agent code (the agent runtime execution role does that).
+  **Infrastructure role** – An IAM role that AgentCore assumes to provision and manage EC2 instances in your account on your behalf (launching, tagging, and configuring networking for instances and their network interfaces).

You can let the console create default roles for you, or supply existing roles. Because the infrastructure role grants AgentCore the ability to manage compute in your account, scope it to the least privilege your workloads require, and use IAM conditions to restrict it to specific VPCs, subnets, or instance types where appropriate.