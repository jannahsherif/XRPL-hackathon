Defined in: [src/models/bedrock.ts:183](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/models/bedrock.ts#L183)

Redaction configuration for Bedrock guardrails. Controls whether and how blocked content is replaced.

## Properties

### input?

```ts
optional input?: boolean;
```

Defined in: [src/models/bedrock.ts:185](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/models/bedrock.ts#L185)

Redact input when blocked.

#### Default Value

```ts
true
```

---

### inputMessage?

```ts
optional inputMessage?: string;
```

Defined in: [src/models/bedrock.ts:188](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/models/bedrock.ts#L188)

Replacement message for redacted input.

#### Default Value

```ts
'[User input redacted.]'
```

---

### output?

```ts
optional output?: boolean;
```

Defined in: [src/models/bedrock.ts:191](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/models/bedrock.ts#L191)

Redact output when blocked.

#### Default Value

```ts
false
```

---

### outputMessage?

```ts
optional outputMessage?: string;
```

Defined in: [src/models/bedrock.ts:194](https://github.com/strands-agents/harness-sdk/blob/main/strands-ts/src/models/bedrock.ts#L194)

Replacement message for redacted output.

#### Default Value

```ts
'[Assistant output redacted.]'
```