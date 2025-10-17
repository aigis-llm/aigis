<script lang="ts">
	import type { FocusTarget, FocusTrap } from "focus-trap"
	import { onMount } from "svelte"
	import { MediaQuery } from "svelte/reactivity"
	import { createFocusTrap } from "focus-trap"
	import { afterNavigate } from "$app/navigation"
	import { authClient } from "$lib/auth_client"

	const session = authClient.useSession()
	const mq = new MediaQuery("(min-width: 640px)")
	let opened = $state(true)
	const mobile = $derived(!mq.current)
	let ft: FocusTrap

	onMount(() => {
		opened = !mobile
		const trapElem = document.querySelector("#menu") as HTMLElement
		ft = createFocusTrap(trapElem, {
			fallbackFocus: trapElem.firstChild as FocusTarget,
			allowOutsideClick: true,
			onDeactivate: () => {
				opened = false
			},
		})
	})

	function toggleOpened() {
		opened = !opened
		if (mobile && opened) {
			ft.activate()
		}
	}

	afterNavigate(() => {
		ft.deactivate()
	})
</script>

<nav>
	<div class="hamburger">
		<button
			class="i-tabler:menu-2 {opened ? "i-tabler:x" : ""}"
			onclick={toggleOpened}
			aria-expanded={opened}
			aria-controls="menu"
			aria-haspopup="menu"
		>
			Hamburger
		</button>
		<a href="/">Aigis</a>
	</div>
	<div class="menu-div" data-hidden={!opened}>
		<ul id="menu" role="menu">
			<li role="menuitem">
				<a href="/">Home</a>
			</li>
			{#if $session.data}
				<li role="menuitem">
					<a href="/auth/logout">Log out</a>
				</li>
			{:else}
				<li role="menuitem">
					<a href="/auth/login">Log in</a>
				</li>
				<li role="menuitem">
					<a href="/auth/signup">Sign up</a>
				</li>
			{/if}
		</ul>
	</div>
</nav>

<style>
	nav {
		background-color: var(--ctp-surface0);
		height: auto;
		width: 100%;
		display: flex;
		flex-direction: column;
		.hamburger {
			flex-direction: row;
			align-items: center;
			@media (min-width: 640px) {
				display: none;
				border-style: none;
				color: transparent;
			}
			button {
				height: 32px !important;
				width: 32px !important;
				flex-shrink: 0;
				flex-grow: 0;
			}
			a {
				position: absolute;
				inset: 0;
				margin-left: auto;
				margin-right: auto;
				height: 32px;
				width: 2.5rem;
				padding-top: 0.25rem;
				padding-bottom: 0.25rem;
				color: var(--ctp-text);
				text-decoration: none;
			}
		}
		.menu-div {
			z-index: 10;
			grid-column: auto;
			width: auto;
			display: flex;
			flex-direction: column;
			align-content: center;
			justify-content: center;
			background-color: var(--ctp-surface1);
			padding-left: 0.5rem;
			padding-right: 0.5rem;
			padding-top: 0.25rem;
			padding-bottom: 0.25rem;
			&:focus {
				outline: 2px solid transparent;
				outline-offset: 2px;
			}
			&[data-hidden="true"] {
				display: none;
			}
			@media (min-width: 640px) {
				grid-row: auto;
				display: block !important;
				flex-direction: row;
				background-color: transparent;
			}
			#menu {
				padding-left: 0px;
				display: flex;
				flex-direction: column;
				list-style-type: none;
				@media (min-width: 640px) {
					flex-direction: row;
				}
				a {
					padding: 0.25rem;
					color: var(--ctp-text);
					text-decoration: none;
				}
			}
		}
	}
</style>
