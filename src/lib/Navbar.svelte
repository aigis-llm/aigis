<script lang="ts">
	import { browser } from "$app/environment"
	import { onMount } from "svelte"
	import { createFocusTrap, type FocusTarget, type FocusTrap } from "focus-trap"
	import { afterNavigate } from "$app/navigation"

	let opened = $state(true)
	let mobile = $state(true)
	let ft: FocusTrap

	onMount(() => {
		let mql = matchMedia("(min-width: 640px)")
		function mqlChange(e: MediaQueryListEvent | MediaQueryList) {
			mobile = !e.matches
		}
		mqlChange(mql)
		mql.addEventListener("change", mqlChange)
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

<nav class="bg-[--ctp-surface0] w-full flex flex-col h-auto {browser ? '!h-32px' : ''}">
	<div class="flex flex-row items-center sm:hidden sm:border-none sm:color-transparent">
		<button
			class="i-tabler:menu-2 !w-32px !h-32px flex-grow-0 flex-shrink-0 {opened ? 'i-tabler:x' : ''}"
			onclick={toggleOpened}
			aria-expanded={opened}
			aria-controls="menu"
			aria-haspopup="menu"
		>
			Hamburger
		</button>
		<a
			href="/"
			class="absolute inset-0 w-10 h-32px py-1 mx-auto !color-[--ctp-text] decoration-none">Aigis</a
		>
	</div>
	<div
		class="z-10 bg-[--ctp-surface1] sm:bg-transparent justify-center content-center py-1 px-2 flex flex-col sm:flex-row sm:row-auto col-auto !sm:block focus:outline-none w-auto"
		class:!hidden={!opened}
	>
		<ul class="list-none px-0 flex flex-col sm:flex-row" id="menu" role="menu">
			<li role="menuitem">
				<a href="/" class="!color-[--ctp-text] decoration-none p-1">Home</a>
			</li>
			<li role="menuitem">
				<a href="/auth/login" class="!color-[--ctp-text] decoration-none p-1">Login</a>
			</li>
			<li role="menuitem">
				<a href="/auth/signup" class="!color-[--ctp-text] decoration-none p-1">Sign up</a>
			</li>
		</ul>
	</div>
</nav>
