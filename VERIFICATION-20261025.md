# I Can Fix Him 0.3.0 — Prüfung 25.10.2026

11/11 Node-Tests bestanden. Bestehende Welt-, Konsequenz- und Saveprüfungen sowie
neue Prüfung von abgeleiteten Zielen über echte Dialogentscheidungen, Speichern,
Laden und Weiterspielen. Kiosk-/Bußgeldfolge bleibt bei gesunkenem Chaos sichtbar,
gesperrter Dialog wird ausgewiesen. Navigation verändert den Zustand nicht.

Vier echte Chromeproben bestanden:

- browser-navigation.mjs: tatsächliche Tastaturbewegung, Karte folgt Spieler,
  vier NPC-/Gebäudemarker, Zielwahl ohne Teleportation, Gesprächsreichweite,
  gesetzte Grenze, Save/Reload-Position, Tastaturtoggle, 390px-Touchkarte.
- browser-smoke.mjs: Bewegung, Gespräche, Kosten, Schubsenfolgen, Reset,
  drei verschiedene Grenzen, Ende und Weiterspielen.
- browser-save.mjs: echter Reload, NPC-Erinnerungen, JSON-Download/-Import,
  atomar abgelehnte ungültige Dateien, gespeichertes Ende, gesperrter Speicher.
- browser-touch.mjs: gehaltene Touchbewegung, Abbruch, Gespräche, Konsequenzen,
  Save/Reload und 390px-Layout ohne horizontalen Überlauf.

Desktop und Mobile visuell geprüft. Nur synthetische Daten, eigene Loopbackserver,
keine physischen Geräte und keine persönlichen Aufnahmegeräte. Keine Pageerrors.
Saveformat V1 unverändert. Kein fertiges Vollspiel oder Test aller Browser.

Reproduktion: npm ci, npm test, dann die vier genannten Browserdateien mit node
starten. Chrome muss installiert sein. PLAYWRIGHT_MODULE erlaubt ein bereits
vorhandenes Playwright-Modul. Die App selbst braucht keine npm-Abhängigkeiten.
