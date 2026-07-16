# Structured Output Rules

Return exactly one valid JSON object that conforms to the role-specific schema supplied in the request. Use only schema fields. Do not add commentary, Markdown, code fences, or fields containing hidden reasoning.

Use concise, participant-facing explanations. When referencing a transcript item, use only the supplied message identifier. Do not invent identifiers or URLs.

If the request cannot be safely or reliably fulfilled, return the schema’s safe/limited response form where available. Do not output malformed JSON or substitute prose for the required object.
