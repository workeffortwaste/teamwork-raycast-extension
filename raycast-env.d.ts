/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Teamwork Site URL - For example: https://yourcompany.teamwork.com */
  "siteUrl": string,
  /** Teamwork API Token - A Teamwork bearer token/API token */
  "apiToken": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `search-tasks` command */
  export type SearchTasks = ExtensionPreferences & {}
  /** Preferences accessible in the `timer-menu-bar` command */
  export type TimerMenuBar = ExtensionPreferences & {}
  /** Preferences accessible in the `pause-timer` command */
  export type PauseTimer = ExtensionPreferences & {}
  /** Preferences accessible in the `resume-timer` command */
  export type ResumeTimer = ExtensionPreferences & {}
  /** Preferences accessible in the `stop-timer` command */
  export type StopTimer = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `search-tasks` command */
  export type SearchTasks = {}
  /** Arguments passed to the `timer-menu-bar` command */
  export type TimerMenuBar = {}
  /** Arguments passed to the `pause-timer` command */
  export type PauseTimer = {}
  /** Arguments passed to the `resume-timer` command */
  export type ResumeTimer = {}
  /** Arguments passed to the `stop-timer` command */
  export type StopTimer = {}
}

