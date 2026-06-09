# Mail4ai Use Cases

Mail4ai is useful when an AI agent needs to communicate through email instead
of a custom UI, chat channel or proprietary workflow tool.

## Document Intake Agent

A user sends an email with a PDF, contract, spreadsheet or form attached.

The agent receives the wake-up event, fetches the message through Mail4ai MCP,
retrieves allowed attachments and processes the document. It can then reply with
a summary, ask for missing information or trigger the next workflow step.

## Customer Support Agent

An agent receives a support request by email.

It can classify the issue, extract relevant details, ask for missing context and
escalate to a human when confidence is low or policy requires review. Email keeps
the workflow compatible with existing support operations and user habits.

## Multi-Agent Workflow

One agent receives a request and delegates part of the task to another
specialized agent with its own inbox.

Each agent can operate asynchronously, exchange files and preserve an auditable
communication trail through standard email messages.

## Back-Office Automation

An agent receives invoices, purchase orders, contracts, HR forms or operational
spreadsheets.

The runtime can wake on new mail, fetch the content through MCP and connect the
result to internal approval, extraction or routing workflows.

## Human-In-The-Loop Process

An agent needs a validation, clarification or missing file before continuing.

It can send an email to the user or operator, wait asynchronously for the reply
and resume processing when Mail4ai delivers the next verified notification.
