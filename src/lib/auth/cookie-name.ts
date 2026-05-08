/**
 * Constante de cookie aislada en su propio archivo para que el bundle
 * de edge middleware no arrastre `node:crypto` (que no se ejecuta en
 * edge runtime aunque Turbopack lo emita).
 */

export const COOKIE_NAME = "maluwa_user";
