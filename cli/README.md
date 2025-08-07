# OpenModes CLI

A command-line interface for installing and managing OpenCode agents from the OpenModes registry.

## Usage

```bash
npx openmodes <command> <agent-name> [options]
```

## Commands

### Install

```bash
npx openmodes install <agent-name> [options]
```

**Options:**

- `--dev, -d` - Use development server (localhost:5173)
- `-g, --global` - Install to `~/.config/opencode/` instead of `.opencode/`
- `-y, --yes` - Overwrite existing agent without confirmation

**Examples:**

```bash
npx openmodes install archie
npx openmodes install archie --dev -g -y
```

### Remove

```bash
npx openmodes remove <agent-name> [-g|--global]
```

## File Structure

**Local:** `.opencode/mode/{agent-name}.md` and `.opencode/prompts/{agent-name}/`
**Global:** `~/.config/opencode/mode/{agent-name}.md` and `~/.config/opencode/prompts/{agent-name}/`

Agent names with special characters (like `@`) are sanitized for filesystem use (e.g., `agent@1.3` becomes `agent-1-3`).

## API Versioning

Mode names are globally unique. You can fetch the latest or a specific version of a mode using the API:

- Latest version: `/api/{mode-name}`
- Specific version: `/api/{mode-name}@{version}`
- Multiple modes/versions: `/api/{mode-name1}@{version1}&{mode-name2}@{version2}`
- Mixed: `/api/{mode-name1}&{mode-name2}@{version2}`

**Examples:**

- `/api/my-mode` — Latest approved version of "my-mode"
- `/api/my-mode@1.0` — Version 1.0 of "my-mode"
- `/api/my-mode@1.0&another-mode@2.1` — Specific versions of both modes
- `/api/my-mode&another-mode@2.1` — Latest of "my-mode", version 2.1 of "another-mode"

**Notes:**

- Only approved versions are returned
- If a requested version doesn’t exist, it’s listed in the `not_found` array
- Version syntax uses `@` (e.g., `mode@1.0`)
- Mode names are now globally unique, preventing conflicts

## Notes

- Agents are fetched from [openmodes.dev](https://openmodes.dev)
- Use `--dev` for local development server testing
- Existing agents require confirmation to overwrite (unless using `-y`)
