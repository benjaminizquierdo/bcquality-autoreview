# bcquality-autoreview

Mod de Claude Code para proyectos AL de Business Central. Cuando Claude crea o modifica un archivo `.al`, le pide que al terminar revise esos cambios con las reglas de [microsoft/BCQuality](https://github.com/microsoft/BCQuality) (skill `al-code-review`). Después corrige los problemas confirmados y explica el resto, con referencias.

Solo actúa sobre lo que edita Claude, no sobre lo que editas tú a mano. Para revisar tus propios cambios, pídelo ("revisa con BCQuality") o usa el plugin oficial de BCQuality.

## Instalación

Necesitas Claude Code reciente y git.

1. Instala el mod desde este repositorio de GitHub:

   ```bash
   claude plugin marketplace add <usuario>/bcquality-autoreview
   ```

   ```bash
   claude plugin install bcquality-autoreview@bcquality-autoreview
   ```

2. Descarga las reglas de BCQuality en tu carpeta de usuario. El mod las busca en `C:\Users\<usuario>\BCQuality`; si no están ahí, las lee de GitHub cada vez, que es más lento y no funciona si un proxy bloquea GitHub.

   ```bash
   git clone https://github.com/microsoft/BCQuality "C:/Users/<usuario>/BCQuality"
   ```

3. Abre una conversación nueva de Claude Code. También sirve el modo Claude de GitHub Copilot en VS Code (**Session Target → Claude**).

Para actualizar el mod:

```bash
claude plugin marketplace update bcquality-autoreview
```

```bash
claude plugin update bcquality-autoreview@bcquality-autoreview
```

Para actualizar las reglas de BCQuality:

```bash
git -C "C:/Users/<usuario>/BCQuality" pull
```

## Opciones

- `path`: carpeta del clon de BCQuality, si no está en `C:\Users\<usuario>\BCQuality`. Se cambia en el menú de configuración de Claude Code o en `settings.json`, en `"pluginConfigs": { "bcquality-autoreview@bcquality-autoreview": { "options": { "path": "D:/BCQuality" } } }`.

## Desarrollo

Para trabajar sobre una copia local, añade su carpeta a `CLAUDE_CODE_PLUGIN_DIRS` en `~/.claude/settings.json` (rutas separadas por `;` en Windows). No la instales también desde el marketplace en ese ordenador, o tendrás dos copias.

- Pruebas: `claude plugin test` en esta carpeta.
- Comprobar el mod: `claude plugin validate .`
- Antes de publicar cambios, sube `version` en `.claude-plugin/plugin.json` y en `.claude-plugin/marketplace.json`.
