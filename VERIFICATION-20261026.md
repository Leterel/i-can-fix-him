# I Can Fix Him 0.4.0 — Prüfung 26.10.2026

- 11/11 Node-Modelltests bestanden; Saveformat V1 unverändert.
- Fünf Chromeproben: browser-pause.mjs, browser-smoke.mjs, browser-save.mjs,
  browser-touch.mjs und browser-navigation.mjs bestanden.
- Neue Pauseprobe: tatsächliche P-/Space-Tasten und Buttonklicks; vollständige
  gespeicherte Zustände einschließlich time/cooldown/position nach 1,4 Sekunden
  Pause identisch. Keine Interaktion mit E/F/1 oder Bewegung während Pause.
  Fortsetzen holt Hintergrundzeit nicht nach; gehaltene Taste bleibt gestoppt.
- Dialog und gespeichertes Schichtende überstehen Pause/Fortsetzen. Laden im
  Pausemenü bleibt pausiert und stellt danach den passenden Dialog/Schichtbericht
  wieder her. Pause wird nicht als neues Savefeld gespeichert.
- Mobile 390px: Touch-Pause/Fortsetzen, kein horizontaler Überlauf. Desktop und
  Mobil-Pausemenü visuell geprüft. Keine App-Pageerrors, keine physischen Geräte.

Grenze: Sichtbarkeits-Autopause wurde als ausdrücklich synthetische
visibilitychange-Integration im echten Browser geprüft. Sowohl Headless-Minimieren
als auch ein isolierter headed Zweitabversuch (auch ohne Hintergrundflags) meldeten
in dieser Umgebung weiter document.visibilityState=visible. Deshalb kein Nachweis
für tatsächliches OS-Tabwechsel-/Minimierverhalten. Fehlgeschlagene Versuche endeten
mit Timeout, Testbrowser wurden danach geschlossen. Die Auslieferungsprobe fälscht
keinen nativen Erfolg und enthält den klar beschrifteten Ereignisfixture.

Reproduktion: npm test; nach npm ci mit installiertem Chrome die fünf genannten
Browserdateien per node ausführen. PLAYWRIGHT_MODULE kann vorhandenes Playwright
angeben. Die App benötigt zum Spielen keine npm-Pakete, nur Node.js 22+.
