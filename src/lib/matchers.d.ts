/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers"
import { Matchers, AsymmetricMatchers } from "bun:test"

declare module "bun:test" {
	interface Matchers<T> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
	//@ts-expect-error ugh
	interface AsymmetricMatchers extends TestingLibraryMatchers {}
}