# Aigis LLM Assistant

WIP!!!

## Prerequisites

[Lix (Reccomended)](https://lix.systems/) or [Nix](https://nixos.org/).
[Direnv](https://direnv.net/).
An OpenAI-compatible LLM server, like [LocalAI](https://localai.io/).

## Developing

### First Steps

Run `direnv allow .`. This will take a bit of time as it installs a lot of Nix packages.
Run `just install` to set up the proper js environment.
Copy [`.env.example`](.env.example) to `.env` and make any changes needed.

### Developing

Run `just dev` to start the dev server.
