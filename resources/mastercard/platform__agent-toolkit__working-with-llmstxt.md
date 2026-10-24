# Working with llms.txt
source: https://developer.mastercard.com/platform/documentation/agent-toolkit/working-with-llmstxt/index.md

The `llms.txt` file format is an emerging standard in the AI development community for providing machine-readable documentation specifically optimized for Large Language Models (LLMs).

### Why llms.txt Matters {#why-llmstxt-matters}

Traditional documentation is designed for human consumption, but AI agents and LLMs benefit from structured, comprehensive text that can be easily processed and referenced. The llms.txt format addresses several key challenges:

* **Context Optimization**: Provides complete context in a single file, eliminating the need for multiple API calls or web scraping
* **Consistency**: Ensures AI agents have access to the same, up-to-date information across all interactions
* **Efficiency**: Reduces latency and complexity in AI applications by providing pre-processed, structured content
* **Accuracy**: Minimizes hallucinations by giving LLMs authoritative source material to reference

### Our Implementation {#our-implementation}

Our `llms.txt` and `llms-full.txt` files are comprehensive, machine-readable export of our entire API documentation in structured markdown format. This file is specifically designed for use with Large Language Models (LLMs) and agentic development tools, providing developers with a single, consolidated resource containing all public product information, code samples, API references, and documentation.

### What's Included in llms.txt {#whats-included-in-llmstxt}

The `llms.txt` file contains:

* A high-level summary of all Mastercard Developer products and services
* Service names and brief descriptions
* Direct links to detailed markdown documentation for each service
* Structured in plain markdown format for easy AI consumption
* Optimized for quick discovery and integration support by LLMs and AI tools

#### Accessing llms.txt {#accessing-llmstxt}

Click [llms.txt](https://developer.mastercard.com/llms.txt) to access the file. The llms.txt file is automatically updated whenever the documentation changes.

### What's Included in llms-full.txt {#whats-included-in-llms-fulltxt}

The `llms-full.txt` file contains the entire documentation content for a specific Mastercard service, which includes:

* Feature descriptions, use cases, and best practices
* A detailed quick start guide
* Complete API reference with all the endpoints, parameters, request/response examples
* Working code samples in multiple programming languages
* Step-by-step integration tutorials
* Schema definitions with complete data models and validation rules
* Comprehensive error codes and troubleshooting guides

#### Accessing llms-full.txt {#accessing-llms-fulltxt}

The `llms-full.txt` file is located at the bottom of the side navigation menu under **LLM Resources** within the service's documentation and stays automatically updated with the latest content.

### Plain Text Docs {#plain-text-docs}

You can access all of our documentation as plain text markdown files by adding `/index.md` to the end of any documentation url. For example, you can find the plain text version of this page itself at <https://developer.mastercard.com/platform/documentation/agent-toolkit/index.md>.

This helps AI tools and agents to parse our content and makes it easy to copy and paste the contents of a document into an LLM. This format is preferable to scraping or copying from our HTML and JavaScript-rendered pages because:

* Plain text contains fewer formatting tokens
* Hidden or tabbed content is fully rendered in the markdown version
* Markdown structure (like headings and lists) helps LLMs understand context and hierarchy
