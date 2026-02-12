# Execution Layer Guidelines

This directory (`agents/execution/`) contains the **deterministic tools** used by the agent system.

## Principles
1. **Determinism**: Given the same inputs, these scripts must produce the same outputs.
2. **Single Responsibility**: Each script should do one thing well.
3. **No Business Logic**: Decision-making belongs in Directives (`agents/directives/`). These scripts are for *doing*, not *deciding*.
4. **Error Handling**: Fail fast and loudly. Return clear error messages that the Agent can read to self-anneal.

## Development
- Place new scripts here.
- Use `.env` for all secrets (API keys, tokens).
- Ensure scripts are runnable from the project root.
- Include a `if __name__ == "__main__":` block for testing.

## Example
```python
# agents/execution/example_tool.py
import sys

def main():
    # ... implementation ...
    pass

if __name__ == "__main__":
    main()
```
