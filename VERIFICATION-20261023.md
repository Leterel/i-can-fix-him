# Prüfung 23.10.2026

9/9 Node-Tests bestanden: Welt/Kollision, Konsequenzen und Enden sowie strikte
Speicherstandsvalidierung und vollständige Zustandsübernahme.

Drei echte Chrome-Proben bestanden: browser-smoke.mjs, browser-save.mjs,
browser-touch.mjs. Tatsächliche Tastatureingaben, Neuladen, NPC-Erinnerungen,
JSON-Download/-Import, abgelehnte ungültige Daten ohne Teiländerung, gespeichertes
Ende, gesperrter Browserspeicher, gehaltene Touchbuttons, Pointer-Abbruch und
390px-Layout. Keine App-Pageerrors. Screenshots visuell geprüft.
Nur eigene Loopbackserver und synthetische Daten; keine physischen Geräte.

Reproduktion: npm ci, npm test, danach node test/browser-smoke.mjs,
node test/browser-save.mjs und node test/browser-touch.mjs. Installiertes Chrome
nötig. PLAYWRIGHT_MODULE erlaubt alternativ eine vorhandene Playwright-Installation.
