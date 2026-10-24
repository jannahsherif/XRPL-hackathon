

# File system configurations for AgentCore Runtime
<a name="runtime-filesystem-configurations"></a>

AgentCore Runtime supports persistent file systems through the `filesystemConfigurations` parameter. Each configuration mounts storage at a path you specify. You don’t need custom mount code, privileged containers, or download orchestration.

AgentCore Runtime supports two categories of file system configurations:
+  **Managed storage** – Service-managed storage where AgentCore handles all storage operations. There are two managed types, one for each compute type:
  +  **Session storage (Preview)** – Per-session storage on microVM runtimes that persists across stop/resume cycles. Isolated per session. No VPC required.
  +  **Capacity provider volumes** – Amazon EBS volumes on Instances runtimes, defined on the capacity provider and mounted by logical name. Persist across session stop/resume.
+  **Bring-your-own file system** – Attach your own Amazon S3 Files or Amazon EFS access points directly to your agent runtime. Shared across sessions and agents. VPC required. Available on microVM runtimes.

The managed type depends on your runtime’s compute type. Use session storage on microVM runtimes and capacity provider volumes on Instances runtimes. On microVM runtimes, you can combine session storage with bring-your-own file systems on a single agent runtime (up to 5 total configurations).

## Storage options at a glance
<a name="_storage_options_at_a_glance"></a>

The following table compares the available file system configuration types.


| Category | Type | Isolation | Persistence | Compute type | VPC required | Best for | 
| --- | --- | --- | --- | --- | --- | --- | 
| Managed | Session storage (Preview) | Per-session | Survives stop/resume; 14-day idle expiry; resets on version update | microVM only | No | Scratch space, installed packages, code, project files, agent state | 
| Managed | Capacity provider volume | Per-session | Survives stop/resume; retained until you delete the session | Instances only | Yes (configured on the capacity provider) | Scratch space, workspace files, caches, and checkpoints for long-running Instances sessions | 
| BYO | Amazon S3 Files | Shared – multiple sessions and agents access the same data | Customer-managed (permanent, syncs to S3 bucket) | microVM | Yes | Datasets accessible through both standard file operations and S3 APIs | 
| BYO | Amazon EFS | Shared – multiple sessions and agents access the same data | Customer-managed (permanent until you delete it) | microVM | Yes | Shared tool libraries, model weights, read-write multi-agent collaboration | 

## Quick start
<a name="_quick_start"></a>

The following checklists provide condensed steps for configuring each file system type.

### Managed session storage (Preview)
<a name="_managed_session_storage_preview"></a>

Session storage is available on microVM runtimes.

1. No VPC or additional IAM permissions required.

1. Add `--filesystem-configurations '[{"sessionStorage": {"mountPath": "/mnt/workspace"}}]'` to your `create-agent-runtime` or `update-agent-runtime` call.

1. Invoke the agent with a `--runtime-session-id`.

1. Stop the session, then resume with the same `--runtime-session-id`. Verify `/mnt/workspace` retains your data.

### Capacity provider volume
<a name="_capacity_provider_volume"></a>

Capacity provider volumes are available on Instances runtimes.

1. Define one or more named Amazon EBS volumes on the capacity provider when you create it (in `ec2Configuration.volumes`).

1. Create the agent runtime with a `capacityProviderConfiguration` that references the capacity provider.

1. Add `--filesystem-configurations '[{"capacityProviderVolume": {"volumeName": "scratch", "mountPath": "/mnt/scratch"}}]'` to the same `create-agent-runtime` call, referencing a volume by its logical name.

1. Invoke the agent with a `--runtime-session-id`. Stop the session, then resume with the same `--runtime-session-id`. Verify `/mnt/scratch` retains your data.

For the full walkthrough, see [Get started with Instances using the AWS CLI](runtime-instances-get-started-cli.md).

### Bring-your-own file system
<a name="_bring_your_own_file_system"></a>

#### Amazon S3 Files access point
<a name="_amazon_s3_files_access_point"></a>

1. Add `s3files:ClientMount`, `s3files:ClientWrite`, and `s3files:GetAccessPoint` to your execution role with an `s3files:AccessPointArn` condition.

1. Allow TCP port 2049 outbound from your agent runtime security group to your S3 Files mount target security group.

1. Confirm the S3 Files mount target is in the same VPC and Availability Zone as your agent runtime subnets.

1. Add `--filesystem-configurations '[{"s3FilesAccessPoint": {"accessPointArn": "<your-access-point-arn>", "mountPath": "/mnt/s3data"}}]'` to your `create-agent-runtime` or `update-agent-runtime` call.

1. Invoke the agent. Files at `/mnt/s3data` sync bidirectionally with the backing S3 bucket.

#### Amazon EFS access point
<a name="_amazon_efs_access_point"></a>

1. Add `elasticfilesystem:ClientMount` and `elasticfilesystem:ClientWrite` to your execution role with an `elasticfilesystem:AccessPointArn` condition.

1. Allow TCP port 2049 outbound from your agent runtime security group to your EFS mount target security group.

1. Confirm the EFS mount target is in the same Availability Zone as at least one of your agent runtime subnets.

1. Add `--filesystem-configurations '[{"efsAccessPoint": {"accessPointArn": "<your-access-point-arn>", "mountPath": "/mnt/efs"}}]'` to your `create-agent-runtime` or `update-agent-runtime` call.

1. Invoke the agent. Your files are available at `/mnt/efs`.

Both S3 Files and EFS require VPC connectivity on the agent runtime.

## How each type works
<a name="_how_each_type_works"></a>

The following sections describe how each file system type operates within AgentCore Runtime.

### Bring-your-own file systems
<a name="_bring_your_own_file_systems"></a>

When you configure a bring-your-own file system, AgentCore Runtime mounts the specified access point into every session at the path you configure. Data is shared – multiple sessions, multiple agents, or external applications can access the same file system simultaneously.

AgentCore handles all mount operations automatically. You don’t need to install mount helpers, manage TLS certificates, or write mount code in your agent.

**Note**  
When you create an access point (S3 Files or EFS), you specify a POSIX user ID (UID) and group ID (GID). All file operations through the access point run as this identity. Set the UID/GID to match the user your container process runs as (typically 1000:1000 for non-root containers, or 0:0 for root).

#### Amazon S3 Files mount flow
<a name="_amazon_s3_files_mount_flow"></a>

When you configure an S3 Files access point, the following sequence occurs:

1. You create an S3 Files file system (backed by an S3 bucket) and mount targets in your VPC.

1. You create an S3 Files access point specifying the POSIX UID/GID and root directory.

1. You configure the agent runtime with the access point ARN and mount path.

1. On invocation with a new session ID, AgentCore provisions a microVM with network access to your VPC.

1. The microVM mounts the file system through NFSv4.2 over TLS with IAM authentication (port 2049) via your VPC.

1. Your agent reads and writes files at the mount path. Changes automatically sync to the backing S3 bucket.

 **S3 Files semantics** 
+ Bidirectional sync between file system and backing S3 bucket
+ Close-to-open consistency for NFS clients; S3 eventual consistency for bucket-side access
+ Max file size: 48 TiB; max directory depth: 1,000 levels
+ Not supported: Hard links, S3 archival storage classes (Glacier), custom S3 object metadata, pNFS

#### Amazon EFS mount flow
<a name="_amazon_efs_mount_flow"></a>

When you configure an EFS access point, the following sequence occurs:

1. You create an EFS file system and mount targets in your VPC (one per Availability Zone).

1. You create an EFS access point specifying the POSIX UID/GID and root directory.

1. You configure the agent runtime with the access point ARN and mount path.

1. On invocation with a new session ID, AgentCore provisions a microVM with network access to your VPC.

1. The microVM mounts the file system through NFSv4.1 over TLS (port 2049) via the mount target in the same Availability Zone.

1. Your agent reads and writes files at the mount path using standard file operations.

 **EFS semantics** 
+ Full POSIX: hard links, symbolic links, advisory file locking
+ Concurrent read-write access from multiple sessions and agents
+ Close-to-open consistency
+ Max file size: 47.9 TiB; max directory depth: 1,000 levels

### Managed session storage (Preview)
<a name="session-storage-how-it-works"></a>

Persist session state across stop/resume with a filesystem configuration using managed session storage. AgentCore Runtime managed session storage is a fully service-managed capability where AgentCore Runtime handles all storage operations. Your agent reads and writes to a local file system mount and the runtime environment transparently replicates data to service storage throughout the session duration.

Session storage is isolated per session – each session can only access its own storage and cannot read or write data from other sessions of the same agent runtime or sessions of different agent runtimes.

When you configure session storage on an agent runtime, each session gets a persistent directory at the mount path you specify. The lifecycle works as follows:

1.  **First invoke on a session** – A new isolated compute is provisioned. Your agent sees an empty directory at the mount path.

1.  **Agent writes files** – All file operations (read, write, mkdir, rename) work as normal, similar to a local file system, and data is asynchronously replicated to durable storage.

1.  **Session stops** – The compute is terminated. Any data not yet persisted is flushed to durable storage during graceful shutdown.

1.  **Resume with same session** – A new compute is provisioned and the file system state is restored from durable storage. The agent can continue from where it left off.

#### Filesystem semantics
<a name="session-storage-filesystem-semantics"></a>

Session storage provides a standard Linux file system at your configured mount path. Standard tools and operations work without modification – `ls`, `cat`, `mkdir`, `git`, `npm`, `pip`, and `cargo` all work as expected.

 **Supported operations** 

Regular files, directories, and symlinks. Read, write, rename, delete, `chmod`, `chown`, `stat`, and `readdir` – standard POSIX file operations used by common development tools.

 **Limits** 

For session storage limits including maximum storage size, file count, and directory depth, see [Session storage limits](bedrock-agentcore-limits.md#session-storage-limits).

 **Unsupported operations** 

The following file system operations are not supported:
+  **Hard links** – Use symlinks instead.
+  **Device files, FIFOs, or UNIX sockets** – `mknod` is not supported.
+  **Extended attributes (xattr)** – Tools that depend on xattr metadata are not supported.
+  **fallocate** – Sparse file preallocation is not supported.
+  **File locking across sessions** – Advisory locks work within a running session but are not persisted across stop/resume. Tools that use file-based locking (such as `git`) are unaffected.

**Note**  
Permissions are stored but not enforced within the session. `chmod` and `stat` work correctly, but access checks always succeed because the agent runs as the only user in the microVM.

#### Session storage lifecycle
<a name="session-storage-data-lifecycle"></a>

Session data is deleted (reset to a clean state) in the following scenarios:
+ The session is not invoked for **14 days.** 
+ The agent runtime version is updated. Invoking a session after a version update provisions a fresh file system.

Use [DeleteAgentRuntime](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_DeleteAgentRuntime.html) or [DeleteAgentRuntimeEndpoint](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_DeleteAgentRuntimeEndpoint.html) to delete all session storage data associated with the runtime or endpoint.

### Capacity provider volumes (Instances)
<a name="capacity-provider-volume-how-it-works"></a>

Capacity provider volumes are the managed storage type for runtimes that use the Instances compute type. Instead of specifying storage on the runtime, you define named Amazon EBS volumes on the capacity provider, and the runtime mounts them by logical name. AgentCore creates, attaches, and retains the volumes for you—you don’t provision or mount Amazon EBS volumes yourself.

Like session storage, capacity provider volumes are isolated per session and persist across stop/resume. Because a session on Instances is a dedicated EC2 instance, the volume follows that session’s lifecycle:

1.  **Define volumes on the capacity provider** – When you create the capacity provider, list one or more Amazon EBS volumes in `ec2Configuration.volumes`, each with a logical `name`, `sizeGiB`, and optional `volumeType`, `iops`, `throughput`, encryption, and `snapshotId`.

1.  **Reference a volume from the runtime** – Add a `capacityProviderVolume` entry to `filesystemConfigurations` with the `volumeName` and a `mountPath`.

1.  **Invoke the agent for the first time** – AgentCore creates the Amazon EBS volume and attaches it to the session’s EC2 instance at your mount path.

1.  **Stop the session** – AgentCore terminates the EC2 instance but retains the volume.

1.  **Resume with the same session** – AgentCore provisions a new instance and re-attaches the existing volume, so your data is intact. A restarted session might run on an instance with the latest patches.

The volume is retained across these stops, including when a session reaches its maximum lifetime. It is deleted only when you delete the session, or when you delete the capacity provider (which deletes its sessions and their volumes).

For information about managing the data on these volumes, see [Manage your data on Runtime Instances](runtime-instances-data-management.md).

Agents can share a volume, but sharing is not automatic. For a volume to be mounted for an agent runtime, that runtime must configure the same `capacityProviderVolume` (by `volumeName`) in its own `filesystemConfigurations`. When two such runtimes are invoked with the same `runtimeSessionId`, they run on the same instance and each mounts the shared volume, so they can collaborate on the same files. Configuring `capacityProviderVolume` controls which volumes AgentCore mounts for a runtime; it does not, by itself, isolate data between agents in a session. The isolation boundary is the session. For the session and agent isolation model, see [Security model and permissions for Runtime Instances](runtime-instances-security.md).

The managed session storage and bring-your-own types are not supported on Instances runtimes. These types are `sessionStorage`, `s3FilesAccessPoint`, and `efsAccessPoint`. Specifying any of them alongside `capacityProviderConfiguration` fails with a `ValidationException`. For how to define volumes on a capacity provider and mount them, see [Get started with Instances using the AWS CLI](runtime-instances-get-started-cli.md) and [Persistent storage across sessions](runtime-instances-how-it-works.md#runtime-instances-persistent-volumes).

## Prerequisites for bring-your-own file systems
<a name="_prerequisites_for_bring_your_own_file_systems"></a>

Before you configure a bring-your-own file system, complete the following prerequisites.

### VPC configuration
<a name="_vpc_configuration"></a>

Your agent runtime must use `networkMode: VPC`. The subnets you specify must overlap with the file system mount target Availability Zones.

### IAM permissions
<a name="_iam_permissions"></a>

Your agent runtime execution role must include permissions to mount the file system.

 **IAM permissions for S3 Files** 

```
{
  "Effect": "Allow",
  "Action": [
    "s3files:ClientMount",
    "s3files:ClientWrite",
    "s3files:GetAccessPoint"
  ],
  "Resource": "arn:aws:s3files:<region>:<account-id>:file-system/<file-system-id>",
  "Condition": {
    "ArnEquals": {
      "s3files:AccessPointArn": "arn:aws:s3files:<region>:<account-id>:file-system/<file-system-id>/access-point/<access-point-id>"
    }
  }
}
```

 **IAM permissions for EFS** 

```
{
  "Effect": "Allow",
  "Action": [
    "elasticfilesystem:ClientMount",
    "elasticfilesystem:ClientWrite"
  ],
  "Resource": "arn:aws:elasticfilesystem:<region>:<account-id>:file-system/<file-system-id>",
  "Condition": {
    "ArnEquals": {
      "elasticfilesystem:AccessPointArn": "arn:aws:elasticfilesystem:<region>:<account-id>:access-point/<access-point-id>"
    }
  }
}
```

Omit `ClientWrite` if your agent only needs read access. The `s3files:GetAccessPoint` permission is required for S3 Files access point validation during agent runtime creation.

### Security groups
<a name="_security_groups"></a>

Allow outbound TCP on port 2049 from your agent runtime security group to the mount target security group. Allow inbound TCP on port 2049 on the mount target security group from the agent runtime security group.

## Configure file systems
<a name="_configure_file_systems"></a>

The following sections show how to configure each file system type.

### Configure an Amazon S3 Files access point
<a name="_configure_an_amazon_s3_files_access_point"></a>

To configure an S3 Files access point, specify the access point ARN and mount path in `filesystemConfigurations`. Your agent runtime must use VPC network mode.

**Example**  

1. 

   ```
   aws bedrock-agentcore-control create-agent-runtime \
     --agent-runtime-name "data-agent" \
     --role-arn "arn:aws:iam::<account-id>:role/AgentExecutionRole" \
     --network-configuration '{
       "networkMode": "VPC",
       "networkModeConfig": {
         "subnets": ["<subnet-id-1>", "<subnet-id-2>"],
         "securityGroups": ["<security-group-id>"]
       }
     }' \
     --agent-runtime-artifact '{
       "containerConfiguration": {
         "containerUri": "<account-id>.dkr.ecr.<region>.amazonaws.com/my-agent:latest"
       }
     }' \
     --filesystem-configurations '[{
       "s3FilesAccessPoint": {
         "accessPointArn": "arn:aws:s3files:<region>:<account-id>:file-system/<file-system-id>/access-point/<access-point-id>",
         "mountPath": "/mnt/datasets"
       }
     }]'
   ```

1. Python example using boto3 to create an AgentCore Runtime with an S3 Files access point.

   ```
   import boto3
   
   client = boto3.client("bedrock-agentcore-control", region_name="us-west-2")
   
   response = client.create_agent_runtime(
       agentRuntimeName="data-agent",
       roleArn="arn:aws:iam::<account-id>:role/AgentExecutionRole",
       networkConfiguration={
           "networkMode": "VPC",
           "networkModeConfig": {
               "subnets": ["<subnet-id-1>", "<subnet-id-2>"],
               "securityGroups": ["<security-group-id>"]
           }
       },
       agentRuntimeArtifact={
           "containerConfiguration": {
               "containerUri": "<account-id>.dkr.ecr.<region>.amazonaws.com/my-agent:latest"
           }
       },
       filesystemConfigurations=[
           {
               "s3FilesAccessPoint": {
                   "accessPointArn": "arn:aws:s3files:<region>:<account-id>:file-system/<file-system-id>/access-point/<access-point-id>",
                   "mountPath": "/mnt/datasets"
               }
           }
       ]
   )
   ```

### Configure an Amazon EFS access point
<a name="_configure_an_amazon_efs_access_point"></a>

To configure an EFS access point, specify the access point ARN and mount path in `filesystemConfigurations`. Your agent runtime must use VPC network mode.

**Example**  

1. 

   ```
   aws bedrock-agentcore-control create-agent-runtime \
     --agent-runtime-name "shared-tools-agent" \
     --role-arn "arn:aws:iam::<account-id>:role/AgentExecutionRole" \
     --network-configuration '{
       "networkMode": "VPC",
       "networkModeConfig": {
         "subnets": ["<subnet-id-1>", "<subnet-id-2>"],
         "securityGroups": ["<security-group-id>"]
       }
     }' \
     --agent-runtime-artifact '{
       "containerConfiguration": {
         "containerUri": "<account-id>.dkr.ecr.<region>.amazonaws.com/my-agent:latest"
       }
     }' \
     --filesystem-configurations '[{
       "efsAccessPoint": {
         "accessPointArn": "arn:aws:elasticfilesystem:<region>:<account-id>:access-point/<access-point-id>",
         "mountPath": "/mnt/tools"
       }
     }]'
   ```

1. Python example using boto3 to create an AgentCore Runtime with an EFS access point.

   ```
   import boto3
   
   client = boto3.client("bedrock-agentcore-control", region_name="us-west-2")
   
   response = client.create_agent_runtime(
       agentRuntimeName="shared-tools-agent",
       roleArn="arn:aws:iam::<account-id>:role/AgentExecutionRole",
       networkConfiguration={
           "networkMode": "VPC",
           "networkModeConfig": {
               "subnets": ["<subnet-id-1>", "<subnet-id-2>"],
               "securityGroups": ["<security-group-id>"]
           }
       },
       agentRuntimeArtifact={
           "containerConfiguration": {
               "containerUri": "<account-id>.dkr.ecr.<region>.amazonaws.com/my-agent:latest"
           }
       },
       filesystemConfigurations=[
           {
               "efsAccessPoint": {
                   "accessPointArn": "arn:aws:elasticfilesystem:<region>:<account-id>:access-point/<access-point-id>",
                   "mountPath": "/mnt/tools"
               }
           }
       ]
   )
   ```

### Configure managed session storage
<a name="configure-session-storage"></a>

Add `filesystemConfigurations` with a `sessionStorage` entry when creating or updating an agent runtime.

**Example**  

1. 

   ```
   aws bedrock-agentcore-control create-agent-runtime \
     --agent-runtime-name "coding-agent" \
     --role-arn "arn:aws:iam::111122223333:role/AgentExecutionRole" \
     --agent-runtime-artifact '{
       "containerConfiguration": {
         "containerUri": "123456789012.dkr.ecr.us-west-2.amazonaws.com/my-agent:latest"
       }
     }' \
     --filesystem-configurations '[{
       "sessionStorage": {
         "mountPath": "/mnt/workspace"
       }
     }]'
   ```

1. Python example using boto3 to create an AgentCore Runtime with session storage.

   ```
   import boto3
   
   client = boto3.client("bedrock-agentcore-control", region_name="us-west-2")
   
   response = client.create_agent_runtime(
       agentRuntimeName="coding-agent",
       roleArn="arn:aws:iam::111122223333:role/AgentExecutionRole",
       agentRuntimeArtifact={
           "containerConfiguration": {
               "containerUri": "123456789012.dkr.ecr.us-west-2.amazonaws.com/my-agent:latest"
           }
       },
       filesystemConfigurations=[
           {
               "sessionStorage": {
                   "mountPath": "/mnt/workspace"
               }
           }
       ]
   )
   ```

You can also add session storage to an existing agent runtime using [UpdateAgentRuntime](https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_UpdateAgentRuntime.html) with the same `filesystemConfigurations` parameter.

### Configure a capacity provider volume
<a name="configure-capacity-provider-volume"></a>

To mount a capacity provider volume, first define the volume on the capacity provider. Then reference it by name in `filesystemConfigurations` when you create the agent runtime. This applies to runtimes that use the Instances compute type.

**Example**  

1. Define the volume on the capacity provider (in `ec2Configuration.volumes`) when you create it, then reference it by `volumeName` on the agent runtime.

   ```
   aws bedrock-agentcore-control create-agent-runtime \
     --agent-runtime-name "instances-agent" \
     --role-arn "arn:aws:iam::111122223333:role/AgentRuntimeRole" \
     --agent-runtime-artifact '{
       "containerConfiguration": {
         "containerUri": "111122223333.dkr.ecr.us-west-2.amazonaws.com/my-agent:latest"
       }
     }' \
     --capacity-provider-configuration '{
       "capacityProviderArn": "arn:aws:bedrock-agentcore:us-west-2:111122223333:capacity-provider/my_capacity_provider-a1b2c3d4e5"
     }' \
     --filesystem-configurations '[{
       "capacityProviderVolume": {
         "volumeName": "scratch",
         "mountPath": "/mnt/scratch"
       }
     }]'
   ```

1. Python example using boto3 to create an AgentCore Runtime on Instances with a capacity provider volume.

   ```
   import boto3
   
   client = boto3.client("bedrock-agentcore-control", region_name="us-west-2")
   
   response = client.create_agent_runtime(
       agentRuntimeName="instances-agent",
       roleArn="arn:aws:iam::111122223333:role/AgentRuntimeRole",
       agentRuntimeArtifact={
           "containerConfiguration": {
               "containerUri": "111122223333.dkr.ecr.us-west-2.amazonaws.com/my-agent:latest"
           }
       },
       capacityProviderConfiguration={
           "capacityProviderArn": "arn:aws:bedrock-agentcore:us-west-2:111122223333:capacity-provider/my_capacity_provider-a1b2c3d4e5"
       },
       filesystemConfigurations=[
           {
               "capacityProviderVolume": {
                   "volumeName": "scratch",
                   "mountPath": "/mnt/scratch"
               }
           }
       ]
   )
   ```

The `volumeName` must match a volume defined in the capacity provider’s `ec2Configuration.volumes`. For the steps to define volumes on the capacity provider, see [Get started with Instances using the AWS CLI](runtime-instances-get-started-cli.md).

### Combine file systems
<a name="_combine_file_systems"></a>

You can combine managed session storage with bring-your-own file systems on a single microVM agent runtime. The following example configures all three types.

```
import boto3

client = boto3.client("bedrock-agentcore-control", region_name="us-west-2")

response = client.create_agent_runtime(
    agentRuntimeName="full-stack-agent",
    roleArn="arn:aws:iam::<account-id>:role/AgentExecutionRole",
    networkConfiguration={
        "networkMode": "VPC",
        "networkModeConfig": {
            "subnets": ["<subnet-id-1>", "<subnet-id-2>"],
            "securityGroups": ["<security-group-id>"]
        }
    },
    agentRuntimeArtifact={
        "containerConfiguration": {
            "containerUri": "<account-id>.dkr.ecr.<region>.amazonaws.com/my-agent:latest"
        }
    },
    filesystemConfigurations=[
        {
            "s3FilesAccessPoint": {
                "accessPointArn": "arn:aws:s3files:<region>:<account-id>:file-system/<file-system-id>/access-point/<access-point-id>",
                "mountPath": "/mnt/datasets"
            }
        },
        {
            "efsAccessPoint": {
                "accessPointArn": "arn:aws:elasticfilesystem:<region>:<account-id>:access-point/<access-point-id>",
                "mountPath": "/mnt/tools"
            }
        },
        {
            "sessionStorage": {
                "mountPath": "/mnt/workspace"
            }
        }
    ]
)
```

## Invoke and use persistent storage
<a name="invoke-with-session-storage"></a>

All configured file systems are available at their mount paths when your agent is invoked. Bring-your-own file systems (S3 Files, EFS) are accessible immediately on every invocation. Managed session storage persists data across stop/resume cycles using the same `runtimeSessionId`.

 **Example: Using session storage across stop/resume cycles** 

```
# First invocation — agent sets up the project
aws bedrock-agentcore invoke-agent-runtime \
  --agent-runtime-arn "arn:aws:bedrock-agentcore:us-west-2:111122223333:agent-runtime/coding-agent" \
  --runtime-session-id "session-001" \
  --payload '{"prompt": "Set up the project and install dependencies in /mnt/workspace"}'

# Stop the session
aws bedrock-agentcore stop-runtime-session \
  --agent-runtime-arn "arn:aws:bedrock-agentcore:us-west-2:111122223333:agent-runtime/coding-agent" \
  --runtime-session-id "session-001"

# Resume later — the project is exactly where the agent left it
aws bedrock-agentcore invoke-agent-runtime \
  --agent-runtime-arn "arn:aws:bedrock-agentcore:us-west-2:111122223333:agent-runtime/coding-agent" \
  --runtime-session-id "session-001" \
  --payload '{"prompt": "Run the tests and fix any failures"}'
```

The agent sees `/mnt/workspace` exactly as it left it – source files, installed packages, build artifacts, and .git history are all intact. When you resume a session, the new compute environment mounts the persisted storage. Your agent can continue working without reinstalling packages or regenerating files.

**Note**  
When explicitly calling `StopRuntimeSession` always wait for it to complete before resuming the session. This ensures all data is flushed to durable storage.

**Note**  
The mounted path is available only at the time of agent invocation, not during initialization.

## Limits
<a name="_limits"></a>

The following table lists the limits for file system configurations.


| Resource | Limit | 
| --- | --- | 
| Total file system configurations per agent runtime | 5 | 
| Maximum S3 Files access point configurations | 2 | 
| Maximum EFS access point configurations | 2 | 
| Maximum managed session storage configurations | 1 | 
| Maximum capacity provider volumes | 5 | 

The total-configurations, S3 Files, EFS, and session storage limits apply to microVM runtimes. The capacity provider volume limit is defined on the capacity provider (`ec2Configuration.volumes`) rather than per runtime.

### Mount path constraints
<a name="_mount_path_constraints"></a>

All file system configurations must follow these mount path rules:
+ Must be under `/mnt/` with exactly one subdirectory level (for example, `/mnt/data`, `/mnt/workspace`).
+ Pattern: `/mnt/[a-zA-Z0-9._-]+/?` 
+ Length: 6–200 characters.
+ Each mount path must be unique across all configurations.
+ Mount paths cannot be subdirectories of each other.

## Lifecycle behavior
<a name="_lifecycle_behavior"></a>

The following table compares lifecycle behavior across the managed and bring-your-own file system types.


| Behavior | Managed session storage (Preview, microVM) | Capacity provider volume (Instances) | Bring-your-own (S3 Files, EFS) | 
| --- | --- | --- | --- | 
| Idle expiry | 14 days without invocation – data reset | None – the volume is retained across stops, including when a session reaches its maximum lifetime | None – customer-managed | 
| On runtime version update | Data wiped – fresh file system on next invoke | Data persists – volume re-attached on next invoke | No effect – data persists | 
| On delete | Session data deleted on `DeleteAgentRuntime`  | Volume deleted when you delete the session, or when you delete the capacity provider (which deletes its sessions) | File system unmounted; data preserved in your account | 
| Concurrent access | Isolated per session | Isolated per session; can be shared by agents in the same session when each runtime configures the same volume | Shared across sessions and agents | 
| Ownership | Service-managed by AgentCore | Service-managed by AgentCore (Amazon EBS in your account) | Customer-managed in your AWS account | 

**Important**  
For bring-your-own file systems, ensure your agent handles concurrent access appropriately. Use file-per-session naming patterns or advisory file locks to avoid conflicts.

## Use cases
<a name="session-storage-use-cases"></a>

The following table lists common patterns and the recommended file system configuration for each.


| Pattern | Recommended configuration | 
| --- | --- | 
| Coding agent with persistent project files (microVM) | Managed session storage (Preview) at `/mnt/workspace`  | 
| Persistent workspace for a long-running agent on Instances | Capacity provider volume at `/mnt/workspace`  | 
| Reference datasets accessible from both agents and S3 pipelines | S3 Files access point at `/mnt/datasets`  | 
| Shared tool libraries across all agents | S3 Files or EFS access point at `/mnt/tools`  | 
| Multi-agent collaboration on shared workspace | S3 Files or EFS access point at `/mnt/shared`  | 
| Long-running analysis with checkpoints | Session storage for checkpoints \+ S3 Files for input data | 
| Full-stack agent (both categories combined) | Session storage \+ S3 Files \+ EFS (3 mounts) | 

## Example: Coding agent with persistent workspace
<a name="session-storage-example-coding-agent"></a>

This example shows a coding agent using Strands Agents with `FileSessionManager` for conversation history and session storage for project files. Both persist across stop/resume cycles.

 **Coding agent with session storage** 

```
import os

# Enable non-interactive mode for strands tools
os.environ["BYPASS_TOOL_CONSENT"] = "true"

from strands import Agent
from strands.session import FileSessionManager
from strands.models import BedrockModel
from strands_tools import file_read, file_write, shell
from bedrock_agentcore.runtime import BedrockAgentCoreApp

app = BedrockAgentCoreApp()
WORKSPACE = "/mnt/workspace"

model = BedrockModel(model_id="us.anthropic.claude-sonnet-4-20250514-v1:0")
tools = [file_read, file_write, shell]

@app.entrypoint
def handle_request(payload):
    session_id = payload.get("session_id", "default")

    # Persist conversation history alongside project files
    session_manager = FileSessionManager(
        session_id=session_id,
        storage_dir=f"{WORKSPACE}/.sessions"
    )

    agent = Agent(
        model=model,
        tools=tools,
        session_manager=session_manager,
        system_prompt="You are a coding assistant. Project files are in /mnt/workspace."
    )

    response = agent(str(payload.get("prompt", "")))
    return {"response": response.message["content"][0]["text"]}

if __name__ == "__main__":
    app.run()
```

 **requirements.txt** 

```
strands-agents
strands-agents-tools
bedrock-agentcore
boto3
```

Invoke the agent, stop the session, then resume. Both project files and conversation context persist.

 **Invoke, stop, and resume cycle** 

```
import boto3, json

client = boto3.client("bedrock-agentcore")
agent_arn = "arn:aws:bedrock-agentcore:us-west-2:111122223333:agent-runtime/coding-agent"
session_id = "project-xyz-001"

def invoke(prompt):
    resp = client.invoke_agent_runtime(
        agentRuntimeArn=agent_arn,
        runtimeSessionId=session_id,
        payload=json.dumps({"prompt": prompt, "session_id": "conv-001"}).encode()
    )
    return json.loads(b"".join(resp["response"]))["response"]

# First invoke: Create a simple script
invoke("Write a Python script called calculator.py with add and subtract functions.")

# Stop session — compute terminates, storage persists
client.stop_runtime_session(agentRuntimeArn=agent_arn, runtimeSessionId=session_id)

# Resume same session — new compute, but files and conversation history restored
invoke("Add a multiply function to the script you created.")
# Agent knows it created calculator.py (conversation history)
# AND finds existing file (file persistence)
```

The `FileSessionManager` stores conversation history to `/mnt/workspace/.sessions/`, enabling the agent to remember context across stop/resume cycles.

## Networking requirements
<a name="session-storage-networking"></a>

This section covers networking requirements for both managed session storage and bring-your-own file systems.

### Managed session storage networking
<a name="_managed_session_storage_networking"></a>

If your agent runtime uses VPC mode with session storage, the agent needs network access to sync with remote storage. Session data is stored in AgentCore S3, so your VPC must allow outbound connectivity to S3. If you are using an S3 Gateway endpoint with a custom policy, you can scope access to your regional session storage bucket as follows:

```
"Action": [
    "s3:GetObject",
    "s3:PutObject",
    "s3:ListBucket"
],
"Resource": [
    "arn:aws:s3:::acr-storage-*-region-an",
    "arn:aws:s3:::acr-storage-*-region-an/*"
],
"Condition": {
    "StringEquals": {
        "aws:PrincipalServiceName": "bedrock-agentcore.amazonaws.com"
    }
}
```

Replace {{region}} with your AWS Region (for example, `us-west-2`).

### Bring-your-own file system networking
<a name="file-system-mount-networking-requirements"></a>

Bring-your-own file systems require your VPC networking to meet the following requirements for successful mounts.

#### Amazon EFS
<a name="_amazon_efs"></a>
+  **Mount targets** – Your EFS file system must have mount targets in at least one of the Availability Zones where your agent runtime subnets are located. Mount targets in all configured subnet Availability Zones is recommended for high availability.
+  **One VPC at a time** – EFS file systems can have mount targets in only one VPC at a time. Cross-account VPC mounting is not supported for AgentCore.
+  **Availability Zone alignment** – Agent runtime subnets and EFS mount targets must share at least one common Availability Zone. Cross-AZ NFS traffic works but adds latency and data transfer costs.
+  **DNS resolution** – Your VPC must have DNS hostnames and DNS resolution enabled. The agent resolves the mount target hostname `<az-id>.<file-system-id>.efs.<region>.amazonaws.com` at mount time.

To check your EFS mount targets:

```
aws efs describe-mount-targets --file-system-id fs-0123456789abcdef0 --region us-west-2
```

For complete information on EFS mount targets, see [How Amazon EFS works](https://docs.aws.amazon.com/efs/latest/ug/how-it-works.html).

#### Amazon S3 Files
<a name="_amazon_s3_files"></a>
+  **Mount targets** – Your S3 Files file system must have mount targets in the same VPC as the agent runtime. Mount targets must be in at least one of the same Availability Zones as your agent runtime subnets.
+  **One mount target per AZ** – Each Availability Zone can have at most one S3 Files mount target.
+  **Same VPC** – S3 Files mount targets must be in the same VPC as the agent runtime. Cross-VPC file system access is not supported.
+  **DNS resolution** – Your VPC must resolve the S3 Files mount target hostname `<az-id>.<file-system-id>.s3files.<region>.on.aws` at mount time. Ensure DNS resolution is enabled in your VPC settings.

To check your S3 Files mount targets:

```
aws s3files list-mount-targets --file-system-id fs-0123456789abcdef0 --region us-west-2
```

For complete information on S3 Files mounting, see [Mounting S3 file systems](https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-files-mounting.html).

#### Shared requirements
<a name="_shared_requirements"></a>


| Requirement | EFS | S3 Files | 
| --- | --- | --- | 
| VPC mode required | ✓ | ✓ | 
| NFS port 2049 (TCP) | ✓ | ✓ | 
| Mount targets in same AZ | ✓ (recommended) | ✓ (required) | 
| Same VPC | ✓ | ✓ | 
| Same AWS account | ✓ | ✓ | 
| DNS resolution enabled | ✓ | ✓ | 
| Cross-account VPC | ✗ Not supported | ✗ Not supported | 

**Important**  
Cross-account VPC configurations are not supported. The file system resources (file system, access points, mount targets) and the agent runtime must be in the same AWS account and VPC.

#### How AgentCore mounts file systems
<a name="_how_agentcore_mounts_file_systems"></a>

AgentCore handles the NFS mount operation inside the microVM automatically:
+  **EFS** – Mounted via NFSv4.1 over TLS (port 2049). IAM authentication is used when the execution role has `elasticfilesystem:ClientMount` permission with an `AccessPointArn` condition.
+  **S3 Files** – Mounted via NFSv4.2 over TLS with mandatory IAM authentication. TLS and IAM are always enabled and cannot be disabled for S3 Files.

You do not need to install `amazon-efs-utils`, configure `/etc/fstab`, or manage TLS certificates. The microVM runtime handles all mount operations, credential rotation, and health monitoring.

#### Subnet and Availability Zone selection
<a name="_subnet_and_availability_zone_selection"></a>

When you configure both VPC subnets and file system configurations on an agent runtime, select subnets that overlap with your file system mount target Availability Zones.

To identify the Availability Zone ID of your subnets:

```
aws ec2 describe-subnets \
  --subnet-ids subnet-0123456789abcdef0 \
  --query 'Subnets[0].AvailabilityZoneId'
```

To identify the Availability Zone of your EFS mount targets:

```
aws efs describe-mount-targets \
  --file-system-id fs-0123456789abcdef0 \
  --query 'MountTargets[*].[AvailabilityZoneId, LifeCycleState]' \
  --output table
```

Ensure your agent runtime subnets are in Availability Zones where your file system has mount targets.

For supported Availability Zones by region, see the [Supported Availability Zones](agentcore-vpc.md#agentcore-supported-azs) in the VPC configuration topic. For security group configuration, see [Example: Connecting to Amazon EFS or Amazon S3 Files](agentcore-vpc.md#agentcore-security-groups-filesystem).

## Troubleshoot bring-your-own file system mounts
<a name="_troubleshoot_bring_your_own_file_system_mounts"></a>

When a bring-your-own file system mount fails, `InvokeAgentRuntime` returns HTTP 424 (Failed Dependency).


| Symptom | Likely cause | Quick fix | 
| --- | --- | --- | 
| "Access denied" | Execution role missing `ClientMount` or `ClientWrite`  | Add IAM permissions with `AccessPointArn` condition | 
| "ResourceNotFound" or "Failed to resolve" | Access point or mount target deleted or unavailable | Verify ARN exists and mount targets are Available | 
| Mount hangs then fails (\~30s) | Security group blocking port 2049 or no mount target in agent’s Availability Zone | Allow TCP 2049; verify Availability Zone overlap | 
| "Permission denied" on writes | Missing `ClientWrite` or POSIX UID/GID mismatch | Add write permission or align access point POSIX user | 

Each mount has a 30-second timeout. All configured file systems mount in parallel – a single failure causes the entire invocation to fail.

For more information, see [Troubleshoot BYO storage](runtime-troubleshooting.md#troubleshoot-byo-storage-access-denied).