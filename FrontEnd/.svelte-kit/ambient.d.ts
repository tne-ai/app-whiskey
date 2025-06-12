
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const AUTOJUMP_ERROR_PATH: string;
	export const OP_PLUGIN_ALIASES_SOURCED: string;
	export const ZNT_CONFIG_DIR: string;
	export const TERM_PROGRAM: string;
	export const DEEPSEEK_API_KEY: string;
	export const NODE: string;
	export const REPLICATE_API_KEY: string;
	export const INIT_CWD: string;
	export const LAMINI_API_KEY: string;
	export const ASDF_INSTALL_TYPE: string;
	export const AUTOJUMP_SOURCED: string;
	export const _P9K_TTY: string;
	export const TERM: string;
	export const MAKEFLAGS: string;
	export const HOMEBREW_REPOSITORY: string;
	export const TMPDIR: string;
	export const VITE_DB_HOST: string;
	export const npm_config_global_prefix: string;
	export const GOOGLE_DRIVE_CLIENT_ID: string;
	export const GROQ_API_KEY: string;
	export const MODEL_API_KEY: string;
	export const TERM_PROGRAM_VERSION: string;
	export const DIRENV_DIR: string;
	export const ZNT_REPO_DIR: string;
	export const ZPFX: string;
	export const VITE_OPEN_API_KEY: string;
	export const COLOR: string;
	export const TERM_SESSION_ID: string;
	export const npm_config_noproxy: string;
	export const npm_config_local_prefix: string;
	export const ZSH: string;
	export const PMSPEC: string;
	export const ASDF_INSTALL_PATH: string;
	export const USER: string;
	export const ZSH_TMUX_TERM: string;
	export const LS_COLORS: string;
	export const WS_DIR: string;
	export const VITE_AWS_SECRET: string;
	export const OPENAI_API_KEY: string;
	export const COMMAND_MODE: string;
	export const ASDF_INSTALL_VERSION: string;
	export const npm_config_globalconfig: string;
	export const OLLAMA_KV_CACHE_TYPE: string;
	export const MAKE_TERMOUT: string;
	export const ENV: string;
	export const _ZSH_TMUX_FIXED_CONFIG: string;
	export const SSH_AUTH_SOCK: string;
	export const OLLAMA_FLASH_ATTENTION: string;
	export const JUPYTERLAB_TOKEN: string;
	export const __CF_USER_TEXT_ENCODING: string;
	export const npm_execpath: string;
	export const TERM_FEATURES: string;
	export const MAKELEVEL: string;
	export const PAGER: string;
	export const ZSH_TMUX_CONFIG: string;
	export const DIRENV_WATCHES: string;
	export const MFLAGS: string;
	export const LSCOLORS: string;
	export const VITE_DB_USER: string;
	export const TERMINFO_DIRS: string;
	export const IT2_BASH_UNEXPORT_HISTFILE: string;
	export const PATH: string;
	export const npm_package_json: string;
	export const LaunchInstanceID: string;
	export const VITE_DB_NAME: string;
	export const _: string;
	export const npm_config_userconfig: string;
	export const npm_config_init_module: string;
	export const MODEL_API_URL: string;
	export const __CFBundleIdentifier: string;
	export const npm_command: string;
	export const VITE_DB_PASSWORD: string;
	export const PWD: string;
	export const VITE_ENDPOINT: string;
	export const OPENROUTER_API_KEY: string;
	export const JAVA_HOME: string;
	export const npm_lifecycle_event: string;
	export const P9K_SSH: string;
	export const AWS_SECRET_ACCESS_KEY: string;
	export const EDITOR: string;
	export const npm_package_name: string;
	export const LANG: string;
	export const P9K_TTY: string;
	export const ITERM_PROFILE: string;
	export const CLOUDSDK_HOME: string;
	export const npm_config_npm_version: string;
	export const XPC_FLAGS: string;
	export const ITERM_ORIG_PS1: string;
	export const DIRHISTORY_SIZE: string;
	export const ANTHROPIC_API_KEY: string;
	export const npm_config_node_gyp: string;
	export const npm_package_version: string;
	export const XPC_SERVICE_NAME: string;
	export const DIRENV_FILE: string;
	export const GEMINI_API_KEY: string;
	export const AWS_ACCESS_KEY_ID: string;
	export const HOME: string;
	export const GOOGLE_DRIVE_API_KEY: string;
	export const JDK_HOME: string;
	export const SHLVL: string;
	export const COLORFGBG: string;
	export const LC_TERMINAL_VERSION: string;
	export const ITERM_PREV_PS1: string;
	export const HOMEBREW_PREFIX: string;
	export const IT2_BASH_INJECT: string;
	export const ZSH_CACHE_DIR: string;
	export const VITE_DB_SSL: string;
	export const ASDF_DATA_DIR: string;
	export const ITERM_SESSION_ID: string;
	export const npm_config_cache: string;
	export const VITE_DB_PORT: string;
	export const LESS: string;
	export const LOGNAME: string;
	export const WEBUI_SECRET_KEY: string;
	export const npm_lifecycle_script: string;
	export const MAKE_TERMERR: string;
	export const VISUAL: string;
	export const FZF_DEFAULT_COMMAND: string;
	export const npm_config_user_agent: string;
	export const HOMEBREW_CELLAR: string;
	export const INFOPATH: string;
	export const LC_TERMINAL: string;
	export const _P9K_SSH_TTY: string;
	export const DISPLAY: string;
	export const DIRENV_DIFF: string;
	export const VITE_AWS_KEY: string;
	export const HF_TOKEN: string;
	export const SECURITYSESSIONID: string;
	export const HISTFILE: string;
	export const npm_node_execpath: string;
	export const npm_config_prefix: string;
	export const COLORTERM: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		AUTOJUMP_ERROR_PATH: string;
		OP_PLUGIN_ALIASES_SOURCED: string;
		ZNT_CONFIG_DIR: string;
		TERM_PROGRAM: string;
		DEEPSEEK_API_KEY: string;
		NODE: string;
		REPLICATE_API_KEY: string;
		INIT_CWD: string;
		LAMINI_API_KEY: string;
		ASDF_INSTALL_TYPE: string;
		AUTOJUMP_SOURCED: string;
		_P9K_TTY: string;
		TERM: string;
		MAKEFLAGS: string;
		HOMEBREW_REPOSITORY: string;
		TMPDIR: string;
		VITE_DB_HOST: string;
		npm_config_global_prefix: string;
		GOOGLE_DRIVE_CLIENT_ID: string;
		GROQ_API_KEY: string;
		MODEL_API_KEY: string;
		TERM_PROGRAM_VERSION: string;
		DIRENV_DIR: string;
		ZNT_REPO_DIR: string;
		ZPFX: string;
		VITE_OPEN_API_KEY: string;
		COLOR: string;
		TERM_SESSION_ID: string;
		npm_config_noproxy: string;
		npm_config_local_prefix: string;
		ZSH: string;
		PMSPEC: string;
		ASDF_INSTALL_PATH: string;
		USER: string;
		ZSH_TMUX_TERM: string;
		LS_COLORS: string;
		WS_DIR: string;
		VITE_AWS_SECRET: string;
		OPENAI_API_KEY: string;
		COMMAND_MODE: string;
		ASDF_INSTALL_VERSION: string;
		npm_config_globalconfig: string;
		OLLAMA_KV_CACHE_TYPE: string;
		MAKE_TERMOUT: string;
		ENV: string;
		_ZSH_TMUX_FIXED_CONFIG: string;
		SSH_AUTH_SOCK: string;
		OLLAMA_FLASH_ATTENTION: string;
		JUPYTERLAB_TOKEN: string;
		__CF_USER_TEXT_ENCODING: string;
		npm_execpath: string;
		TERM_FEATURES: string;
		MAKELEVEL: string;
		PAGER: string;
		ZSH_TMUX_CONFIG: string;
		DIRENV_WATCHES: string;
		MFLAGS: string;
		LSCOLORS: string;
		VITE_DB_USER: string;
		TERMINFO_DIRS: string;
		IT2_BASH_UNEXPORT_HISTFILE: string;
		PATH: string;
		npm_package_json: string;
		LaunchInstanceID: string;
		VITE_DB_NAME: string;
		_: string;
		npm_config_userconfig: string;
		npm_config_init_module: string;
		MODEL_API_URL: string;
		__CFBundleIdentifier: string;
		npm_command: string;
		VITE_DB_PASSWORD: string;
		PWD: string;
		VITE_ENDPOINT: string;
		OPENROUTER_API_KEY: string;
		JAVA_HOME: string;
		npm_lifecycle_event: string;
		P9K_SSH: string;
		AWS_SECRET_ACCESS_KEY: string;
		EDITOR: string;
		npm_package_name: string;
		LANG: string;
		P9K_TTY: string;
		ITERM_PROFILE: string;
		CLOUDSDK_HOME: string;
		npm_config_npm_version: string;
		XPC_FLAGS: string;
		ITERM_ORIG_PS1: string;
		DIRHISTORY_SIZE: string;
		ANTHROPIC_API_KEY: string;
		npm_config_node_gyp: string;
		npm_package_version: string;
		XPC_SERVICE_NAME: string;
		DIRENV_FILE: string;
		GEMINI_API_KEY: string;
		AWS_ACCESS_KEY_ID: string;
		HOME: string;
		GOOGLE_DRIVE_API_KEY: string;
		JDK_HOME: string;
		SHLVL: string;
		COLORFGBG: string;
		LC_TERMINAL_VERSION: string;
		ITERM_PREV_PS1: string;
		HOMEBREW_PREFIX: string;
		IT2_BASH_INJECT: string;
		ZSH_CACHE_DIR: string;
		VITE_DB_SSL: string;
		ASDF_DATA_DIR: string;
		ITERM_SESSION_ID: string;
		npm_config_cache: string;
		VITE_DB_PORT: string;
		LESS: string;
		LOGNAME: string;
		WEBUI_SECRET_KEY: string;
		npm_lifecycle_script: string;
		MAKE_TERMERR: string;
		VISUAL: string;
		FZF_DEFAULT_COMMAND: string;
		npm_config_user_agent: string;
		HOMEBREW_CELLAR: string;
		INFOPATH: string;
		LC_TERMINAL: string;
		_P9K_SSH_TTY: string;
		DISPLAY: string;
		DIRENV_DIFF: string;
		VITE_AWS_KEY: string;
		HF_TOKEN: string;
		SECURITYSESSIONID: string;
		HISTFILE: string;
		npm_node_execpath: string;
		npm_config_prefix: string;
		COLORTERM: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
