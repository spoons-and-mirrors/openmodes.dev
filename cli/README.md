# OpenModes CLI

A command-line interface for installing and managing OpenCode agents from the OpenModes registry.

## Usage

```bash
npx openmodes <command> <agent-name> [options]
```

## Commands

### List

List all available agents from the OpenModes registry.

```bash
npx openmodes list [options]
```

**Options:**

- `--dev, -d` - Use development server (localhost:5173)
- `--sort-by <field>` - Sort by: `votes`, `downloads`, `date`, `name`
- `--sort-order <order>` - Sort order: `asc`, `desc` (default: desc)
- `--versions, -v` - Show all version numbers instead of latest 5

**Examples:**

```bash
npx openmodes list
npx openmodes list --dev
npx openmodes list --sort-by votes --sort-order desc
npx openmodes list -v
npx openmodes list --sort-by downloads -v
```

**Output:**

- Shows agent name, author, votes, downloads, and version information
- **Default behavior**: shows latest 5 versions like `Versions: v1.0, v1.1, v2.0`
- **With many versions**: shows `Versions: v3.0, v3.1, v4.0, v4.1, v5.0... (+3 older)`
- **With `-v/--versions`**: shows all versions like `Versions: v1.0, v1.1, v2.0, v3.0, v3.1, v4.0, v4.1, v5.0`
- **Smart prompting**: Only shows "Use the --versions flag (-v) to see older versions" when there are more than 5 versions

### View

View detailed information about an agent without installing it.

```bash
npx openmodes view <agent-name> [options]
```

**Options:**

- `--dev, -d` - Use development server (localhost:5173)

**Examples:**

```bash
npx openmodes view archie
npx openmodes view archie --dev
```

**Output includes:**

- Basic info (name, version, author, description)
- Stats (votes, downloads, last updated)
- Configuration (model, temperature)
- Tools (built-in and MCP tools)
- Instructions and resources
- Prompt preview (truncated if long)

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
npx openmodes install archie@1.4
npx openmodes install archie --dev -g -y
npx openmodes install archie mode1 mode2
```

### Remove

```bash
npx openmodes remove <agent-name> [-g|--global]
```

**Examples:**

```bash
npx openmodes remove archie
npx openmodes remove archie mode1 --global
```

## File Structure

**Local:** `.opencode/agent/{agent-name}.md` and `.opencode/prompts/{agent-name}/`
**Global:** `~/.config/opencode/agent/{agent-name}.md` and `~/.config/opencode/prompts/{agent-name}/`

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
- If a requested version doesn't exist, it's listed in the `not_found` array
- Version syntax uses `@` (e.g., `mode@1.0`)
- Mode names are now globally unique, preventing conflicts

## Notes

- Agents are fetched from [openmodes.dev](https://openmodes.dev)
- Use `--dev` for local development server testing
- Existing agents require confirmation to overwrite (unless using `-y`)
- The `list` command shows version counts by default; use `--versions` to see actual version numbers
